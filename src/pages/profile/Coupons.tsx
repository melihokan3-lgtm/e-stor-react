import { useState } from "react";

type CouponType = "discount" | "shipping" | "special";
type CouponStatus = "active" | "expired" | "used";

interface Coupon {
  id: number;
  code: string;
  title: string;
  description: string;
  discount: string;
  type: CouponType;
  minOrder: number;
  expiry: string;
  status: CouponStatus;
}

const COUPONS_DATA: Coupon[] = [
  {
    id: 1,
    code: "HOSGELDIN20",
    title: "%20 Hoş Geldin İndirimi",
    description: "İlk siparişinize özel %20 indirim fırsatı. Tüm ürünlerde geçerlidir.",
    discount: "%20",
    type: "discount",
    minOrder: 100,
    expiry: "2026-12-31",
    status: "active",
  },
  {
    id: 2,
    code: "KARGOBEDAVA",
    title: "Ücretsiz Kargo",
    description: "200 TL ve üzeri siparişlerde kargo ücretsiz.",
    discount: "Ücretsiz Kargo",
    type: "shipping",
    minOrder: 200,
    expiry: "2026-11-15",
    status: "active",
  },
  {
    id: 3,
    code: "YAZ2026",
    title: "%15 Yaz İndirimi",
    description: "Yaz sezonuna özel seçili ürünlerde %15 indirim.",
    discount: "%15",
    type: "discount",
    minOrder: 75,
    expiry: "2026-09-30",
    status: "active",
  },
  {
    id: 4,
    code: "OZEL50",
    title: "50 TL İndirim",
    description: "Sadece size özel 50 TL değerinde indirim kuponu.",
    discount: "50 TL",
    type: "special",
    minOrder: 250,
    expiry: "2026-10-20",
    status: "active",
  },
  {
    id: 5,
    code: "BAHAR10",
    title: "%10 Bahar Kampanyası",
    description: "Bahar kampanyası kapsamında tüm ürünlerde geçerli.",
    discount: "%10",
    type: "discount",
    minOrder: 50,
    expiry: "2026-05-01",
    status: "expired",
  },
  {
    id: 6,
    code: "ILKALIS",
    title: "Ücretsiz Kargo",
    description: "İlk alışverişinize özel kargo bedava kampanyası.",
    discount: "Ücretsiz Kargo",
    type: "shipping",
    minOrder: 0,
    expiry: "2026-03-15",
    status: "used",
  },
];

const ICONS: Record<CouponType, string> = {
  discount: "🏷️",
  shipping: "🚚",
  special: "⭐",
};

export default function Coupons() {
  const [toast, setToast] = useState("");

  const activeCoupons = COUPONS_DATA.filter((c) => c.status === "active");
  const usedCoupons = COUPONS_DATA.filter((c) => c.status === "used");
  const expiredCoupons = COUPONS_DATA.filter((c) => c.status === "expired");

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setToast(`"${code}" kodu panoya kopyalandı!`);
      setTimeout(() => setToast(""), 3000);
    });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="coupons-page">
      {/* HEADER */}
      <div className="coupons-header">
        <h2 className="profile-page-title">Kuponlarım</h2>
        <div className="coupons-stats">
          <span className="coupon-stat-badge active">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {activeCoupons.length} Aktif
          </span>
          <span className="coupon-stat-badge used">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            {usedCoupons.length} Kullanıldı
          </span>
          <span className="coupon-stat-badge expired">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {expiredCoupons.length} Süresi Doldu
          </span>
        </div>
      </div>

      {/* COUPONS GRID */}
      {COUPONS_DATA.length === 0 ? (
        <div className="coupons-empty">
          <div className="coupons-empty-icon">🎟️</div>
          <h3>Henüz kuponunuz yok</h3>
          <p>Kampanyalarımızı takip ederek yeni kuponlar kazanabilirsiniz.</p>
        </div>
      ) : (
        <div className="coupons-grid">
          {COUPONS_DATA.map((coupon) => (
            <div
              key={coupon.id}
              className={`coupon-card ${coupon.status}`}
              onClick={() => coupon.status === "active" && copyCode(coupon.code)}
              title={coupon.status === "active" ? "Kodu kopyalamak için tıklayın" : ""}
            >
              {/* ACCENT STRIP */}
              <div className={`coupon-card-accent ${coupon.type}`}></div>

              {/* BODY */}
              <div className="coupon-card-body">
                {/* ICON */}
                <div className={`coupon-icon-circle ${coupon.type}`}>
                  {ICONS[coupon.type]}
                </div>

                {/* INFO */}
                <div className="coupon-info">
                  <div className="coupon-title">{coupon.title}</div>
                  <div className="coupon-desc">{coupon.description}</div>

                  <div className="coupon-meta">
                    <span
                      className="coupon-code-tag"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (coupon.status === "active") copyCode(coupon.code);
                      }}
                    >
                      {coupon.code}
                      {coupon.status === "active" && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      )}
                    </span>

                    <span className="coupon-expiry-tag">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {formatDate(coupon.expiry)}
                    </span>

                    {coupon.minOrder > 0 && (
                      <span className="coupon-min-order">
                        Min. {coupon.minOrder} TL
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* STATUS BADGE */}
              <span className={`coupon-status-badge ${coupon.status}`}>
                {coupon.status === "active" && "Aktif"}
                {coupon.status === "used" && "Kullanıldı"}
                {coupon.status === "expired" && "Süresi Doldu"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* TOAST */}
      {toast && <div className="coupon-toast">{toast}</div>}
    </div>
  );
}
