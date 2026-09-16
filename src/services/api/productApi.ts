import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import type { Product } from "../../types/product";

const PRODUCT_FIELDS = "id,title,price,description,category,image";

const requireSupabase = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase yapılandırılmamış. Vercel Production ortam değişkenlerini kontrol edin.");
  }
  return supabase;
};

export const fetchProducts = async (): Promise<Product[]> => {
  const client = requireSupabase();
  const { data, error } = await client.from("products").select(PRODUCT_FIELDS).order("id", { ascending: false });
  if (error) throw error;
  return (data || []) as Product[];
};

export const fetchProductById = async (id: string | number): Promise<Product | null> => {
  if (!String(id).trim()) return null;

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
