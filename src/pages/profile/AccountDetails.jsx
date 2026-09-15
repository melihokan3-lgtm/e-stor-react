import { useContext, useState } from "react";
import { AuthContext } from "../../features/auth/AuthContext";

export default function AccountDetails() {
  const { user, updateUser } = useContext(AuthContext);

  // Tracks which field is currently being edited: null | "name" | "username" | "email" | "phone"
  const [editingField, setEditingField] = useState(null);

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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const startEditing = (field) => {
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

  const handleSave = (field) => {
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

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave(field);
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  return (
    <div className="account-details-page">
      <h2 className="profile-page-title">Account Details</h2>

      <div className="account-details-box">
        {/* ROW 1: Full Name */}
        <div className="account-field-row">
          {editingField === "name" ? (
            <div className="account-field-edit-wrapper">
              <span className="account-field-label">Edit Full Name</span>
              <div className="account-edit-inputs-row">
                <input
                  type="text"
                  className={`account-inline-input ${error ? "has-error" : ""}`}
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
                  className={`account-inline-input ${error ? "has-error" : ""}`}
                  placeholder="Last Name (Soyad)"
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, lastName: e.target.value }));
                    if (error) setError("");
                  }}
                  onKeyDown={(e) => handleKeyDown(e, "name")}
                />
              </div>
              {error && <span className="account-edit-error">{error}</span>}
              <div className="account-edit-actions">
                <button
                  type="button"
                  className="account-save-btn"
                  onClick={() => handleSave("name")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Save
                </button>
                <button
                  type="button"
                  className="account-cancel-btn"
                  onClick={cancelEditing}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="account-field-info">
                <span className="account-field-label">Full Name</span>
                <span className="account-field-value">{fullName}</span>
              </div>
              <button
                type="button"
                className="account-edit-btn"
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
        <div className="account-field-row">
          {editingField === "username" ? (
            <div className="account-field-edit-wrapper">
              <span className="account-field-label">Edit Username</span>
              <div className="account-edit-inputs-row">
                <input
                  type="text"
                  className={`account-inline-input ${error ? "has-error" : ""}`}
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
              {error && <span className="account-edit-error">{error}</span>}
              <div className="account-edit-actions">
                <button
                  type="button"
                  className="account-save-btn"
                  onClick={() => handleSave("username")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Save
                </button>
                <button
                  type="button"
                  className="account-cancel-btn"
                  onClick={cancelEditing}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="account-field-info">
                <span className="account-field-label">Username</span>
                <span className="account-field-value">@{user.username}</span>
              </div>
              <button
                type="button"
                className="account-edit-btn"
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
        <div className="account-field-row">
          {editingField === "email" ? (
            <div className="account-field-edit-wrapper">
              <span className="account-field-label">Edit Email Address</span>
              <div className="account-edit-inputs-row">
                <input
                  type="email"
                  className={`account-inline-input ${error ? "has-error" : ""}`}
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
              {error && <span className="account-edit-error">{error}</span>}
              <div className="account-edit-actions">
                <button
                  type="button"
                  className="account-save-btn"
                  onClick={() => handleSave("email")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Save
                </button>
                <button
                  type="button"
                  className="account-cancel-btn"
                  onClick={cancelEditing}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="account-field-info">
                <span className="account-field-label">Email Address</span>
                <span className="account-field-value">{user.email}</span>
              </div>
              <button
                type="button"
                className="account-edit-btn"
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
        <div className="account-field-row border-none">
          {editingField === "phone" ? (
            <div className="account-field-edit-wrapper">
              <span className="account-field-label">Edit Phone Number</span>
              <div className="account-edit-inputs-row">
                <input
                  type="tel"
                  className={`account-inline-input ${error ? "has-error" : ""}`}
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
              {error && <span className="account-edit-error">{error}</span>}
              <div className="account-edit-actions">
                <button
                  type="button"
                  className="account-save-btn"
                  onClick={() => handleSave("phone")}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Save
                </button>
                <button
                  type="button"
                  className="account-cancel-btn"
                  onClick={cancelEditing}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="account-field-info">
                <span className="account-field-label">Phone Number</span>
                <span className="account-field-value">{user.phone || "Not provided"}</span>
              </div>
              <button
                type="button"
                className="account-edit-btn"
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
        <div className="payments-toast-notification">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
