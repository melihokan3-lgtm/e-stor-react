import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import type { Product } from "../../types/product";

const BASE_URL = "https://fakestoreapi.com";
const PRODUCT_FIELDS = "id,title,price,description,category,image";

const requestJson = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("İstek zaman aşımına uğradı.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("products").select(PRODUCT_FIELDS).order("id", { ascending: false });
    if (error) throw error;
    return (data || []) as Product[];
  }

  const data = await requestJson<Product[]>(`${BASE_URL}/products`);
  if (!Array.isArray(data)) throw new Error("Ürün verisi geçersiz.");
  return data;
};

export const fetchProductById = async (id: string | number): Promise<Product | null> => {
  if (!String(id).trim()) return null;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("products").select(PRODUCT_FIELDS).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? (data as Product) : null;
  }

  try {
    return await requestJson<Product>(`${BASE_URL}/products/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("status 404")) return null;
    throw error;
  }
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
