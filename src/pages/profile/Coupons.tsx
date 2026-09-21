import { useState } from "react";
import { ProfileEmptyState, ProfileToast } from "../../components/profile";
import { SeoMeta } from "../../components/common";

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
    <div className="w-full">
      <SeoMeta title="Kuponlarım | E-Storee" description="E-Storee hesabınızdaki indirim kuponlarını ve kampanyaları görüntüleyin." canonicalPath="/profile/coupons" robots="noindex,nofollow" />
      {/* HEADER */}
      <div className="mb-8 flex items-start justify-between gap-4 max-md:flex-col">
        <h1 className="text-[28px] font-extrabold text-[#111]">Kuponlarım</h1>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {activeCoupons.length} Aktif
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            {usedCoupons.length} Kullanıldı
          </span>
          <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
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
        <ProfileEmptyState>
          <div className="coupons-empty-icon">🎟️</div>
          <h3 className="font-bold text-[#111]">Henüz kuponunuz yok</h3>
          <p className="text-sm text-[#777]">Kampanyalarımızı takip ederek yeni kuponlar kazanabilirsiniz.</p>
        </ProfileEmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {COUPONS_DATA.map((coupon) => (
            <div
              key={coupon.id}
              className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${coupon.status === "active" ? "cursor-pointer border-[#b6349a]/[.25]" : "border-[#eee] opacity-65"}`}
              onClick={() => coupon.status === "active" && copyCode(coupon.code)}
              title={coupon.status === "active" ? "Kodu kopyalamak için tıklayın" : ""}
            >
              {/* ACCENT STRIP */}
              <div className={`absolute inset-x-0 top-0 h-1 ${coupon.type === "shipping" ? "bg-blue-500" : coupon.type === "special" ? "bg-amber-500" : "bg-[#b6349a]"}`}></div>

              {/* BODY */}
              <div className="flex gap-4">
                {/* ICON */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff1fb] text-xl">
                  {ICONS[coupon.type]}
                </div>

                {/* INFO */}
                <div className="min-w-0 flex-1"><div className="font-bold text-[#111]">{coupon.title}</div><div className="mt-1 text-sm text-[#777]">{coupon.description}</div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#777]">
                    <span
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-[#f7f4f7] px-2 py-1 font-mono font-semibold text-[#b6349a]"
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

                    <span className="inline-flex items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {formatDate(coupon.expiry)}
                    </span>

                    {coupon.minOrder > 0 && (
                      <span>
                        Min. {coupon.minOrder} TL
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* STATUS BADGE */}
              <span className="absolute right-4 top-4 rounded-full bg-[#f7f4f7] px-2 py-1 text-[11px] font-semibold text-[#b6349a]">
                {coupon.status === "active" && "Aktif"}
                {coupon.status === "used" && "Kullanıldı"}
                {coupon.status === "expired" && "Süresi Doldu"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* TOAST */}
      <ProfileToast message={toast} />
    </div>
  );
}
