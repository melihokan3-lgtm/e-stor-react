import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import Button from "./ui/Button";

const authFieldClass = "flex min-h-12 items-center gap-2 rounded-xl border border-[#e8e8e8] bg-[#fafafa] px-3.5 transition focus-within:border-[#b6349a] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#b6349a]/10";
const authInputClass = "min-w-0 w-full flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-[#222] outline-none placeholder:text-[#b8b8b8]";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginUser, registerUser } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      setSuccess("");
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
    setSuccess("");

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
    setSuccess("");

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

    if (regPassword.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
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
      const message = err instanceof Error ? err.message : "Kayıt işlemi başarısız oldu.";
      if (message.startsWith("Kayıt tamamlandı.")) {
        setSuccess(message);
        setMode("login");
        setUsername(regEmail.trim().toLowerCase());
        setPassword("");
        setRegPassword("");
        setRegPasswordConfirm("");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-[rgba(22,16,22,0.55)] p-5" onClick={closeAuthModal}>
      <div
        className="relative max-h-[90vh] w-full max-w-[500px] overflow-y-auto rounded-[20px] bg-white p-8 shadow-[0_25px_80px_rgba(0,0,0,0.25)] max-[480px]:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Button type="button" tone="ghost" className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full text-[#888] hover:bg-[#fff5fc] hover:text-[#b6349a]" onClick={closeAuthModal}>
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
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-[#fff0fa]">
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
          <h2 className="m-0 text-2xl font-bold text-[#222]">
            {mode === "login" ? "Hoş Geldiniz!" : "Hesap Oluştur"}
          </h2>
          <p className="mt-1 text-sm text-[#888]">
            {mode === "login"
              ? "Hesabınıza giriş yapın"
              : "Yeni bir hesap oluşturun"}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex border-b border-[#eee]">
          <button
            type="button"
            className={`flex-1 border-b-2 py-3 text-sm font-semibold transition ${mode === "login" ? "border-[#b6349a] text-[#b6349a]" : "border-transparent text-[#999]"}`}
            onClick={() => { setSuccess(""); setMode("login"); }}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            className={`flex-1 border-b-2 py-3 text-sm font-semibold transition ${mode === "register" ? "border-[#b6349a] text-[#b6349a]" : "border-transparent text-[#999]"}`}
            onClick={() => { setSuccess(""); setMode("register"); }}
          >
            Kayıt Ol
          </button>
        </div>

        {/* Status message */}
        {success && (
          <div
            className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] font-medium leading-[1.45] text-green-700"
            role="status"
          >
            {success}
          </div>
        )}
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600" role="alert">
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
          <form className="grid gap-4" onSubmit={handleLogin}>
            <div className="grid gap-1.5">
              <label className="text-sm font-semibold text-[#555]">E-posta</label>
              <div className={authFieldClass}>
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
                <input className={authInputClass}
                  type="email"
                  placeholder="ornek@email.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-semibold text-[#555]">Şifre</label>
              <div className={authFieldClass}>
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
                <input className={authInputClass}
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
              className="mt-1 w-full rounded-lg bg-[#b6349a] px-4 py-3 text-sm font-bold text-white hover:bg-[#98277f]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Yükleniyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </Button>

            <p className="text-center text-xs text-[#999]">
              Test: <strong>emilys</strong> / <strong>emilyspass</strong>
            </p>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === "register" && (
          <form className="grid gap-4" onSubmit={handleRegister}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label className="text-sm font-semibold text-[#555]">Ad</label>
                <div className={authFieldClass}>
                  <input className={authInputClass}
                    type="text"
                    placeholder="John"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-semibold text-[#555]">Soyad</label>
                <div className={authFieldClass}>
                  <input className={authInputClass}
                    type="text"
                    placeholder="Doe"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-1.5">
              <label>Kullanıcı Adı</label>
              <div className={authFieldClass}>
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
                  className={authInputClass}
                  type="text"
                  placeholder="johndoe"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label>E-posta</label>
              <div className={authFieldClass}>
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
                  className={authInputClass}
                  type="email"
                  placeholder="john@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label>Şifre</label>
              <div className={authFieldClass}>
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
                  className={authInputClass}
                  type="password"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label>Şifre Tekrar</label>
              <div className={authFieldClass}>
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
                  className={authInputClass}
                  type="password"
                  placeholder="••••••••"
                  value={regPasswordConfirm}
                  onChange={(e) => setRegPasswordConfirm(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="mt-1 w-full rounded-lg bg-[#b6349a] px-4 py-3 text-sm font-bold text-white hover:bg-[#98277f]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
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
