import { translate } from "../../features/i18n/LanguageContext";
import { useState } from "react";
import { ProfileDetailRow } from "../../components/profile";
import { useAuth } from "../../features/auth/AuthContext";
import SeoMeta from "../../components/common/SeoMeta";

type EditableField = "name" | "username" | "email" | "phone";
type ProfileForm = Record<"firstName" | "lastName" | "username" | "email" | "phone", string>;

export default function AccountDetails() {
  const { user, updateUser } = useAuth();
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [formData, setFormData] = useState<ProfileForm>({ firstName: "", lastName: "", username: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  if (!user) return null;

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

  const handleSave = (field: EditableField) => {
    setError("");
    let message = "";

    if (field === "name") {
      const firstName = formData.firstName.trim();
      const lastName = formData.lastName.trim();
      if (!firstName || !lastName) return setError("Lütfen hem ad hem de soyad giriniz.");
      if (firstName.length < 2 || lastName.length < 2) return setError("Ad ve soyad en az 2 karakter olmalıdır.");
      updateUser({ firstName, lastName });
      message = "✨ Ad ve soyad başarıyla güncellendi!";
    } else if (field === "username") {
      const username = formData.username.trim().toLowerCase();
      if (!username) return setError("Kullanıcı adı boş bırakılamaz.");
      if (username.length < 3) return setError("Kullanıcı adı en az 3 karakter olmalıdır.");
      if (!/^[a-zA-Z0-9_.-]+$/.test(username)) return setError("Kullanıcı adı sadece harf, rakam, alt çizgi ve nokta içerebilir.");
      updateUser({ username });
      message = "✨ Kullanıcı adı başarıyla güncellendi!";
    } else if (field === "email") {
      const email = formData.email.trim();
      if (!email) return setError("E-posta adresi boş bırakılamaz.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Lütfen geçerli bir e-posta adresi giriniz.");
      updateUser({ email });
      message = "✨ E-posta adresi başarıyla güncellendi!";
    } else {
      const phone = formData.phone.trim();
      if (phone && phone.length < 7) return setError("Lütfen geçerli bir telefon numarası giriniz.");
      updateUser({ phone });
      message = "✨ Telefon numarası başarıyla güncellendi!";
    }

    setEditingField(null);
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const changeField = (name: string, value: string) => {
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (error) setError("");
  };

  const rows = [
    { id: "name", label: "Full Name", value: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Not provided", inputs: [
      { name: "firstName", value: formData.firstName, placeholder: "First Name" },
      { name: "lastName", value: formData.lastName, placeholder: "Last Name" },
    ] },
    { id: "username", label: "Username", value: `@${user.username}`, inputs: [
      { name: "username", value: formData.username, placeholder: "Username (Kullanıcı Adı)" },
    ] },
    { id: "email", label: "Email Address", value: user.email, inputs: [
      { name: "email", value: formData.email, placeholder: "Email Address", type: "email" as const },
    ] },
    { id: "phone", label: "Phone Number", value: user.phone || "Not provided", inputs: [
      { name: "phone", value: formData.phone, placeholder: "+90 5XX XXX XX XX", type: "tel" as const },
    ] },
  ] as const;

  return (
    <div className="w-full">
      <SeoMeta title={translate("Hesap Bilgilerim | E-Storee")} description="E-Storee hesap bilgilerinizi ve kişisel profil bilgilerinizi yönetin." canonicalPath="/profile/details" robots="noindex,nofollow" />
      <h1 className="mb-10 text-[28px] font-extrabold text-[#111]">{translate("Account Details")}</h1>
      <div className="flex flex-col rounded-[20px] border border-[#f2f2f2] px-[30px] max-md:px-4">
        {rows.map((row, index) => (
          <ProfileDetailRow
            key={row.id}
            label={row.label}
            value={row.value}
            inputs={[...row.inputs]}
            editing={editingField === row.id}
            error={editingField === row.id ? error : ""}
            last={index === rows.length - 1}
            onEdit={() => startEditing(row.id)}
            onChange={changeField}
            onSave={() => handleSave(row.id)}
            onCancel={() => { setEditingField(null); setError(""); }}
          />
        ))}
      </div>
      {toastMessage && (
        <div className="fixed right-5 top-5 z-[1000] rounded-xl border border-[#b6349a]/20 bg-white px-5 py-3 text-sm font-semibold text-[#b6349a] shadow-[0_8px_24px_rgba(182,52,154,0.18)]" role="status">{toastMessage}</div>
      )}
    </div>
  );
}
