import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import type { Product } from "../../types/product";

const PRODUCT_FIELDS = "id,title,price,description,category,image";
const FAKE_API_URL = "https://fakestoreapi.com/products";
const NOKSHA_API_URL = "https://fakestoreapi.noksha.dev/api/products";
const FAKE_PRODUCT_ID_OFFSET = 100000;
const NOKSHA_PRODUCT_ID_OFFSET = 200000;
let productsCache: Product[] | undefined;
let productsPromise: Promise<Product[]> | undefined;

interface NokshaProduct {
  _id?: number;
  title?: unknown;
  price?: unknown;
  discountedPrice?: unknown;
  description?: unknown;
  category?: unknown;
  image?: unknown;
  rating?: unknown;
  oldPrice?: unknown;
  isNew?: unknown;
  stock?: unknown;
  brand?: unknown;
}

interface NokshaPage {
  data?: unknown;
  totalPages?: unknown;
}

const fetchWithTimeout = async (url: string): Promise<unknown> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Supplemental product API failed with status ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

const normalizeNokshaProduct = (raw: unknown): Product | null => {
  if (!raw || typeof raw !== "object") return null;
  const product = raw as NokshaProduct;
  const remoteId = Number(product._id);
  const price = Number(product.discountedPrice ?? product.price);
  if (!Number.isInteger(remoteId) || remoteId < 1 || !Number.isFinite(price) || price < 0) return null;
  if (typeof product.title !== "string" || !product.title.trim() || typeof product.image !== "string") return null;

  const rating = Number(product.rating);
  return {
    id: NOKSHA_PRODUCT_ID_OFFSET + remoteId,
    title: product.title.trim(),
    price,
    description: typeof product.description === "string" ? product.description.trim() : "",
    category: `Collection · ${typeof product.category === "string" ? product.category.trim() : "general"}`,
    image: product.image.trim(),
    oldPrice: typeof product.oldPrice === "string" || typeof product.oldPrice === "number" ? product.oldPrice : undefined,
    isNew: product.isNew === true,
    stock: Number.isFinite(Number(product.stock)) ? Number(product.stock) : undefined,
    brand: typeof product.brand === "string" ? product.brand.trim() : undefined,
    ...(Number.isFinite(rating) ? { rating: { rate: rating } } : {}),
  };
};

const requestNokshaProducts = async (): Promise<Product[]> => {
  const firstPage = (await fetchWithTimeout(`${NOKSHA_API_URL}?page=1`)) as NokshaPage;
  const firstProducts = Array.isArray(firstPage.data) ? firstPage.data : [];
  const totalPages = Math.min(Math.max(Number(firstPage.totalPages) || 1, 1), 3);
  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => fetchWithTimeout(`${NOKSHA_API_URL}?page=${index + 2}`)),
  );
  const allRawProducts = [
    ...firstProducts,
    ...remainingPages.flatMap((page) => {
      const data = (page as NokshaPage).data;
      return Array.isArray(data) ? data : [];
    }),
  ];
  return allRawProducts
    .map(normalizeNokshaProduct)
    .filter((product): product is Product => product !== null);
};

const requestFakeProducts = async (): Promise<Product[]> => {
  const products = (await fetchWithTimeout(FAKE_API_URL)) as unknown;
  if (!Array.isArray(products)) throw new Error("Supplemental product API returned invalid data");
  return products.map((product) => {
    if (!product || typeof product !== "object") return null;
    const raw = product as Partial<Product>;
    const id = Number(raw.id);
    const price = Number(raw.price);
    if (!Number.isInteger(id) || id < 1 || !Number.isFinite(price) || price < 0 || typeof raw.title !== "string") return null;
    return {
    ...raw,
    ...product,
    id: FAKE_PRODUCT_ID_OFFSET + id,
    price,
    title: raw.title.trim(),
    description: typeof raw.description === "string" ? raw.description : "",
      category: `Featured · ${typeof raw.category === "string" ? raw.category : "general"}`,
    } as Product;
  }).filter((product): product is Product => product !== null);
};

const requireSupabase = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase yapılandırılmamış. Vercel Production ortam değişkenlerini kontrol edin.");
  }
  return supabase;
};

export const fetchProducts = async (): Promise<Product[]> => {
  if (productsCache) return productsCache;
  if (!productsPromise) {
    productsPromise = (async () => {
      const client = requireSupabase();
      const { data, error } = await client.from("products").select(PRODUCT_FIELDS).order("id", { ascending: false });
      if (error) throw error;

      const supabaseProducts = (data || []) as Product[];
      // Supplemental catalogs are useful for a fuller storefront, but they must
      // never hold the primary Supabase catalog hostage on a slow network.
      const supplementalResults = await Promise.race([
        Promise.allSettled([requestFakeProducts(), requestNokshaProducts()]),
        new Promise<PromiseSettledResult<Product[]>[]>((resolve) => setTimeout(() => resolve([]), 1500)),
      ]);
      const supplementalProducts = supplementalResults.flatMap((result) => {
        if (result.status === "fulfilled") return result.value;
        console.warn("Supplemental products could not be loaded; using available sources only.", result.reason);
        return [];
      });
      return [...supabaseProducts, ...supplementalProducts];
    })().then((products) => {
      productsCache = products;
      return products;
    });
  }
  try {
    return await productsPromise;
  } catch (error) {
    productsPromise = undefined;
    throw error;
  }
};

const fetchSupplementalProduct = async (url: string, remoteId: number, productId: number, categoryPrefix: string): Promise<Product | null> => {
  try {
    const raw = await fetchWithTimeout(`${url}/${remoteId}`);
    if (!raw || typeof raw !== "object") return null;
    const product = raw as Partial<Product>;
    const price = Number(product.price);
    if (typeof product.title !== "string" || !Number.isFinite(price) || price < 0) return null;
    return {
      ...product,
      id: productId,
      title: product.title.trim(),
      price,
      description: typeof product.description === "string" ? product.description : "",
      category: `${categoryPrefix} · ${typeof product.category === "string" ? product.category : "general"}`,
    } as Product;
  } catch {
    return null;
  }
};

export const fetchProductById = async (id: string | number): Promise<Product | null> => {
  if (!String(id).trim()) return null;

  const numericId = Number(id);
  if (Number.isInteger(numericId) && numericId >= NOKSHA_PRODUCT_ID_OFFSET) {
    return fetchSupplementalProduct(NOKSHA_API_URL, numericId - NOKSHA_PRODUCT_ID_OFFSET, numericId, "Collection");
  }
  if (Number.isInteger(numericId) && numericId >= FAKE_PRODUCT_ID_OFFSET) {
    try {
      const product = await fetchWithTimeout(`${FAKE_API_URL}/${numericId - FAKE_PRODUCT_ID_OFFSET}`) as Product;
      return product && typeof product.title === "string"
        ? { ...product, id: numericId, category: `Featured · ${product.category}` }
        : null;
    } catch {
      return null;
    }
  }

  const client = requireSupabase();
  const { data, error } = await client.from("products").select(PRODUCT_FIELDS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? (data as Product) : null;
};

export const cleanImageUrl = (url: unknown): string => {
  if (typeof url !== "string") return "";
  return url.replace(/[\[\]"]/g, "").trim();
};

export const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <rect width="100%" height="100%" fill="#e5e5e5"/>
      <text x="50%" y="50%" font-size="16" fill="#888" text-anchor="middle" dy=".3em">No Image</text>
    </svg>
  `);
