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

const AUTH_API = "https://dummyjson.com";
const REGISTERED_USER_KEY = "newRegisteredUser";

const hashPassword = async (password: string): Promise<string> => {
  const encodedPassword = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", encodedPassword);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const readRegisteredUser = (): { username: string; email: string; passwordHash: string; user: AuthUser } | null => {
  try {
    const storedUser = localStorage.getItem(REGISTERED_USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Failed to read locally registered user", error);
    return null;
  }
};

const saveRegisteredUser = (user: { username: string; email: string; passwordHash: string; user: AuthUser }): void => {
  localStorage.setItem(REGISTERED_USER_KEY, JSON.stringify(user));
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

  // Restore session from localStorage on mount
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

    try {
      const storedUser = localStorage.getItem("auth_user");
      const storedToken = localStorage.getItem("auth_token");
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        localStorage.setItem("currentUser", JSON.stringify(parsedUser));
      }
    } catch (e) {
      console.error("Failed to restore auth session", e);
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

      // --- LOCAL / DUMMY AUTH FALLBACK ---
      const locallyRegisteredUser = readRegisteredUser();
      const passwordHash = await hashPassword(password);
      const identifier = username.trim().toLowerCase();
      const matchesLocalUser =
        locallyRegisteredUser &&
        (locallyRegisteredUser.username.toLowerCase() === identifier ||
          locallyRegisteredUser.email.toLowerCase() === identifier) &&
        locallyRegisteredUser.passwordHash === passwordHash;

      if (matchesLocalUser) {
        const localToken = `local_${Date.now()}`;
        setUser(locallyRegisteredUser.user);
        setToken(localToken);
        localStorage.setItem("auth_user", JSON.stringify(locallyRegisteredUser.user));
        localStorage.setItem("auth_token", localToken);
        localStorage.setItem("currentUser", JSON.stringify(locallyRegisteredUser.user));
        setIsAuthModalOpen(false);
        return locallyRegisteredUser.user;
      }

      const res = await fetch(`${AUTH_API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = (await res.json()) as Record<string, string | number | undefined>;

      if (!res.ok) {
        throw new Error(String(data.message || "Kullanıcı adı veya şifre hatalı"));
      }

      const userData: AuthUser = {
        id: data.id ?? "",
        username: String(data.username ?? username),
        email: String(data.email ?? ""),
        firstName: String(data.firstName ?? ""),
        lastName: String(data.lastName ?? ""),
        image: String(data.image ?? ""),
        phone: String(data.phone ?? ""),
      };

      setUser(userData);
      const accessToken = String(data.accessToken ?? "");
      setToken(accessToken);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      localStorage.setItem("auth_token", accessToken);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      setIsAuthModalOpen(false);

      return userData;

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

      const res = await fetch(`${AUTH_API}/users/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, firstName, lastName }),
      });

      const data = (await res.json()) as Record<string, string | number | undefined>;

      if (!res.ok) {
        throw new Error(String(data.message || "Kayıt işlemi başarısız oldu"));
      }

      const userData: AuthUser = {
        id: data.id ?? "",
        username: String(data.username || username),
        email: String(data.email || email),
        firstName: String(data.firstName || firstName),
        lastName: String(data.lastName || lastName),
        image:
          String(data.image ||
            `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=b6349a&color=fff`,
          ),
        phone: "",
      };

      // Fake API kalıcı olmadığı için demo hesabını yerel fallback olarak sakla.
      saveRegisteredUser({
        username: userData.username,
        email: userData.email,
        passwordHash: await hashPassword(password),
        user: userData,
      });

      const fakeToken = "registered_" + Date.now();
      setUser(userData);
      setToken(fakeToken);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      localStorage.setItem("auth_token", fakeToken);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      setIsAuthModalOpen(false);

      return userData;
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
      try {
        localStorage.setItem("auth_user", JSON.stringify(updated));
        localStorage.setItem("currentUser", JSON.stringify(updated));
        const localReg = readRegisteredUser();
        if (localReg && (localReg.user?.id === updated.id || localReg.username === updated.username)) {
          saveRegisteredUser({
            ...localReg,
            username: updated.username || localReg.username,
            email: updated.email || localReg.email,
            user: updated,
          });
        }
      } catch (err) {
        console.error("Failed to persist updated user", err);
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
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("currentUser");
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
