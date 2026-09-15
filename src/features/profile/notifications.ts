import type { AuthUser } from "../../types/auth";
import { readUserStorage, writeUserStorage } from "../../utils/userStorage";

export type NotificationType = "shipping" | "discount" | "security" | "delivered" | "coupon";

export interface ProfileNotification {
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

export function loadProfileNotifications(user: AuthUser | null): ProfileNotification[] {
  if (!user) return [];
  const saved = readUserStorage<ProfileNotification[] | null>("notifications", user, null);
  if (Array.isArray(saved)) return saved;
  writeUserStorage("notifications", user, INITIAL_NOTIFICATIONS);
  return INITIAL_NOTIFICATIONS;
}

export function saveProfileNotifications(user: AuthUser | null, notifications: ProfileNotification[]): void {
  if (!user) return;
  writeUserStorage("notifications", user, notifications);
}
