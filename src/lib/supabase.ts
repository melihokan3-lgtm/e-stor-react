import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const normalizedUrl = typeof supabaseUrl === "string" ? supabaseUrl.trim() : "";
const normalizedKey = typeof supabasePublishableKey === "string" ? supabasePublishableKey.trim() : "";
const isValidSupabaseUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(normalizedUrl);

export const isSupabaseConfigured = Boolean(isValidSupabaseUrl && normalizedKey);

let clientPromise: Promise<SupabaseClient | null> | undefined;

export const getSupabaseClient = async (): Promise<SupabaseClient | null> => {
  if (!isSupabaseConfigured) return null;
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(normalizedUrl, normalizedKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }),
    );
  }
  return clientPromise;
};
