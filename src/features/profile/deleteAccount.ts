import { FunctionsHttpError } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../lib/supabase";

export async function deleteAccount(): Promise<void> {
  const client = await getSupabaseClient();
  if (!client) throw new Error("Hesap silme hizmeti şu anda kullanılamıyor.");

  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError || !authData?.user) throw new Error("Oturumunuz sona ermiş. Yeniden giriş yapın.");

  const { data, error } = await client.functions.invoke<{ deleted: boolean }>("delete-account", {
    method: "POST",
  });
  if (error instanceof FunctionsHttpError && error.context instanceof Response) {
    if (error.context.status === 404) {
      throw new Error("Hesap silme hizmeti henüz yayımlanmamış. Lütfen site yöneticisine bildirin.");
    }
    if (error.context.status === 401) {
      throw new Error("Oturumunuz doğrulanamadı. Yeniden giriş yapıp tekrar deneyin.");
    }
  }
  if (error || data?.deleted !== true) {
    throw new Error("Hesap silme isteği tamamlanamadı. Yeniden denemeden önce hesabınızın durumunu kontrol edin.");
  }
}
