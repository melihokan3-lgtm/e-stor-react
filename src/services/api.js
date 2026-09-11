const BASE_URL = "https://fakestoreapi.com";

export const fetchProducts = async () => {
  const response = await fetch(`${BASE_URL}/products`);
  if (!response.ok) throw new Error("Ürünler yüklenemedi");
  return response.json();
};

export const fetchProductById = async (id) => {
  const response = await fetch(`${BASE_URL}/products/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Ürün yüklenemedi");
  return response.json();
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
