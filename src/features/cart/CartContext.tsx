import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AuthContext } from "../auth/AuthContext";
import { readUserStorage, writeUserStorage } from "../../utils/userStorage";
import { fetchUserCart, isSupabaseDataEnabled, saveUserCart } from "../../services/supabase/data";
import type { CartContextValue, CartItem } from "../../types/cart";
import type { Product } from "../../types/product";

export const CartContext = createContext<CartContextValue | null>(null);

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider.");
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const auth = useContext(AuthContext);
  const user = auth?.user ?? null;
  const userStorageId = user?.id ?? user?.email ?? user?.username ?? "guest";
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastAddedProduct, setLastAddedProduct] = useState<string | null>(null);
  const hydratedStorageId = useRef<string | null>(null);
  const isHydrating = useRef(false);

  useEffect(() => {
    isHydrating.current = true;
    const hydrate = async () => {
      try {
        setCart(isSupabaseDataEnabled(user) ? await fetchUserCart(user) : readUserStorage("cart", user, []));
      } catch (error) {
        console.error("Failed to load cart", error);
        setCart([]);
      } finally {
        hydratedStorageId.current = String(userStorageId);
      }
    };
    hydrate();
  }, [userStorageId]);

  // Save to local storage whenever cart changes
  useEffect(() => {
    if (isHydrating.current) {
      isHydrating.current = false;
      return;
    }
    if (hydratedStorageId.current !== String(userStorageId)) return;
    if (isSupabaseDataEnabled(user)) {
      saveUserCart(user, cart).catch((error) => console.error("Failed to save cart", error));
    } else writeUserStorage("cart", user, cart);
  }, [cart, user, userStorageId]);

  const addToCart = (product: Product): void => {
    setLastAddedProduct(product.title);
    setCart((prev) => {
      const existingItem = prev.find((item) => item.data.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.data.id === product.id ? { ...item, unit: item.unit + 1 } : item,
        );
      }
      return [...prev, { data: product, unit: 1 }];
    });
  };

  const removeFromCart = (id: Product["id"]): void => {
    setCart((prev) => prev.filter((item) => item.data.id !== id));
  };

  const updateQuantity = (id: Product["id"], delta: number): void => {
    setCart((prev) => {
      const updatedCart = prev.map((item) => {
        if (item.data.id === id) {
          const newUnit = item.unit + delta;
          return { ...item, unit: newUnit };
        }
        return item;
      });
      return updatedCart.filter((item) => item.unit > 0);
    });
  };

  const totalItems = cart.reduce((total, item) => total + (item.unit || 1), 0);
  const totalPrice = cart.reduce(
    (total, item) => total + item.data.price * item.unit,
    0,
  );
  const tax = totalPrice * 0.1;
  const subtotal = totalPrice + tax;

  const clearCart = (): void => {
    setCart([]);
  };

  const dismissCartToast = (): void => setLastAddedProduct(null);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        lastAddedProduct,
        dismissCartToast,
        totalItems,
        totalPrice,
        tax,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
