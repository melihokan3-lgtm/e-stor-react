import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "../../lib/supabase";
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
    let mounted = true;
    let unsubscribe: () => void = () => undefined;
    const restoreSession = async () => {
      const client = await getSupabaseClient();
      if (!mounted) return;
      if (!isSupabaseConfigured || !client) {
        setAuthLoading(false);
        return;
      }

      const { data } = await client.auth.getSession();
      if (!mounted) return;
      const restoredUser = mapSupabaseUser(data.session?.user);
      setUser(restoredUser);
      setToken(data.session?.access_token || null);
      setAuthLoading(false);

      const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        setUser(mapSupabaseUser(session?.user));
        setToken(session?.access_token || null);
        setAuthLoading(false);
        if (session) setIsAuthModalOpen(false);
      });
      unsubscribe = () => listener.subscription.unsubscribe();
    };

    const restoreTimer = window.setTimeout(() => { void restoreSession(); }, 0);
    return () => {
      mounted = false;
      window.clearTimeout(restoreTimer);
      unsubscribe();
    };
  }, []);

  const isLoggedIn = !!user && !!token;

  // --- LOGIN ---
  const loginUser = async (username: string, password: string): Promise<AuthUser> => {
    try {
      const normalizedUsername = username.trim().toLowerCase();
      if (!normalizedUsername || password.length === 0 || password.length > 128) {
        throw new Error("E-posta veya şifre hatalı.");
      }
      const client = await getSupabaseClient();
      if (isSupabaseConfigured && client) {
        if (!normalizedUsername.includes("@")) {
          throw new Error("Supabase hesabınıza e-posta adresinizle giriş yapın.");
        }
        const { data, error } = await client.auth.signInWithPassword({
          email: normalizedUsername,
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

  const signInWithGoogle = async (): Promise<void> => {
    const client = await getSupabaseClient();
    if (!isSupabaseConfigured || !client) {
      throw new Error("Google ile giriş için Supabase bağlantısını yapılandırın.");
    }

    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });

    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes("provider is not enabled") || message.includes("unsupported provider")) {
        throw new Error("Google sağlayıcısı Supabase Auth ayarlarında etkin değil.");
      }
      throw new Error(getAuthErrorMessage(error, "Google ile giriş başlatılamadı."));
    }
  };

  // --- REGISTER (simulated via /users/add) ---
  const registerUser = async ({ username, email, password, firstName, lastName }: RegisterInput): Promise<AuthUser> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedUsername = username.trim().slice(0, 64);
      const normalizedFirstName = firstName.trim().slice(0, 80);
      const normalizedLastName = lastName.trim().slice(0, 80);
      if (!normalizedEmail || !normalizedUsername || !normalizedFirstName || !normalizedLastName || password.length > 128) {
        throw new Error("Kayıt bilgileri geçersiz.");
      }
      const client = await getSupabaseClient();
      if (isSupabaseConfigured && client) {
        const { data, error } = await client.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { username: normalizedUsername, firstName: normalizedFirstName, lastName: normalizedLastName },
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
      if (isSupabaseConfigured && typeof updated.id === "string") {
        const profileUpdate = {
          username: updated.username.trim(),
          first_name: updated.firstName.trim(),
          last_name: updated.lastName.trim(),
          avatar_url: updated.image.trim() || null,
          phone: updated.phone.trim(),
          updated_at: new Date().toISOString(),
        };

        void getSupabaseClient().then((client) => {
          if (!client) return;
          return Promise.all([
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
            if (error && import.meta.env.DEV) console.error("Failed to persist profile changes", error);
          });
        });
      }

      return updated;
    });
  }, []);

  // --- LOGOUT ---
  const logout = useCallback(() => {
    void getSupabaseClient().then((client) => {
      if (client) client.auth.signOut().catch((error) => {
        if (import.meta.env.DEV) console.error("Failed to sign out", error);
      });
    });
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
        signInWithGoogle,
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
