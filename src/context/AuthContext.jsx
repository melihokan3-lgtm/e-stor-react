import { createContext, useState, useEffect, useCallback } from "react";

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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); // initial load

  // Restore session from localStorage on mount
  useEffect(() => {
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
