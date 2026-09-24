import { getSupabaseClient } from "../../lib/supabase";

export async function deleteAccount(): Promise<void> {
  const client = await getSupabaseClient();
  if (!client) throw new Error("Hesap silme hizmeti şu anda kullanılamıyor.");

  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) throw new Error("Oturumunuz sona ermiş. Yeniden giriş yapın.");

  const { data, error } = await client.functions.invoke<{ deleted: boolean }>("delete-account", {
    method: "POST",
  });
  if (error || data?.deleted !== true) {
    throw new Error("Hesap silinemedi. Verileriniz korunuyor; lütfen daha sonra tekrar deneyin.");
  }
}
