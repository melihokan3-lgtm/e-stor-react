import { isSupabaseConfigured, supabase } from "../lib/supabase";

const BASE_URL = "https://fakestoreapi.com";

const requestJson = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
    return response.json();
  } catch (error) {
    if (error.name === "AbortError") throw new Error("İstek zaman aşımına uğradı.");
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const fetchProducts = async () => {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("products").select("id,title,price,description,category,image").order("id", { ascending: false });
    if (error) throw error;
    if (data?.length) return data;
  }
  const data = await requestJson(`${BASE_URL}/products`);
  if (!Array.isArray(data)) throw new Error("Ürün verisi geçersiz.");
  return data;
};

export const fetchProductById = async (id) => {
  if (!id || !String(id).trim()) return null;
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("products").select("id,title,price,description,category,image").eq("id", id).maybeSingle();
    if (error) throw error;
    if (data) return data;
  }
  try {
    return await requestJson(`${BASE_URL}/products/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error.message.includes("status 404")) return null;
    throw error;
  }
};

export const cleanImageUrl = (url) => {
  if (!url) return "";
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
