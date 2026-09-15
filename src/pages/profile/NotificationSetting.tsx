import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { readUserStorage, writeUserStorage } from "../../utils/userStorage";

type NotificationType = "shipping" | "discount" | "security" | "delivered" | "coupon";

interface ProfileNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  badgeColor: string;
  actionText: string;
  actionUrl: string;
}

const INITIAL_NOTIFICATIONS: ProfileNotification[] = [
  {
    id: "notif_1",
    type: "shipping",
    title: "Siparişiniz Kargoya Verildi 🚚",
    message: "Siparişiniz (No: #12345) kargoya verildi. Takip etmek ve anlık teslimat durumunu görmek için tıklayın.",
    time: "15 dakika önce",
    isRead: false,
    badgeColor: "#3b82f6",
    actionText: "Kargo Takibi",
    actionUrl: "/profile/orders",
  },
  {
    id: "notif_2",
    type: "discount",
    title: "Favorinizde %20 İndirim Başladı! 🔥",
    message: "Favorilerinizdeki Nike Ayakkabı'da %20 indirim başladı! Stoklar tükenmeden hemen yakala.",
    time: "2 saat önce",
    isRead: false,
    badgeColor: "#ec4899",
    actionText: "Fırsatı İncele",
    actionUrl: "/category",
  },
  {
    id: "notif_3",
    type: "security",
    title: "Yeni Cihaz Girişi Bildirimi 🛡️",
    message: "Hesabınıza Bursa'dan yeni bir cihazdan (Windows / Chrome) giriş yapıldı. Siz değilseniz şifrenizi hemen değiştirin.",
    time: "5 saat önce",
    isRead: false,
    badgeColor: "#f59e0b",
    actionText: "Güvenlik Ayarları",
    actionUrl: "/profile/settings",
  },
  {
    id: "notif_4",
    type: "delivered",
    title: "Siparişiniz Teslim Edildi ✅",
    message: "Siparişiniz teslim edildi. Ürünleri değerlendirip puan kazanmak ve yorum bırakmak ister misiniz?",
    time: "Dün, 16:45",
    isRead: true,
    badgeColor: "#10b981",
    actionText: "Siparişlerim",
    actionUrl: "/profile/orders",
  },
  {
    id: "notif_5",
    type: "coupon",
    title: "150 TL Hoş Geldin Kuponu Hesabınızda! 🎁",
    message: "Hesabınıza sepetinizde geçerli 150 TL değerinde 'HOSGELDIN' indirim kuponu başarıyla yüklendi.",
    time: "3 gün önce",
    isRead: true,
    badgeColor: "#8b5cf6",
    actionText: "Kuponları Gör",
    actionUrl: "/profile/coupons",
  },
];

export default function NotificationSetting() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ProfileNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
  const [toastMessage, setToastMessage] = useState("");

  // Load notifications from localStorage
  useEffect(() => {
    const saved = readUserStorage<ProfileNotification[] | null>("notifications", user, null);
    if (saved !== null && Array.isArray(saved)) {
      setNotifications(saved);
    } else {
      setNotifications(INITIAL_NOTIFICATIONS);
      writeUserStorage("notifications", user, INITIAL_NOTIFICATIONS);
    }
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
    writeUserStorage("notifications", user, updated);
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    writeUserStorage("notifications", user, updated);
    showToast("Tüm bildirimler okundu olarak işaretlendi.");
  };

  // Delete a notification
  const handleDelete = (id: ProfileNotification["id"]) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    writeUserStorage("notifications", user, updated);
    showToast("Bildirim silindi.");
  };

  // Clear all notifications
  const handleClearAll = () => {
    if (notifications.length === 0) return;
    if (window.confirm("Tüm bildirimlerinizi silmek istediğinize emin misiniz?")) {
      setNotifications([]);
      writeUserStorage("notifications", user, []);
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
    <div className="notifications-page">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="payment-toast-alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="notifications-header-row">
        <div>
          <div className="title-with-badge">
            <h2 className="profile-page-title">Bildirimlerim (Notifications)</h2>
            {unreadCount > 0 && (
              <span className="notif-count-badge">{unreadCount} Yeni</span>
            )}
          </div>
          <p className="notifications-subtitle">
            Sipariş takibi, kampanyalar ve hesap güvenliğinizle ilgili tüm anlık güncellemeler.
          </p>
        </div>

        {/* Global Actions */}
        <div className="notif-header-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="notif-action-text-btn"
              onClick={handleMarkAllAsRead}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Tümünü Okundu Say
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              className="notif-action-text-btn text-danger"
              onClick={handleClearAll}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Tümünü Temizle
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="notif-filter-tabs">
        <button
          type="button"
          className={`notif-tab-btn ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => setActiveFilter("all")}
        >
          Tüm Bildirimler ({notifications.length})
        </button>
        <button
          type="button"
          className={`notif-tab-btn ${activeFilter === "unread" ? "active" : ""}`}
          onClick={() => setActiveFilter("unread")}
        >
          Okunmamışlar ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="notifications-empty-state">
            <div className="empty-state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <h4>Henüz Bildiriminiz Yok</h4>
            <p>
              {activeFilter === "unread"
                ? "Okunmamış bildiriminiz bulunmuyor. Tüm güncel haberleri takip ettiniz!"
                : "Yeni bir bildirim aldığınızda burada görüntülenecektir."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`notif-item-card ${item.isRead ? "is-read" : "is-unread"}`}
            >
              {/* Unread Glowing Dot */}
              {!item.isRead && <span className="unread-pulse-dot" title="Okunmadı"></span>}

              {/* Icon Container */}
              <div className={`notif-type-icon type-${item.type}`}>
                {renderIcon(item.type)}
              </div>

              {/* Notification Content */}
              <div className="notif-content-area">
                <div className="notif-title-row">
                  <h4 className="notif-title">{item.title}</h4>
                  <span className="notif-time">{item.time}</span>
                </div>
                <p className="notif-message">{item.message}</p>
                {item.actionText && item.actionUrl && (
                  <div className="notif-action-link-wrapper">
                    <Link
                      to={item.actionUrl}
                      className="notif-action-link"
                      onClick={() => {
                        if (!item.isRead) handleToggleRead(item.id);
                      }}
                    >
                      {item.actionText}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </Link>
                  </div>
                )}
              </div>

              {/* Side Action Buttons */}
              <div className="notif-side-actions">
                <button
                  type="button"
                  className={`notif-icon-btn ${item.isRead ? "btn-read" : "btn-unread"}`}
                  title={item.isRead ? "Okunmadı olarak işaretle" : "Okundu olarak işaretle"}
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
                  className="notif-icon-btn btn-delete"
                  title="Bildirimi Sil"
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
