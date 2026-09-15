import { createContext, useState, useEffect, useCallback } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export const AuthContext = createContext();

const AUTH_API = "https://dummyjson.com";
const REGISTERED_USER_KEY = "newRegisteredUser";

const hashPassword = async (password) => {
  const encodedPassword = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", encodedPassword);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const readRegisteredUser = () => {
  try {
    const storedUser = localStorage.getItem(REGISTERED_USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Failed to read locally registered user", error);
    return null;
  }
};

const saveRegisteredUser = (user) => {
  localStorage.setItem(REGISTERED_USER_KEY, JSON.stringify(user));
};

const mapSupabaseUser = (authUser) => {
  if (!authUser) return null;
  const metadata = authUser.user_metadata || {};
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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // initial load

  // Restore session from localStorage on mount
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      let mounted = true;
      const restoreSession = async () => {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        const restoredUser = mapSupabaseUser(data.session?.user);
        setUser(restoredUser);
        setToken(data.session?.access_token || null);
        setAuthLoading(false);
      };

      restoreSession();
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
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
  const loginUser = async (username, password) => {
    try {
      const isEmail = username.includes("@");
      let supabaseError = null;

      if (isSupabaseConfigured && supabase && isEmail) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: username.trim().toLowerCase(),
          password,
        });
        
        if (!error && data.user) {
          const userData = mapSupabaseUser(data.user);
          setUser(userData);
          setToken(data.session?.access_token || null);
          setIsAuthModalOpen(false);
          return userData;
        }
        supabaseError = error;
        console.warn("Supabase login failed, falling back to local auth:", error?.message);
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

      try {
        const res = await fetch(`${AUTH_API}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Kullanıcı adı veya şifre hatalı");
        }

        const userData = {
          id: data.id,
          username: data.username,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          image: data.image,
          phone: data.phone || "",
        };

        setUser(userData);
        setToken(data.accessToken);
        localStorage.setItem("auth_user", JSON.stringify(userData));
        localStorage.setItem("auth_token", data.accessToken);
        localStorage.setItem("currentUser", JSON.stringify(userData));
        setIsAuthModalOpen(false);

        return userData;
      } catch (fallbackError) {
        // If Supabase was attempted and failed, show Supabase's error if the fallback also fails
        // (unless it's a generic message, in which case prioritize the more helpful local error)
        throw supabaseError ? new Error(supabaseError.message || "Giriş başarısız oldu.") : fallbackError;
      }

    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error("Giriş servisine ulaşılamadı. Lütfen tekrar deneyin.");
      }
      throw error;
    }
  };

  // --- REGISTER (simulated via /users/add) ---
  const registerUser = async ({ username, email, password, firstName, lastName }) => {
    try {
      let supabaseError = null;
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: { username, firstName, lastName },
          },
        });
        
        if (!error && data.user) {
          const userData = mapSupabaseUser(data.user);
          if (!data.session) {
            throw new Error("Kayıt tamamlandı. E-posta adresinizi doğrulayıp giriş yapın.");
          }
          setUser(userData);
          setToken(data.session.access_token);
          setIsAuthModalOpen(false);
          return userData;
        }
        
        supabaseError = error || new Error("Supabase kayıt yapılamadı");
        console.warn("Supabase registration failed, falling back to local auth:", supabaseError?.message);
      }

      try {
        const res = await fetch(`${AUTH_API}/users/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password, firstName, lastName }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Kayıt işlemi başarısız oldu");
        }

        const userData = {
          id: data.id,
          username: data.username || username,
          email: data.email || email,
          firstName: data.firstName || firstName,
          lastName: data.lastName || lastName,
          image:
            data.image ||
            `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=b6349a&color=fff`,
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
      } catch (fallbackError) {
        throw supabaseError ? new Error(supabaseError.message || "Kayıt işlemi başarısız oldu.") : fallbackError;
      }
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error("Kayıt servisine ulaşılamadı. Lütfen tekrar deneyin.");
      }
      throw error;
    }
  };

  // --- UPDATE USER PROFILE ---
  const updateUser = useCallback((newFields) => {
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
