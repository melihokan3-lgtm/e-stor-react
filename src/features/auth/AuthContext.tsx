import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import type { AuthContextValue, AuthUser, RegisterInput } from "../../types/auth";

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
};

const mapSupabaseUser = (authUser: SupabaseUser | null | undefined): AuthUser | null => {
  if (!authUser) return null;
  const metadata = (authUser.user_metadata || {}) as Record<string, string | undefined>;
  return {
    id: authUser.id,
    email: authUser.email || "",
    username: metadata.username || authUser.email?.split("@")[0] || "",
    firstName: metadata.firstName || "",
    lastName: metadata.lastName || "",
    image: metadata.avatarUrl || "",
    phone: metadata.phone || "",
  };
};

const getAuthErrorMessage = (error: { message?: string } | null | undefined, fallback: string): string => {
  const message = error?.message?.toLowerCase() || "";
  if (message.includes("invalid login credentials")) return "E-posta veya şifre hatalı.";
  if (message.includes("email not confirmed")) return "E-posta adresinizi doğruladıktan sonra giriş yapabilirsiniz.";
  if (message.includes("user already registered")) return "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.";
  if (message.includes("password should be at least")) return "Şifre en az 6 karakter olmalıdır.";
  if (message.includes("rate limit")) return "Çok fazla deneme yapıldı. Lütfen kısa süre sonra tekrar deneyin.";
  if (message.includes("invalid email")) return "Geçerli bir e-posta adresi girin.";
  return error?.message || fallback;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // initial load

  // Restore the Supabase-managed session on mount.
  useEffect(() => {
    const client = supabase;
    if (isSupabaseConfigured && client) {
      let mounted = true;
      const restoreSession = async () => {
        const { data } = await client.auth.getSession();
        if (!mounted) return;
        const restoredUser = mapSupabaseUser(data.session?.user);
        setUser(restoredUser);
        setToken(data.session?.access_token || null);
        setAuthLoading(false);
      };

      restoreSession();
      const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        setUser(mapSupabaseUser(session?.user));
        setToken(session?.access_token || null);
        setAuthLoading(false);
      });

      return () => {
        mounted = false;
        listener.subscription.unsubscribe();
      };
    }

    setAuthLoading(false);
  }, []);

  const isLoggedIn = !!user && !!token;

  // --- LOGIN ---
  const loginUser = async (username: string, password: string): Promise<AuthUser> => {
    try {
      if (isSupabaseConfigured && supabase) {
        if (!username.includes("@")) {
          throw new Error("Supabase hesabınıza e-posta adresinizle giriş yapın.");
        }
        const { data, error } = await supabase.auth.signInWithPassword({
          email: username.trim().toLowerCase(),
          password,
        });
        if (error) throw new Error(getAuthErrorMessage(error, "Giriş yapılamadı."));
        const userData = mapSupabaseUser(data.user);
        if (!userData || !data.session) throw new Error("Kullanıcı oturumu alınamadı.");
        setUser(userData);
        setToken(data.session.access_token);
        setIsAuthModalOpen(false);
        return userData;
      }

      throw new Error("Supabase bağlantısı yapılandırılmamış. Vercel Production ortam değişkenlerini kontrol edin.");

    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error("Giriş servisine ulaşılamadı. Lütfen tekrar deneyin.");
      }
      throw error;
    }
  };

  // --- REGISTER (simulated via /users/add) ---
  const registerUser = async ({ username, email, password, firstName, lastName }: RegisterInput): Promise<AuthUser> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { username, firstName, lastName },
          },
        });
        if (error) throw new Error(getAuthErrorMessage(error, "Kayıt işlemi başarısız oldu."));
        const userData = mapSupabaseUser(data.user);
        if (!userData) throw new Error("Kullanıcı bilgisi alınamadı.");
        if (!data.session) {
          throw new Error("Kayıt tamamlandı. E-posta adresinizi doğrulayıp giriş yapın.");
        }
        setUser(userData);
        setToken(data.session.access_token);
        setIsAuthModalOpen(false);
        return userData;
      }

      throw new Error("Supabase bağlantısı yapılandırılmamış. Vercel Production ortam değişkenlerini kontrol edin.");
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error("Kayıt servisine ulaşılamadı. Lütfen tekrar deneyin.");
      }
      throw error;
    }
  };

  // --- UPDATE USER PROFILE ---
  const updateUser = useCallback((newFields: Partial<AuthUser>): void => {
    setUser((prev) => {
      if (!prev) return prev;

      const updated = { ...prev, ...newFields };
      const client = supabase;
      if (isSupabaseConfigured && client && typeof updated.id === "string") {
        const profileUpdate = {
          username: updated.username.trim(),
          first_name: updated.firstName.trim(),
          last_name: updated.lastName.trim(),
          avatar_url: updated.image.trim() || null,
          phone: updated.phone.trim(),
          updated_at: new Date().toISOString(),
        };

        void Promise.all([
          client.from("profiles").update(profileUpdate).eq("id", updated.id),
          newFields.email && newFields.email !== prev.email
            ? client.auth.updateUser({ email: updated.email.trim().toLowerCase() })
            : Promise.resolve({ error: null }),
          client.auth.updateUser({
            data: {
              username: updated.username,
              firstName: updated.firstName,
              lastName: updated.lastName,
              avatarUrl: updated.image,
              phone: updated.phone,
            },
          }),
        ]).then(([profileResult, emailResult, metadataResult]) => {
          const error = profileResult.error || emailResult.error || metadataResult.error;
          if (error) console.error("Failed to persist profile changes", error);
        });
      }

      return updated;
    });
  }, []);

  // --- LOGOUT ---
  const logout = useCallback(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch((error) => console.error("Failed to sign out", error));
    }
    setUser(null);
    setToken(null);
  }, []);

  // --- MODAL CONTROL ---
  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn,
        authLoading,
        loginUser,
        registerUser,
        updateUser,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
