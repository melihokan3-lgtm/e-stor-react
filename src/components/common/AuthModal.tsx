import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import Button from "./ui/Button";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginUser, registerUser } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState("");

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (!isAuthModalOpen) {
      setError("");
      setLoading(false);
    }
  }, [isAuthModalOpen]);

  useEffect(() => {
    setError("");
  }, [mode]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent): void => {
      if (e.key === "Escape") closeAuthModal();
    };
    if (isAuthModalOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  // --- LOGIN HANDLER ---
  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    try {
      await loginUser(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kullanıcı adı veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  };

  // --- REGISTER HANDLER ---
  const handleRegister = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");

    if (
      !regFirstName.trim() ||
      !regLastName.trim() ||
      !regEmail.trim() ||
      !regUsername.trim() ||
      !regPassword.trim()
    ) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    if (regPassword.length < 4) {
      setError("Şifre en az 4 karakter olmalıdır.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
        firstName: regFirstName.trim(),
        lastName: regLastName.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt işlemi başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={closeAuthModal}>
      <div
        className="auth-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Button type="button" tone="ghost" className="auth-modal-close" onClick={closeAuthModal}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Button>

        {/* Header */}
        <div className="auth-modal-header">
          <div className="auth-modal-logo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#b6349a"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h2 className="auth-modal-title">
            {mode === "login" ? "Hoş Geldiniz!" : "Hesap Oluştur"}
          </h2>
          <p className="auth-modal-subtitle">
            {mode === "login"
              ? "Hesabınıza giriş yapın"
              : "Yeni bir hesap oluşturun"}
          </p>
        </div>

        {/* Tabs */}
        <div className="auth-modal-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Giriş Yap
          </button>
          <button
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => setMode("register")}
          >
            Kayıt Ol
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="auth-error-msg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === "login" && (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-input-group">
              <label>Kullanıcı Adı</label>
              <div className="auth-input-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#aaa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  placeholder="emilys"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Şifre</label>
              <div className="auth-input-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#aaa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Yükleniyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </Button>

            <p className="auth-hint-text">
              Test: <strong>emilys</strong> / <strong>emilyspass</strong>
            </p>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === "register" && (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-input-row">
              <div className="auth-input-group">
                <label>Ad</label>
                <div className="auth-input-wrapper">
                  <input
                    type="text"
                    placeholder="John"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                  />
                </div>
              </div>
              <div className="auth-input-group">
                <label>Soyad</label>
                <div className="auth-input-wrapper">
                  <input
                    type="text"
                    placeholder="Doe"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="auth-input-group">
              <label>Kullanıcı Adı</label>
              <div className="auth-input-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#aaa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  placeholder="johndoe"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>E-posta</label>
              <div className="auth-input-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#aaa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Şifre</label>
              <div className="auth-input-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#aaa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Şifre Tekrar</label>
              <div className="auth-input-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#aaa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={regPasswordConfirm}
                  onChange={(e) => setRegPasswordConfirm(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Yükleniyor...
                </>
              ) : (
                "Kayıt Ol"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
