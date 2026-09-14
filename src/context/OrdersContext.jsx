import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import { readUserStorage, writeUserStorage } from "../utils/userStorage";
import { fetchUserOrders, isSupabaseDataEnabled, saveUserOrder, updateUserOrderAddress } from "../services/supabaseData";

export const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const userStorageId = user?.id ?? user?.email ?? user?.username ?? "guest";
  const hydratedStorageId = useRef(null);
  const isHydrating = useRef(false);

  useEffect(() => {
    isHydrating.current = true;
    const hydrate = async () => {
      try {
        setOrders(isSupabaseDataEnabled(user) ? await fetchUserOrders(user) : readUserStorage("orders", user, []));
      } catch (error) {
        console.error("Failed to load orders", error);
        setOrders([]);
      } finally {
        hydratedStorageId.current = String(userStorageId);
      }
    };
    hydrate();
  }, [userStorageId]);

  useEffect(() => {
    if (isHydrating.current) {
      isHydrating.current = false;
      return;
    }
    if (hydratedStorageId.current === String(userStorageId)) {
      writeUserStorage("orders", user, orders);
    }
  }, [orders, user, userStorageId]);

  const addOrder = (order) => {
    const nextOrder = { ...order, userId: user?.id ?? user?.email ?? user?.username };
    setOrders((prev) => [nextOrder, ...prev]);
    if (isSupabaseDataEnabled(user)) {
      saveUserOrder(user, nextOrder).catch((error) => console.error("Failed to save order", error));
    }
  };

  const updateOrderAddress = (orderId, newAddress) => {
    setOrders((prev) => {
      const updated = prev.map((order) => {
        if (String(order.id) === String(orderId)) {
          return { ...order, deliveryAddress: newAddress };
        }
        return order;
      });
      if (isSupabaseDataEnabled(user)) {
        updateUserOrderAddress(user, orderId, newAddress).catch((error) => console.error("Failed to update order address", error));
      } else writeUserStorage("orders", user, updated);
      return updated;
    });
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderAddress }}>
      {children}
    </OrdersContext.Provider>
  );
}
