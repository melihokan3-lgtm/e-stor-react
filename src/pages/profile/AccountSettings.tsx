import { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { clearLocalAccountData, DEFAULT_SETTINGS, loadAccountSettings, saveAccountSettings, type AccountSettingsData } from "../../features/profile/settings";
type SettingsTab = "account" | "security" | "notifications" | "privacy" | "danger";

export default function AccountSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [settings, setSettings] = useState<AccountSettingsData>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(loadAccountSettings(user));
  }, [user]);

  const saveSettings = (newSettings: AccountSettingsData) => {
    setSettings(newSettings);
    saveAccountSettings(user, newSettings);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.currentTarget;
    const { name, value } = target;
    const val = target instanceof HTMLInputElement && target.type === "checkbox" ? target.checked : value;
    saveSettings({ ...settings, [name]: val });
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Yerel demo verilerinizi temizleyip çıkış yapmak istediğinize emin misiniz? Supabase hesabınız ve sunucudaki veriler silinmez."
    );
    if (confirmed) {
      clearLocalAccountData(user);
      logout();
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-tabs-container">
        <button className={`settings-tab-btn ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>Account Details</button>
        <button className={`settings-tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>Security & Password</button>
        <button className={`settings-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>Notifications</button>
        <button className={`settings-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`} onClick={() => setActiveTab('privacy')}>Privacy & Data</button>
        <button className={`settings-tab-btn danger ${activeTab === 'danger' ? 'active' : ''}`} onClick={() => setActiveTab('danger')}>Danger Zone</button>
      </div>

      {activeTab === 'account' && (
        <div className="settings-section-card">
          <div>
            <h3 className="settings-section-title">Account Details</h3>
            <p className="settings-section-subtitle">Manage your personal information and preferences.</p>
          </div>
          
          <div className="avatar-manage-row">
            <img src="https://i.pravatar.cc/150?img=12" alt="User Avatar" className="avatar-preview" />
            <div className="avatar-actions">
              <button className="btn-change-avatar">Change Avatar</button>
              <button className="btn-remove-avatar">Remove Photo</button>
            </div>
          </div>

          <div className="floating-row">
            <div className="floating-group">
              <input type="text" id="firstName" name="firstName" className="floating-input" placeholder=" " value={settings.firstName} onChange={handleInputChange} />
              <label htmlFor="firstName" className="floating-label">First Name</label>
            </div>
            <div className="floating-group">
              <input type="text" id="lastName" name="lastName" className="floating-input" placeholder=" " value={settings.lastName} onChange={handleInputChange} />
              <label htmlFor="lastName" className="floating-label">Last Name</label>
            </div>
          </div>

          <div className="floating-row">
            <div className="floating-group">
              <input type="tel" id="phone" name="phone" className="floating-input" placeholder=" " value={settings.phone} onChange={handleInputChange} />
              <label htmlFor="phone" className="floating-label">Phone Number</label>
            </div>
            <div className="floating-group">
              <input type="email" id="email" name="email" className="floating-input" placeholder=" " value={settings.email} onChange={handleInputChange} />
              <label htmlFor="email" className="floating-label">Email Address</label>
            </div>
          </div>

          <div className="floating-row">
            <div className="floating-group">
              <input type="date" id="dob" name="dob" className="floating-input" placeholder=" " value={settings.dob} onChange={handleInputChange} />
              <label htmlFor="dob" className="floating-label">Date of Birth</label>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #f3f4f6", margin: "8px 0" }} />
          
          <div>
            <h3 className="settings-section-title">Localization</h3>
            <p className="settings-section-subtitle">Set your regional preferences.</p>
          </div>

          <div className="floating-row">
            <div className="floating-group">
              <select id="language" name="language" className="floating-select" value={settings.language} onChange={handleInputChange}>
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
              </select>
              <label htmlFor="language" className="floating-label">App Language</label>
            </div>
            <div className="floating-group">
              <select id="currency" name="currency" className="floating-select" value={settings.currency} onChange={handleInputChange}>
                <option value="TRY">TRY (₺)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
              <label htmlFor="currency" className="floating-label">Currency</label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="settings-section-card">
          <div>
            <h3 className="settings-section-title">Security & Password</h3>
            <p className="settings-section-subtitle">Update your password and secure your account.</p>
          </div>

          <div className="floating-row">
            <div className="floating-group">
              <input type="password" id="currentPass" className="floating-input" placeholder=" " />
              <label htmlFor="currentPass" className="floating-label">Current Password</label>
            </div>
          </div>
          <div className="floating-row">
            <div className="floating-group">
              <input type="password" id="newPass" className="floating-input" placeholder=" " />
              <label htmlFor="newPass" className="floating-label">New Password</label>
            </div>
            <div className="floating-group">
              <input type="password" id="newPassConfirm" className="floating-input" placeholder=" " />
              <label htmlFor="newPassConfirm" className="floating-label">Confirm New Password</label>
            </div>
          </div>
          <div>
            <button className="add-new-card-main-btn" style={{ background: '#000' }}>Update Password</button>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #f3f4f6", margin: "8px 0" }} />

          <div className="toggle-row">
            <div className="toggle-info">
              <span className="toggle-title">Two-Factor Authentication (2FA)</span>
              <span className="toggle-desc">Add an extra layer of security to your account using an authenticator app or SMS.</span>
            </div>
            <label className="ios-toggle">
              <input type="checkbox" name="twoFactorAuth" checked={settings.twoFactorAuth} onChange={handleInputChange} />
              <span className="ios-slider"></span>
            </label>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #f3f4f6", margin: "8px 0" }} />

          <div>
            <h3 className="settings-section-title">Device History</h3>
            <p className="settings-section-subtitle" style={{ marginBottom: "16px" }}>Manage devices logged into your account.</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f9fafb", padding: "16px", borderRadius: "12px" }}>
              <div>
                <span style={{ fontWeight: 600 }}>Windows PC - Chrome</span>
                <span className="device-badge">Current Device</span>
                <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>Bursa, Turkey • Active now</div>
              </div>
            </div>
            <button className="btn-secondary" style={{ marginTop: "16px" }}>Log out of all other devices</button>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="settings-section-card">
          <div>
            <h3 className="settings-section-title">Notification Preferences</h3>
            <p className="settings-section-subtitle">Choose how you want to be notified about your account activities.</p>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <span className="toggle-title">Order Status Updates</span>
              <span className="toggle-desc">Get notified when your order is shipped, out for delivery, or delivered.</span>
            </div>
            <div style={{ width: "140px" }}>
              <select name="notifOrder" className="floating-select" style={{ padding: "8px 12px", fontSize: "13px" }} value={settings.notifOrder} onChange={handleInputChange}>
                <option value="email">Email Only</option>
                <option value="sms">SMS Only</option>
                <option value="both">Both</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <span className="toggle-title">Campaigns & Offers</span>
              <span className="toggle-desc">Receive exclusive deals, coupons, and promotional content.</span>
            </div>
            <label className="ios-toggle">
              <input type="checkbox" name="notifCampaigns" checked={settings.notifCampaigns} onChange={handleInputChange} />
              <span className="ios-slider"></span>
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <span className="toggle-title">Stock & Price Alerts</span>
              <span className="toggle-desc">Get an alert when items in your wishlist drop in price or are back in stock.</span>
            </div>
            <label className="ios-toggle">
              <input type="checkbox" name="notifPriceAlerts" checked={settings.notifPriceAlerts} onChange={handleInputChange} />
              <span className="ios-slider"></span>
            </label>
          </div>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="settings-section-card">
          <div>
            <h3 className="settings-section-title">Privacy & Data</h3>
            <p className="settings-section-subtitle">Manage your data permissions and privacy settings.</p>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <span className="toggle-title">Cookie Consent</span>
              <span className="toggle-desc">Allow processing of browsing data to improve your shopping experience.</span>
            </div>
            <label className="ios-toggle">
              <input type="checkbox" name="cookieConsent" checked={settings.cookieConsent} onChange={handleInputChange} />
              <span className="ios-slider"></span>
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <span className="toggle-title">Personalized Ads</span>
              <span className="toggle-desc">Receive product recommendations based on your past orders and browsing history.</span>
            </div>
            <label className="ios-toggle">
              <input type="checkbox" name="personalizedAds" checked={settings.personalizedAds} onChange={handleInputChange} />
              <span className="ios-slider"></span>
            </label>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #f3f4f6", margin: "8px 0" }} />

          <div>
            <h3 className="settings-section-title">Data Management (GDPR)</h3>
            <p className="settings-section-subtitle" style={{ marginBottom: "16px" }}>You can request an archive of all your personal data, including order history and preferences.</p>
            <button className="btn-secondary">Download My Data (JSON)</button>
          </div>
        </div>
      )}

      {activeTab === 'danger' && (
        <div className="settings-section-card" style={{ borderColor: "#fecaca" }}>
          <div className="danger-zone-box">
            <h3 className="danger-zone-title">Danger Zone</h3>
            <p style={{ color: "#7f1d1d", margin: 0, fontSize: "14px", lineHeight: 1.5 }}>
              This demo action clears local browser copies and signs you out. Your Supabase account and server data are not deleted.
            </p>
            <button className="btn-danger-outline" onClick={handleDeleteAccount}>
              Clear Local Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
