import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import { readUserStorage, writeUserStorage } from "../utils/userStorage";

export const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const userStorageId = user?.id ?? user?.email ?? user?.username ?? "guest";
  const hydratedStorageId = useRef(null);
  const isHydrating = useRef(false);

  useEffect(() => {
    isHydrating.current = true;
    setOrders(readUserStorage("orders", user, []));
    hydratedStorageId.current = String(userStorageId);
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
    setOrders((prev) => [
      { ...order, userId: user?.id ?? user?.email ?? user?.username },
      ...prev,
    ]);
  };

  const updateOrderAddress = (orderId, newAddress) => {
    setOrders((prev) => {
      const updated = prev.map((order) => {
        if (String(order.id) === String(orderId)) {
          return { ...order, deliveryAddress: newAddress };
        }
        return order;
      });
      writeUserStorage("orders", user, updated);
      return updated;
    });
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderAddress }}>
      {children}
    </OrdersContext.Provider>
  );
}
