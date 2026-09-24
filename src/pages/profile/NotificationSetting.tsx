import { translate } from "../../features/i18n/LanguageContext";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { ProfileEmptyState, ProfileFilterTabs, ProfileToast } from "../../components/profile";
import { loadProfileNotifications, saveProfileNotifications, type NotificationType, type ProfileNotification } from "../../features/profile/notifications";
import SeoMeta from "../../components/common/SeoMeta";

export default function NotificationSetting() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ProfileNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setNotifications(loadProfileNotifications(user));
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Mark a single notification as read/unread
  const handleToggleRead = (id: ProfileNotification["id"]) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, isRead: !n.isRead } : n
    );
    setNotifications(updated);
    saveProfileNotifications(user, updated);
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    saveProfileNotifications(user, updated);
    showToast("Tüm bildirimler okundu olarak işaretlendi.");
  };

  // Delete a notification
  const handleDelete = (id: ProfileNotification["id"]) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    saveProfileNotifications(user, updated);
    showToast("Bildirim silindi.");
  };

  // Clear all notifications
  const handleClearAll = () => {
    if (notifications.length === 0) return;
    if (window.confirm(translate("Are you sure you want to clear all notifications?"))) {
      setNotifications([]);
      saveProfileNotifications(user, []);
      showToast("Tüm bildirimler temizlendi.");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.isRead;
    return true;
  });

  // Render SVG icons according to notification type
  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case "shipping":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        );
      case "discount":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
        );
      case "security":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        );
      case "delivered":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case "coupon":
      default:
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 12 20 22 4 22 4 12"></polyline>
            <rect x="2" y="7" width="20" height="5"></rect>
            <line x1="12" y1="22" x2="12" y2="7"></line>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
          </svg>
        );
    }
  };

  return (
    <div className="w-full">
      <SeoMeta title={translate("Bildirimlerim | E-Storee")} description={translate("Manage your E-Storee notification preferences and account updates.")} canonicalPath="/profile/notifications" robots="noindex,nofollow" />
      {/* Toast Alert */}
      <ProfileToast message={toastMessage} />

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 max-md:flex-col">
        <div>
          <div className="flex items-center gap-3"><h1 className="text-[28px] font-extrabold text-[#111]">{translate("My Notifications")}</h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#b6349a] px-2.5 py-1 text-xs font-semibold text-white">{unreadCount} {translate(" Yeni")}</span>
            )}
          </div>
          <p className="mt-2 text-sm text-[#777]">
            {translate("\r\n            Sipariş takibi, kampanyalar ve hesap güvenliğinizle ilgili tüm anlık güncellemeler.\r\n          ")}</p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#b6349a] hover:bg-[#b6349a]/[.06]"
              onClick={handleMarkAllAsRead}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {translate("\r\n              Tümünü Okundu Say\r\n            ")}</button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
              onClick={handleClearAll}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              {translate("\r\n              Tümünü Temizle\r\n            ")}</button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <ProfileFilterTabs
        className="mb-4"
        options={[
          { id: "all", label: `${translate("All notifications")} (${notifications.length})` },
          { id: "unread", label: `${translate("Unread")} (${unreadCount})` },
        ]}
        selected={activeFilter}
        onSelect={setActiveFilter}
      />

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <ProfileEmptyState className="text-sm text-[#777]">
            <div className="empty-state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <h4 className="font-bold text-[#333]">{translate("Henüz Bildiriminiz Yok")}</h4>
            <p className="mt-2">
              {activeFilter === "unread"
                ? translate("You have no unread notifications. You are all caught up!")
                : translate("New notifications will appear here when you receive them.")}
            </p>
          </ProfileEmptyState>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`relative flex items-start gap-4 rounded-2xl border p-4 ${item.isRead ? "border-[#eee] bg-white" : "border-[#b6349a]/[.3] bg-[#fff8fd]"}`}
            >
              {/* Unread Glowing Dot */}
              {!item.isRead && <span className="absolute left-2 top-2 h-2 w-2 rounded-full bg-[#b6349a]" title={translate("Okunmadı")}></span>}

              {/* Icon Container */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7f4f7]">
                {renderIcon(item.type)}
              </div>

              {/* Notification Content */}
              <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h4 className="font-bold text-[#222]">{translate(item.title)}</h4><span className="shrink-0 text-xs text-[#999]">{translate(item.time)}</span>
                </div>
                <p className="my-2 text-sm leading-5 text-[#777]">{translate(item.message)}</p>
                {item.actionText && item.actionUrl && (
                  <div>
                    <Link
                      to={item.actionUrl}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#b6349a]"
                      onClick={() => {
                        if (!item.isRead) handleToggleRead(item.id);
                      }}
                    >
                      {translate(item.actionText)}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </Link>
                  </div>
                )}
              </div>

              {/* Side Action Buttons */}
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  className="rounded-lg p-2 text-[#777] hover:bg-[#f5f5f5]"
                  title={translate(item.isRead ? "Okunmadı olarak işaretle" : "Okundu olarak işaretle")}
                  onClick={() => handleToggleRead(item.id)}
                >
                  {item.isRead ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>

                <button
                  type="button"
                  className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                  title={translate("Bildirimi Sil")}
                  onClick={() => handleDelete(item.id)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
