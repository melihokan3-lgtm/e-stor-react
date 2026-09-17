import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AuthContext } from "../auth/AuthContext";
import { readUserStorage, writeUserStorage } from "../../utils/userStorage";
import { fetchUserOrders, isSupabaseDataEnabled, saveUserOrder, updateUserOrderAddress } from "../../services/supabase/data";
import type { CreateOrderInput, Order, OrdersContextValue } from "../../types/order";

export const OrdersContext = createContext<OrdersContextValue | null>(null);

export const useOrders = (): OrdersContextValue => {
  const context = useContext(OrdersContext);
  if (!context) throw new Error("useOrders must be used inside OrdersProvider.");
  return context;
};

export function OrdersProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  const user = auth?.user ?? null;
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersOwnerId, setOrdersOwnerId] = useState<string | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const userStorageId = user?.id ?? user?.email ?? user?.username ?? "guest";
  const activeStorageId = useRef(String(userStorageId));
  activeStorageId.current = String(userStorageId);
  const currentOwnerId = String(userStorageId);
  const visibleOrders = ordersOwnerId === currentOwnerId ? orders : [];
  const visibleLoading = ordersLoading || ordersOwnerId !== currentOwnerId;

  useEffect(() => {
    let active = true;
    setOrdersLoading(true);
    setOrdersError("");
    const hydrate = async () => {
      try {
        const loaded = isSupabaseDataEnabled(user) ? await fetchUserOrders(user) : readUserStorage<Order[]>("orders", user, []);
        if (active) setOrders(loaded);
      } catch (error) {
        console.error("Failed to load orders", error);
        if (active) {
          setOrders([]);
          setOrdersError("Siparişler yüklenemedi. Lütfen sayfayı yenileyin.");
        }
      } finally {
        if (active) {
          setOrdersOwnerId(String(userStorageId));
          setOrdersLoading(false);
        }
      }
    };
    void hydrate();
    return () => { active = false; };
  }, [userStorageId]);

  useEffect(() => {
    if (ordersOwnerId === currentOwnerId && !ordersLoading && !ordersError && !isSupabaseDataEnabled(user)) {
      writeUserStorage("orders", user, orders);
    }
  }, [orders, ordersOwnerId, ordersLoading, ordersError, user, userStorageId]);

  const addOrder = async (order: CreateOrderInput): Promise<Order> => {
    if (visibleLoading) throw new Error("Siparişler hâlâ yükleniyor.");
    const nextOrder: Order = {
      ...order,
      id: order.id ?? `${Date.now()}`,
      userId: user?.id ?? user?.email ?? user?.username,
      createdAt: new Date().toISOString(),
    };
    const persisted = isSupabaseDataEnabled(user) ? await saveUserOrder(user, nextOrder) : nextOrder;
    if (activeStorageId.current !== currentOwnerId) throw new Error("Aktif kullanıcı değişti.");
    const savedOrder = { ...nextOrder, ...persisted };
    setOrdersError("");
    setOrders((prev) => [savedOrder, ...prev]);
    return savedOrder;
  };

  const updateOrderAddress = (orderId: Order["id"], newAddress: string): void => {
    if (ordersOwnerId !== currentOwnerId) return;
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
    <OrdersContext.Provider value={{ orders: visibleOrders, ordersLoading: visibleLoading, ordersError, addOrder, updateOrderAddress }}>
      {children}
    </OrdersContext.Provider>
  );
}
