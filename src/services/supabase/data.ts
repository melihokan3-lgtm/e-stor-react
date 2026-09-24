import { getSupabaseClient, isSupabaseConfigured } from "../../lib/supabase";
import type { AuthUser } from "../../types/auth";
import type { Address } from "../../types/address";
import type { CartItem } from "../../types/cart";
import type { CreateOrderInput, Order, OrderItem } from "../../types/order";

const getClient = async () => {
  const client = await getSupabaseClient();
  if (!client) throw new Error("Supabase bağlantısı yapılandırılmamış.");
  return client;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type SupabaseOrderRow = {
  id: string;
  status: string;
  total: number | string;
  delivery_address: string;
  items: unknown;
  created_at: string;
};

const mapOrder = (order: SupabaseOrderRow): Order => ({
  id: order.id,
  status: order.status,
  total: Number(order.total),
  deliveryAddress: order.delivery_address,
  items: (order.items || []) as OrderItem[],
  date: new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
  createdAt: order.created_at,
});

const requireUserId = (user: AuthUser | null): string => {
  if (!user?.id) throw new Error("Supabase işlemi için aktif kullanıcı gerekli.");
  const userId = String(user.id);
  if (!UUID_PATTERN.test(userId)) {
    throw new Error("Bu hesap Supabase kullanıcısı değil. Çıkış yapıp e-posta adresinizle giriş yapın.");
  }
  return userId;
};

export const isSupabaseDataEnabled = (user: AuthUser | null): boolean => Boolean(
  isSupabaseConfigured && user?.id && UUID_PATTERN.test(String(user.id)),
);

export const fetchUserCart = async (user: AuthUser | null): Promise<CartItem[]> => {
  const userId = requireUserId(user);
  const { data, error } = await (await getClient()).from("carts").select("items").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return (data?.items || []) as CartItem[];
};

export const saveUserCart = async (user: AuthUser | null, items: CartItem[]): Promise<void> => {
  const userId = requireUserId(user);
  const { error } = await (await getClient()).from("carts").upsert({ user_id: userId, items, updated_at: new Date().toISOString() });
  if (error) throw error;
};

export const fetchUserOrders = async (user: AuthUser | null): Promise<Order[]> => {
  const userId = requireUserId(user);
  const { data, error } = await (await getClient())
    .from("orders")
    .select("id,status,total,delivery_address,items,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((order) => mapOrder(order as SupabaseOrderRow));
};

export const saveUserOrder = async (user: AuthUser | null, order: CreateOrderInput): Promise<Order> => {
  requireUserId(user);
  void order;
  throw new Error("Doğrulanmış ödeme altyapısı kurulana kadar sipariş oluşturulamaz.");
};

export const updateUserOrderAddress = async (user: AuthUser | null, orderId: string | number, address: string): Promise<void> => {
  const userId = requireUserId(user);
  const normalizedAddress = address.trim();
  if (!normalizedAddress || normalizedAddress.length > 500) throw new Error("Geçerli bir teslimat adresi gerekli.");
  const { error } = await (await getClient()).from("orders").update({ delivery_address: normalizedAddress }).eq("id", orderId).eq("user_id", userId);
  if (error) throw error;
};

export const fetchUserAddresses = async (user: AuthUser | null): Promise<Address[]> => {
  const userId = requireUserId(user);
  const { data, error } = await (await getClient()).from("addresses").select("id,label,address,is_default,created_at").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as Address[];
};

export const saveUserAddress = async (user: AuthUser | null, address: Pick<Address, "label" | "address">): Promise<Address> => {
  const userId = requireUserId(user);
  const label = address.label.trim().slice(0, 80);
  const normalizedAddress = address.address.trim().slice(0, 500);
  if (!normalizedAddress) throw new Error("Geçerli bir adres gerekli.");
  const { data, error } = await (await getClient()).from("addresses").insert({ user_id: userId, label: label || "Saved address", address: normalizedAddress }).select("id,label,address,is_default,created_at").single();
  if (error) throw error;
  return data as Address;
};

export const deleteUserAddress = async (user: AuthUser | null, addressId: string): Promise<void> => {
  const userId = requireUserId(user);
  const { error } = await (await getClient()).from("addresses").delete().eq("id", addressId).eq("user_id", userId);
  if (error) throw error;
};
