import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "../auth/AuthContext";
import { readUserStorage, writeUserStorage } from "../../utils/userStorage";
import { fetchUserOrders, isSupabaseDataEnabled, updateUserOrderAddress } from "../../services/supabase/data";
import type { CreateOrderInput, Order, OrdersContextValue } from "../../types/order";

export const OrdersContext = createContext<OrdersContextValue | null>(null);

const sanitizeOrders = (value: unknown): Order[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((order): order is Order => {
    if (!order || typeof order !== "object") return false;
    const candidate = order as Partial<Order>;
    const total = candidate.total;
    return Boolean(
      (typeof candidate.id === "string" || typeof candidate.id === "number")
      && typeof candidate.status === "string"
      && typeof total === "number" && Number.isFinite(total) && total >= 0
      && typeof candidate.deliveryAddress === "string"
      && Array.isArray(candidate.items),
    );
  });
};

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
  const currentOwnerId = String(userStorageId);
  const visibleOrders = ordersOwnerId === currentOwnerId ? orders : [];
  const visibleLoading = ordersLoading || ordersOwnerId !== currentOwnerId;

  useEffect(() => {
    let active = true;
    setOrdersLoading(true);
    setOrdersError("");
    const hydrate = async () => {
      const demoOrders = sanitizeOrders(readUserStorage<Order[]>("demoOrders", user, []))
        .filter((order) => String(order.id).startsWith("demo_"))
        .map((order) => ({ ...order, status: "Demo", isDemo: true }));
      try {
        const realOrders = sanitizeOrders(isSupabaseDataEnabled(user) ? await fetchUserOrders(user) : readUserStorage<Order[]>("orders", user, []));
        const loaded = [...demoOrders, ...realOrders];
        if (active) setOrders(loaded);
      } catch (error) {
        console.error("Failed to load orders", error);
        if (active) {
          setOrders(demoOrders);
          setOrdersError("Gerçek siparişler yüklenemedi. Demo kayıtlar bu tarayıcıda gösteriliyor.");
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
      writeUserStorage("orders", user, orders.filter((order) => !order.isDemo));
    }
  }, [orders, ordersOwnerId, ordersLoading, ordersError, user, userStorageId]);

  const addOrder = async (order: CreateOrderInput): Promise<Order> => {
    if (!user?.id || ordersOwnerId !== currentOwnerId || ordersLoading) {
      throw new Error("Demo sipariş için giriş yapıp hesabınızın yüklenmesini bekleyin.");
    }
    if (!Array.isArray(order.items) || order.items.length === 0 || !Number.isFinite(order.total) || order.total < 0) {
      throw new Error("Demo sipariş bilgileri geçersiz.");
    }
    const demoOrder: Order = {
      ...order,
      id: `demo_${crypto.randomUUID()}`,
      status: "Demo",
      isDemo: true,
      createdAt: new Date().toISOString(),
    };
    const demoOrders = sanitizeOrders(readUserStorage<Order[]>("demoOrders", user, []))
      .filter((item) => String(item.id).startsWith("demo_"));
    writeUserStorage("demoOrders", user, [demoOrder, ...demoOrders]);
    setOrders((previous) => [demoOrder, ...previous]);
    return demoOrder;
  };

  const updateOrderAddress = (orderId: Order["id"], newAddress: string): void => {
    if (ordersOwnerId !== currentOwnerId) return;
    if (orders.some((order) => String(order.id) === String(orderId) && order.isDemo)) return;
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
