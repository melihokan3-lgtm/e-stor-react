import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";
import { clearLocalAccountData, DEFAULT_SETTINGS, loadAccountSettings, saveAccountSettings, type AccountSettingsData } from "../../features/profile/settings";

type SettingsTab = "account" | "security" | "notifications" | "privacy" | "danger";
const tabs: Array<[SettingsTab, string]> = [["account", "Account Details"], ["security", "Security & Password"], ["notifications", "Notifications"], ["privacy", "Privacy & Data"], ["danger", "Danger Zone"]];
const inputClass = "w-full rounded-xl border border-[#e5e5e5] bg-white px-3 py-3 text-sm outline-none transition focus:border-[#b6349a] focus:ring-2 focus:ring-[#b6349a]/[.12]";
const sectionClass = "rounded-2xl border border-[#eee] bg-white p-6";

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [settings, setSettings] = useState<AccountSettingsData>(DEFAULT_SETTINGS);
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  useEffect(() => setSettings(loadAccountSettings(user)), [user]);
  const saveSettings = (next: AccountSettingsData) => { setSettings(next); saveAccountSettings(user, next); };
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const target = event.currentTarget; const value = target instanceof HTMLInputElement && target.type === "checkbox" ? target.checked : target.value; saveSettings({ ...settings, [target.name]: value }); };
  const handleDeleteAccount = () => { if (!window.confirm("Yerel demo verilerinizi temizleyip çıkış yapmak istediğinize emin misiniz? Supabase hesabınız silinmez.")) return; clearLocalAccountData(user); logout(); navigate("/", { replace: true }); };
  const handlePasswordUpdate = async (): Promise<void> => {
    setPasswordStatus("");
    if (!isSupabaseConfigured || !supabase) {
      setPasswordStatus("Supabase bağlantısı yapılandırılmamış.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus("Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (newPassword !== passwordConfirmation) {
      setPasswordStatus("Şifreler eşleşmiyor.");
      return;
    }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) {
      setPasswordStatus(error.message || "Şifre güncellenemedi.");
      return;
    }
    setNewPassword("");
    setPasswordConfirmation("");
    setPasswordStatus("Şifreniz güncellendi.");
  };
  const field = (id: keyof AccountSettingsData, label: string, type = "text") => <label className="block space-y-1.5 text-sm font-semibold text-[#555]">{label}<input id={id} name={id} type={type} value={String(settings[id] ?? "")} onChange={handleInputChange} className={inputClass} /></label>;

  return <div className="w-full space-y-5">
    <div className="flex gap-2 overflow-x-auto border-b border-[#eee] pb-2">{tabs.map(([id, label]) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition ${activeTab === id ? "bg-[#b6349a] text-white" : "text-[#777] hover:bg-[#f7f4f7]"}`}>{label}</button>)}</div>
    {activeTab === "account" && <section className={sectionClass}><h3 className="text-xl font-bold text-[#111]">Account Details</h3><p className="mt-1 text-sm text-[#777]">Manage your personal information and preferences.</p><div className="mt-6 flex items-center gap-4"><img src="https://i.pravatar.cc/150?img=12" alt="User Avatar" className="h-16 w-16 rounded-full object-cover" /><div><button type="button" className="rounded-lg bg-[#b6349a] px-3 py-2 text-xs font-semibold text-white">Change Avatar</button><button type="button" className="ml-2 rounded-lg bg-[#f3f3f3] px-3 py-2 text-xs font-semibold text-[#666]">Remove Photo</button></div></div><div className="mt-6 grid gap-4 md:grid-cols-2">{field("firstName", "First Name")}{field("lastName", "Last Name")}{field("phone", "Phone Number", "tel")}{field("email", "Email Address", "email")}{field("dob", "Date of Birth", "date")}{field("language", "App Language")}{field("currency", "Currency")}</div></section>}
    {activeTab === "security" && <section className={sectionClass}><h3 className="text-xl font-bold text-[#111]">Security & Password</h3><p className="mt-1 text-sm text-[#777]">Update your password and secure your account.</p><div className="mt-6 grid gap-4 md:grid-cols-2"><label className="space-y-1.5 text-sm font-semibold text-[#555]">New Password<input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.currentTarget.value)} className={inputClass} /></label><label className="space-y-1.5 text-sm font-semibold text-[#555]">Confirm New Password<input type="password" autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.currentTarget.value)} className={inputClass} /></label></div><button type="button" disabled={passwordSaving} onClick={() => void handlePasswordUpdate()} className="mt-5 rounded-lg bg-[#111] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{passwordSaving ? "Updating..." : "Update Password"}</button>{passwordStatus && <p className="mt-3 text-sm font-medium text-[#b6349a]" role="status">{passwordStatus}</p>}<label className="mt-8 flex items-center justify-between gap-4 border-t border-[#eee] pt-5 text-sm font-semibold text-[#333]">Two-Factor Authentication<input type="checkbox" name="twoFactorAuth" checked={settings.twoFactorAuth} onChange={handleInputChange} className="h-5 w-5 accent-[#b6349a]" /></label></section>}
    {activeTab === "notifications" && <section className={sectionClass}><h3 className="text-xl font-bold text-[#111]">Notification Preferences</h3><p className="mt-1 text-sm text-[#777]">Choose how you want to be notified.</p><div className="mt-6 space-y-4"><label className="flex items-center justify-between gap-4 rounded-xl bg-[#fafafa] p-4 text-sm font-semibold text-[#333]">Order Status Updates<select name="notifOrder" value={settings.notifOrder} onChange={handleInputChange} className="rounded-lg border border-[#ddd] px-3 py-2 text-sm font-normal"><option value="email">Email Only</option><option value="sms">SMS Only</option><option value="both">Both</option><option value="none">None</option></select></label><label className="flex items-center justify-between gap-4 rounded-xl bg-[#fafafa] p-4 text-sm font-semibold text-[#333]">Campaigns & Offers<input type="checkbox" name="notifCampaigns" checked={settings.notifCampaigns} onChange={handleInputChange} className="h-5 w-5 accent-[#b6349a]" /></label><label className="flex items-center justify-between gap-4 rounded-xl bg-[#fafafa] p-4 text-sm font-semibold text-[#333]">Stock & Price Alerts<input type="checkbox" name="notifPriceAlerts" checked={settings.notifPriceAlerts} onChange={handleInputChange} className="h-5 w-5 accent-[#b6349a]" /></label></div></section>}
    {activeTab === "privacy" && <section className={sectionClass}><h3 className="text-xl font-bold text-[#111]">Privacy & Data</h3><p className="mt-1 text-sm text-[#777]">Manage your data permissions.</p><div className="mt-6 space-y-4"><label className="flex items-center justify-between gap-4 rounded-xl bg-[#fafafa] p-4 text-sm font-semibold text-[#333]">Cookie Consent<input type="checkbox" name="cookieConsent" checked={settings.cookieConsent} onChange={handleInputChange} className="h-5 w-5 accent-[#b6349a]" /></label><label className="flex items-center justify-between gap-4 rounded-xl bg-[#fafafa] p-4 text-sm font-semibold text-[#333]">Personalized Ads<input type="checkbox" name="personalizedAds" checked={settings.personalizedAds} onChange={handleInputChange} className="h-5 w-5 accent-[#b6349a]" /></label></div><button type="button" className="mt-5 rounded-lg border border-[#ddd] px-4 py-2.5 text-sm font-semibold text-[#555]">Download My Data (JSON)</button></section>}
    {activeTab === "danger" && <section className="rounded-2xl border border-red-200 bg-red-50 p-6"><h3 className="text-xl font-bold text-red-800">Danger Zone</h3><p className="mt-2 text-sm leading-6 text-red-700">This demo action clears local browser copies and signs you out. Your Supabase account and server data are not deleted.</p><button type="button" onClick={handleDeleteAccount} className="mt-5 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100">Clear Local Data</button></section>}
  </div>;
}
