import { useEffect, useState } from "react";
import { fetchProducts } from "../services/api";

let productsPromise;
let productsCache;

const loadProducts = () => {
  if (productsCache) return Promise.resolve(productsCache);
  if (!productsPromise) {
    productsPromise = fetchProducts().then((products) => {
      productsCache = products;
      return products;
    });
  }
  return productsPromise;
};

export default function useProducts() {
  const [products, setProducts] = useState(productsCache || []);
  const [loading, setLoading] = useState(!productsCache);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    loadProducts()
      .then((data) => {
        if (!active) return;
        setProducts(data);
        setError("");
      })
      .catch(() => {
        if (active) setError("Ürünler yüklenemedi. Lütfen tekrar deneyin.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { products, loading, error };
}
