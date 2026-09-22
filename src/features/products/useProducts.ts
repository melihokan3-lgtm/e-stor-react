import { useEffect, useState } from "react";
import {
  fetchProducts,
  fetchSupplementalProducts,
} from "../../services/api/productApi";
import type { Product } from "../../types/product";

let productsPromise: Promise<Product[]> | undefined;
let productsCache: Product[] | undefined;

const uniqueProducts = (products: Product[]): Product[] => {
  const seen = new Set<number>();
  return products.filter((product) => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
};

const scheduleIdleWork = (callback: () => void): (() => void) => {
  if (typeof window === "undefined") return () => undefined;
  const idleWindow = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (typeof idleWindow.requestIdleCallback === "function") {
    const idleId = idleWindow.requestIdleCallback(callback, { timeout: 2000 });
    return () => idleWindow.cancelIdleCallback?.(idleId);
  }
  const timeoutId = window.setTimeout(callback, 2000);
  return () => window.clearTimeout(timeoutId);
};

const loadProducts = (): Promise<Product[]> => {
  if (productsCache) return Promise.resolve(productsCache);
  if (!productsPromise) {
    productsPromise = fetchProducts().then((products) => {
      productsCache = uniqueProducts(products);
      return productsCache;
    });
  }
  return productsPromise;
};

export default function useProducts(): { products: Product[]; loading: boolean; error: string } {
  const [products, setProducts] = useState<Product[]>(productsCache || []);
  const [loading, setLoading] = useState(!productsCache);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let cancelIdleWork: () => void = () => undefined;

    loadProducts()
      .then((data) => {
        if (!active) return;
        setProducts(uniqueProducts(data));
        setError("");

        cancelIdleWork = scheduleIdleWork(() => {
          void fetchSupplementalProducts().then((supplementalProducts) => {
            if (active && supplementalProducts.length > 0) {
              setProducts(uniqueProducts([...data, ...supplementalProducts]));
            }
          });
        });
      })
      .catch(() => {
        if (active) setError("Ürünler yüklenemedi. Lütfen tekrar deneyin.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      cancelIdleWork();
    };
  }, []);

  return { products, loading, error };
}
