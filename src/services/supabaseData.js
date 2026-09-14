import { isSupabaseConfigured, supabase } from "../lib/supabase";

const requireUserId = (user) => {
  if (!user?.id) throw new Error("Supabase işlemi için aktif kullanıcı gerekli.");
  return user.id;
};

export const isSupabaseDataEnabled = (user) => Boolean(isSupabaseConfigured && supabase && user?.id);

export const fetchUserCart = async (user) => {
  const userId = requireUserId(user);
  const { data, error } = await supabase.from("carts").select("items").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data?.items || [];
};

export const saveUserCart = async (user, items) => {
  const userId = requireUserId(user);
  const { error } = await supabase.from("carts").upsert({ user_id: userId, items, updated_at: new Date().toISOString() });
  if (error) throw error;
};

export const fetchUserOrders = async (user) => {
  const userId = requireUserId(user);
  const { data, error } = await supabase
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
    items: order.items || [],
    date: new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
  }));
};

export const saveUserOrder = async (user, order) => {
  const userId = requireUserId(user);
  const { data, error } = await supabase.from("orders").insert({
    user_id: userId,
    status: order.status || "Processing",
    total: order.total,
    delivery_address: order.deliveryAddress || "",
    items: order.items || [],
  }).select("id,status,total,delivery_address,items,created_at").single();
  if (error) throw error;
  return data;
};

export const updateUserOrderAddress = async (user, orderId, address) => {
  const userId = requireUserId(user);
  const { error } = await supabase.from("orders").update({ delivery_address: address }).eq("id", orderId).eq("user_id", userId);
  if (error) throw error;
};

export const fetchUserAddresses = async (user) => {
  const userId = requireUserId(user);
  const { data, error } = await supabase.from("addresses").select("id,label,address,is_default,created_at").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const saveUserAddress = async (user, address) => {
  const userId = requireUserId(user);
  const { data, error } = await supabase.from("addresses").insert({ user_id: userId, label: address.label, address: address.address }).select("id,label,address,is_default,created_at").single();
  if (error) throw error;
  return data;
};

export const deleteUserAddress = async (user, addressId) => {
  const userId = requireUserId(user);
  const { error } = await supabase.from("addresses").delete().eq("id", addressId).eq("user_id", userId);
  if (error) throw error;
};
