import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import { readUserStorage, writeUserStorage } from "../utils/userStorage";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const userStorageId = user?.id ?? user?.email ?? user?.username ?? "guest";
  const [cart, setCart] = useState([]);
  const hydratedStorageId = useRef(null);
  const isHydrating = useRef(false);

  useEffect(() => {
    isHydrating.current = true;
    setCart(readUserStorage("cart", user, []));
    hydratedStorageId.current = String(userStorageId);
  }, [userStorageId]);

  // Save to local storage whenever cart changes
  useEffect(() => {
    if (isHydrating.current) {
      isHydrating.current = false;
      return;
    }
    if (hydratedStorageId.current === String(userStorageId)) {
      writeUserStorage("cart", user, cart);
    }
  }, [cart, user, userStorageId]);

  const addToCart = (product) => {
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

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.data.id !== id));
  };

  const updateQuantity = (id, delta) => {
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

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
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
