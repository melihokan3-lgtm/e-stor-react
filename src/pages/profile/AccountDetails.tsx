import { useState, type KeyboardEvent } from "react";
import { useAuth } from "../../features/auth/AuthContext";

type EditableField = "name" | "username" | "email" | "phone";

export default function AccountDetails() {
  const { user, updateUser } = useAuth();

  // Tracks which field is currently being edited: null | "name" | "username" | "email" | "phone"
  const [editingField, setEditingField] = useState<EditableField | null>(null);

  // Form states for editing
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  if (!user) return null;

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Belirtilmemiş";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const startEditing = (field: EditableField) => {
    setEditingField(field);
    setError("");
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
    });
  };

  const cancelEditing = () => {
    setEditingField(null);
    setError("");
  };

  const handleSave = (field: EditableField) => {
    setError("");

    if (field === "name") {
      const fName = formData.firstName.trim();
      const lName = formData.lastName.trim();
      if (!fName || !lName) {
        setError("Lütfen hem ad hem de soyad giriniz.");
        return;
      }
      if (fName.length < 2 || lName.length < 2) {
        setError("Ad ve soyad en az 2 karakter olmalıdır.");
        return;
      }
      updateUser({ firstName: fName, lastName: lName });
      setEditingField(null);
      showToast("✨ Ad ve soyad başarıyla güncellendi!");
    } else if (field === "username") {
      const uname = formData.username.trim().toLowerCase();
      if (!uname) {
        setError("Kullanıcı adı boş bırakılamaz.");
        return;
      }
      if (uname.length < 3) {
        setError("Kullanıcı adı en az 3 karakter olmalıdır.");
        return;
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(uname)) {
        setError("Kullanıcı adı sadece harf, rakam, alt çizgi ve nokta içerebilir.");
        return;
      }
      updateUser({ username: uname });
      setEditingField(null);
      showToast("✨ Kullanıcı adı başarıyla güncellendi!");
    } else if (field === "email") {
      const emailVal = formData.email.trim();
      if (!emailVal) {
        setError("E-posta adresi boş bırakılamaz.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        setError("Lütfen geçerli bir e-posta adresi giriniz.");
        return;
      }
      updateUser({ email: emailVal });
      setEditingField(null);
      showToast("✨ E-posta adresi başarıyla güncellendi!");
    } else if (field === "phone") {
      const phoneVal = formData.phone.trim();
      if (phoneVal && phoneVal.length < 7) {
        setError("Lütfen geçerli bir telefon numarası giriniz.");
        return;
      }
      updateUser({ phone: phoneVal });
      setEditingField(null);
      showToast("✨ Telefon numarası başarıyla güncellendi!");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, field: EditableField) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave(field);
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  return (
    <div className="w-full">
      <h2 className="mb-10 text-[28px] font-extrabold text-[#111]">Account Details</h2>

      <div className="flex flex-col rounded-[20px] border border-[#f2f2f2] px-[30px] max-md:px-4">
        {/* ROW 1: Full Name */}
        <div className="flex items-center justify-between border-b border-[#f2f2f2] py-[30px] max-md:items-start max-md:gap-4">
          {editingField === "name" ? (
            <div className="flex w-full flex-col gap-3">
              <span className="text-[15px] font-bold text-[#111]">Edit Full Name</span>
              <div className="flex w-full flex-wrap gap-3">
                <input
                  type="text"
                  className={`h-[42px] min-w-[180px] flex-1 rounded-[10px] border-[1.5px] bg-white px-[14px] text-sm text-gray-900 outline-none transition focus:border-[#b6349a] focus:ring-[3px] focus:ring-[#b6349a]/[.12] ${error ? "border-red-500" : "border-gray-200"}`}
                  placeholder="First Name (Ad)"
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, firstName: e.target.value }));
                    if (error) setError("");
                  }}
                  onKeyDown={(e) => handleKeyDown(e, "name")}
                  autoFocus
                />
                <input
                  type="text"
                  className={`h-[42px] min-w-[180px] flex-1 rounded-[10px] border-[1.5px] bg-white px-[14px] text-sm text-gray-900 outline-none transition focus:border-[#b6349a] focus:ring-[3px] focus:ring-[#b6349a]/[.12] ${error ? "border-red-500" : "border-gray-200"}`}
                  placeholder="Last Name (Soyad)"
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, lastName: e.target.value }));
                    if (error) setError("");
                  }}
                  onKeyDown={(e) => handleKeyDown(e, "name")}
                />
              </div>
              {error && <span className="text-xs font-medium text-red-500">{error}</span>}
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-[#b6349a] to-[#831843] px-[18px] py-2 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(182,52,154,0.25)] transition hover:-translate-y-px hover:opacity-95 hover:shadow-[0_4px_12px_rgba(182,52,154,0.35)]"
                  onClick={() => handleSave("name")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Save
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-lg bg-gray-100 px-[14px] py-2 text-[13px] font-semibold text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
                  onClick={cancelEditing}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-[15px] font-bold text-[#111]">Full Name</span>
                <span className="text-sm font-medium text-[#aaa]">{fullName}</span>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-[#b6349a] transition hover:bg-[#b6349a]/[.05]"
                onClick={() => startEditing("name")}
                aria-label="Edit Full Name"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </button>
            </>
          )}
        </div>

        {/* ROW 2: Username */}
        <div className="flex items-center justify-between border-b border-[#f2f2f2] py-[30px] max-md:items-start max-md:gap-4">
          {editingField === "username" ? (
            <div className="flex w-full flex-col gap-3">
              <span className="text-[15px] font-bold text-[#111]">Edit Username</span>
              <div className="flex w-full flex-wrap gap-3">
                <input
                  type="text"
                  className={`h-[42px] min-w-[180px] flex-1 rounded-[10px] border-[1.5px] bg-white px-[14px] text-sm text-gray-900 outline-none transition focus:border-[#b6349a] focus:ring-[3px] focus:ring-[#b6349a]/[.12] ${error ? "border-red-500" : "border-gray-200"}`}
                  placeholder="Username (Kullanıcı Adı)"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, username: e.target.value }));
                    if (error) setError("");
                  }}
                  onKeyDown={(e) => handleKeyDown(e, "username")}
                  autoFocus
                />
              </div>
              {error && <span className="text-xs font-medium text-red-500">{error}</span>}
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-[#b6349a] to-[#831843] px-[18px] py-2 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(182,52,154,0.25)] transition hover:-translate-y-px hover:opacity-95 hover:shadow-[0_4px_12px_rgba(182,52,154,0.35)]"
                  onClick={() => handleSave("username")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Save
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-lg bg-gray-100 px-[14px] py-2 text-[13px] font-semibold text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
                  onClick={cancelEditing}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-[15px] font-bold text-[#111]">Username</span>
                <span className="text-sm font-medium text-[#aaa]">@{user.username}</span>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-[#b6349a] transition hover:bg-[#b6349a]/[.05]"
                onClick={() => startEditing("username")}
                aria-label="Edit Username"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </button>
            </>
          )}
        </div>

        {/* ROW 3: Email Address */}
        <div className="flex items-center justify-between border-b border-[#f2f2f2] py-[30px] max-md:items-start max-md:gap-4">
          {editingField === "email" ? (
            <div className="flex w-full flex-col gap-3">
              <span className="text-[15px] font-bold text-[#111]">Edit Email Address</span>
              <div className="flex w-full flex-wrap gap-3">
                <input
                  type="email"
                  className={`h-[42px] min-w-[180px] flex-1 rounded-[10px] border-[1.5px] bg-white px-[14px] text-sm text-gray-900 outline-none transition focus:border-[#b6349a] focus:ring-[3px] focus:ring-[#b6349a]/[.12] ${error ? "border-red-500" : "border-gray-200"}`}
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value }));
                    if (error) setError("");
                  }}
                  onKeyDown={(e) => handleKeyDown(e, "email")}
                  autoFocus
                />
              </div>
              {error && <span className="text-xs font-medium text-red-500">{error}</span>}
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-[#b6349a] to-[#831843] px-[18px] py-2 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(182,52,154,0.25)] transition hover:-translate-y-px hover:opacity-95 hover:shadow-[0_4px_12px_rgba(182,52,154,0.35)]"
                  onClick={() => handleSave("email")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Save
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-lg bg-gray-100 px-[14px] py-2 text-[13px] font-semibold text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
                  onClick={cancelEditing}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-[15px] font-bold text-[#111]">Email Address</span>
                <span className="text-sm font-medium text-[#aaa]">{user.email}</span>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-[#b6349a] transition hover:bg-[#b6349a]/[.05]"
                onClick={() => startEditing("email")}
                aria-label="Edit Email Address"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </button>
            </>
          )}
        </div>

        {/* ROW 4: Phone Number */}
        <div className="flex items-center justify-between py-[30px] max-md:items-start max-md:gap-4">
          {editingField === "phone" ? (
            <div className="flex w-full flex-col gap-3">
              <span className="text-[15px] font-bold text-[#111]">Edit Phone Number</span>
              <div className="flex w-full flex-wrap gap-3">
                <input
                  type="tel"
                  className={`h-[42px] min-w-[180px] flex-1 rounded-[10px] border-[1.5px] bg-white px-[14px] text-sm text-gray-900 outline-none transition focus:border-[#b6349a] focus:ring-[3px] focus:ring-[#b6349a]/[.12] ${error ? "border-red-500" : "border-gray-200"}`}
                  placeholder="+90 5XX XXX XX XX"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, phone: e.target.value }));
                    if (error) setError("");
                  }}
                  onKeyDown={(e) => handleKeyDown(e, "phone")}
                  autoFocus
                />
              </div>
              {error && <span className="text-xs font-medium text-red-500">{error}</span>}
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-[#b6349a] to-[#831843] px-[18px] py-2 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(182,52,154,0.25)] transition hover:-translate-y-px hover:opacity-95 hover:shadow-[0_4px_12px_rgba(182,52,154,0.35)]"
                  onClick={() => handleSave("phone")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Save
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-lg bg-gray-100 px-[14px] py-2 text-[13px] font-semibold text-gray-600 transition hover:bg-gray-200 hover:text-gray-900"
                  onClick={cancelEditing}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-[15px] font-bold text-[#111]">Phone Number</span>
                <span className="text-sm font-medium text-[#aaa]">{user.phone || "Not provided"}</span>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-[#b6349a] transition hover:bg-[#b6349a]/[.05]"
                onClick={() => startEditing("phone")}
                aria-label="Edit Phone Number"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed right-5 top-5 z-[1000] rounded-xl border border-[#b6349a]/20 bg-white px-5 py-3 text-sm font-semibold text-[#b6349a] shadow-[0_8px_24px_rgba(182,52,154,0.18)]">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
