import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import type { AuthUser } from "../../types/auth";
import type { Address } from "../../types/address";
import type { CartItem } from "../../types/cart";
import type { CreateOrderInput, Order, OrderItem } from "../../types/order";

const getClient = () => {
  if (!supabase) throw new Error("Supabase bağlantısı yapılandırılmamış.");
  return supabase;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const requireUserId = (user: AuthUser | null): string => {
  if (!user?.id) throw new Error("Supabase işlemi için aktif kullanıcı gerekli.");
  const userId = String(user.id);
  if (!UUID_PATTERN.test(userId)) {
    throw new Error("Bu hesap Supabase kullanıcısı değil. Çıkış yapıp e-posta adresinizle giriş yapın.");
  }
  return userId;
};

export const isSupabaseDataEnabled = (user: AuthUser | null): boolean => Boolean(
  isSupabaseConfigured && supabase && user?.id && UUID_PATTERN.test(String(user.id)),
);

export const fetchUserCart = async (user: AuthUser | null): Promise<CartItem[]> => {
  const userId = requireUserId(user);
  const { data, error } = await getClient().from("carts").select("items").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return (data?.items || []) as CartItem[];
};

export const saveUserCart = async (user: AuthUser | null, items: CartItem[]): Promise<void> => {
  const userId = requireUserId(user);
  const { error } = await getClient().from("carts").upsert({ user_id: userId, items, updated_at: new Date().toISOString() });
  if (error) throw error;
};

export const fetchUserOrders = async (user: AuthUser | null): Promise<Order[]> => {
  const userId = requireUserId(user);
  const { data, error } = await getClient()
    .from("orders")
    .select("id,status,total,delivery_address,items,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((order) => ({
    id: order.id,
    status: order.status,
    total: Number(order.total),
    deliveryAddress: order.delivery_address,
    items: (order.items || []) as OrderItem[],
    date: new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    createdAt: order.created_at,
  }));
};

export const saveUserOrder = async (user: AuthUser | null, order: CreateOrderInput): Promise<Order> => {
  const userId = requireUserId(user);
  if (!Number.isFinite(order.total) || order.total < 0) throw new Error("Geçersiz sipariş toplamı.");
  if (!order.deliveryAddress?.trim()) throw new Error("Teslimat adresi gerekli.");
  if (!Array.isArray(order.items) || order.items.length === 0 || order.items.length > 100) {
    throw new Error("Geçersiz sipariş ürünleri.");
  }
  const hasInvalidItem = order.items.some((item) =>
    !Number.isInteger(item.id)
    || item.id < 1
    || !Number.isFinite(item.price)
    || item.price < 0
    || !Number.isInteger(item.qty)
    || item.qty < 1
    || item.qty > 100,
  );
  if (hasInvalidItem) throw new Error("Geçersiz sipariş ürünü.");
  const { data, error } = await getClient().from("orders").insert({
    user_id: userId,
    status: order.status || "Processing",
    total: order.total,
    delivery_address: order.deliveryAddress || "",
    items: order.items || [],
  }).select("id,status,total,delivery_address,items,created_at").single();
  if (error) throw error;
  return {
    id: data.id,
    status: data.status,
    total: Number(data.total),
    deliveryAddress: data.delivery_address,
    items: (data.items || []) as OrderItem[],
    date: new Date(data.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    createdAt: data.created_at,
  };
};

export const updateUserOrderAddress = async (user: AuthUser | null, orderId: string | number, address: string): Promise<void> => {
  const userId = requireUserId(user);
  const { error } = await getClient().from("orders").update({ delivery_address: address }).eq("id", orderId).eq("user_id", userId);
  if (error) throw error;
};

export const fetchUserAddresses = async (user: AuthUser | null): Promise<Address[]> => {
  const userId = requireUserId(user);
  const { data, error } = await getClient().from("addresses").select("id,label,address,is_default,created_at").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as Address[];
};

export const saveUserAddress = async (user: AuthUser | null, address: Pick<Address, "label" | "address">): Promise<Address> => {
  const userId = requireUserId(user);
  const { data, error } = await getClient().from("addresses").insert({ user_id: userId, label: address.label, address: address.address }).select("id,label,address,is_default,created_at").single();
  if (error) throw error;
  return data as Address;
};

export const deleteUserAddress = async (user: AuthUser | null, addressId: string): Promise<void> => {
  const userId = requireUserId(user);
  const { error } = await getClient().from("addresses").delete().eq("id", addressId).eq("user_id", userId);
  if (error) throw error;
};
