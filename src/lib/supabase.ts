import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const normalizedUrl = typeof supabaseUrl === "string" ? supabaseUrl.trim() : "";
const normalizedKey = typeof supabasePublishableKey === "string" ? supabasePublishableKey.trim() : "";
const isValidSupabaseUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(normalizedUrl);
const projectRef = isValidSupabaseUrl ? new URL(normalizedUrl).hostname.split(".")[0] : "";
const sessionKey = `sb-${projectRef}-auth-session`;

export const isSupabaseConfigured = Boolean(isValidSupabaseUrl && normalizedKey);

let clientPromise: Promise<SupabaseClient | null> | undefined;

export const clearBrowserAuthSession = (): void => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(sessionKey);
    window.sessionStorage.removeItem(`${sessionKey}-user`);
    window.sessionStorage.removeItem(`${sessionKey}-code-verifier`);
  } catch {
    // Storage may already have been blocked or cleared by the browser.
  }
};

export const getSupabaseClient = async (): Promise<SupabaseClient | null> => {
  if (!isSupabaseConfigured) return null;
  if (!clientPromise) {
    let sessionStorage: Storage | undefined;
    // Supabase's default auth storage is localStorage. Remove only this project's
    // legacy session before switching to per-tab storage; never copy tokens.
    if (typeof window !== "undefined") {
      try {
        sessionStorage = window.sessionStorage;
        const legacyKey = `sb-${projectRef}-auth-token`;
        window.localStorage.removeItem(legacyKey);
        window.localStorage.removeItem(`${legacyKey}-user`);
        window.localStorage.removeItem(`${legacyKey}-code-verifier`);
      } catch {
        // Access to localStorage may be blocked even when sessionStorage works.
      }
      // Never silently fall back to localStorage for authentication tokens.
      if (!sessionStorage) throw new Error("Güvenli oturum depolaması bu tarayıcıda kullanılamıyor.");
    }
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(normalizedUrl, normalizedKey, {
        auth: {
          storageKey: sessionKey,
          storage: sessionStorage,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      }),
    );
  }
  return clientPromise;
};
