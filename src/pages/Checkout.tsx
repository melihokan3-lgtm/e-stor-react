import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../features/cart/CartContext";
import { useOrders } from "../features/orders/OrdersContext";
import { cleanImageUrl, FALLBACK_IMG } from "../services/api/productApi";
import { useAuth } from "../features/auth/AuthContext";
import { useLocation } from "../features/addresses/LocationContext";
import { PaymentSelectionModal } from "../components/checkout";
import { loadSavedCards } from "../features/payments/savedCards";
import type { PaymentCard } from "../types/payment";
import type { CreateOrderInput } from "../types/order";
import SeoMeta from "../components/common/SeoMeta";

type CouponIconType = "discount" | "shipping" | "special";
type CouponDiscountType = "percent" | "fixed" | "shipping";

interface Coupon {
  id: number;
  code: string;
  title: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  type: CouponIconType;
  minOrder: number;
  expiry: string;
}

const AVAILABLE_COUPONS: Coupon[] = [
  {
    id: 1,
    code: "HOSGELDIN20",
    title: "%20 Hoş Geldin İndirimi",
    description: "İlk siparişinize özel %20 indirim.",
    discountType: "percent",
    discountValue: 20,
    type: "discount",
    minOrder: 100,
    expiry: "2026-12-31",
  },
  {
    id: 2,
    code: "KARGOBEDAVA",
    title: "Ücretsiz Kargo",
    description: "200 TL ve üzeri siparişlerde kargo ücretsiz.",
    discountType: "shipping",
    discountValue: 0,
    type: "shipping",
    minOrder: 200,
    expiry: "2026-11-15",
  },
  {
    id: 3,
    code: "YAZ2026",
    title: "%15 Yaz İndirimi",
    description: "Seçili ürünlerde %15 indirim.",
    discountType: "percent",
    discountValue: 15,
    type: "discount",
    minOrder: 75,
    expiry: "2026-09-30",
  },
  {
    id: 4,
    code: "OZEL50",
    title: "50 TL İndirim",
    description: "Sadece size özel 50 TL indirim kuponu.",
    discountType: "fixed",
    discountValue: 50,
    type: "special",
    minOrder: 250,
    expiry: "2026-10-20",
  },
];

const COUPON_ICONS: Record<CouponIconType, string> = {
  discount: "🏷️",
  shipping: "🚚",
  special: "⭐",
};

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const { addOrder, ordersLoading } = useOrders();
  const { user, isLoggedIn, openAuthModal } = useAuth();
  const { location, openLocationModal } = useLocation();
  const navigate = useNavigate();

  const [activeTip, setActiveTip] = useState<number | "Other" | null>(null);
  const [customTip, setCustomTip] = useState('');

  // Payment method selection & modal state
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Coupon state
  const [isCouponPanelOpen, setIsCouponPanelOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponToast, setCouponToast] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [submitError, setSubmitError] = useState("");

  // Sync selected card on mount & user change
  useEffect(() => {
    const saved = loadSavedCards(user);
    setSelectedCard(saved.find((card) => card.isDefault) ?? saved[0] ?? null);
  }, [user]);

  const deliveryFee = 4.78;
  const itemsTotal = totalPrice;
  const numericTip = activeTip === 'Other' ? (Number(customTip) || 0) : (activeTip || 0);

  // Calculate coupon discount
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percent") {
      couponDiscount = (itemsTotal * appliedCoupon.discountValue) / 100;
    } else if (appliedCoupon.discountType === "fixed") {
      couponDiscount = appliedCoupon.discountValue;
    } else if (appliedCoupon.discountType === "shipping") {
      couponDiscount = deliveryFee;
    }
  }

  const finalTotal = Math.max(0, itemsTotal + deliveryFee + numericTip - couponDiscount);

  const cardDisplayName = selectedCard
    ? `${selectedCard.cardType === "visa" ? "Visa" : "Mastercard"} **** ${selectedCard.last4 || selectedCard.maskedNumber?.slice(-4) || "3434"}`
    : "Kart seçilmedi";

  const handleApplyCoupon = (coupon: Coupon) => {
    if (itemsTotal < coupon.minOrder) {
      setCouponToast(`Minimum sipariş tutarı: ${coupon.minOrder} TL`);
      setTimeout(() => setCouponToast(""), 3000);
      return;
    }
    setAppliedCoupon(coupon);
    setIsCouponPanelOpen(false);
    setCouponToast(`"${coupon.code}" kuponu uygulandı!`);
    setTimeout(() => setCouponToast(""), 3000);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponToast("Kupon kaldırıldı.");
    setTimeout(() => setCouponToast(""), 3000);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handlePlaceOrder = async (): Promise<void> => {
    if (submittingRef.current || ordersLoading) return;
    if (cart.length === 0) {
      setSubmitError("Your cart is empty!");
      return;
    }
    if (!isLoggedIn) {
      openAuthModal();
      return;
    }

    const newOrder: CreateOrderInput = {
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      deliveryAddress: location,
      paymentMethod: cardDisplayName,
      total: finalTotal,
      tip: numericTip,
      coupon: appliedCoupon?.code ?? null,
      couponDiscount,
      status: "Processing",
      items: cart.map((item) => ({
        id: item.data.id,
        title: item.data.title,
        img: cleanImageUrl(item.data.image) || FALLBACK_IMG,
        price: item.data.price,
        qty: item.unit,
        category: item.data.category,
      })),
    };

    setSubmitError("");
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const savedOrder = await addOrder(newOrder);
      clearCart();
      navigate(`/order-progress?orderId=${encodeURIComponent(String(savedOrder.id))}`);
    } catch (error) {
      console.error("Failed to place order", error);
      setSubmitError(error instanceof Error && error.message.startsWith("Bu hesap Supabase kullanıcısı değil")
        ? error.message
        : "Sipariş kaydedilemedi. Sepetiniz korunuyor; lütfen tekrar deneyin.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-[1400px] bg-[#fafafa] px-[60px] py-10 max-[768px]:px-6 max-[768px]:py-6">
      <SeoMeta
        title="Ödeme | E-Storee"
        description="E-Storee siparişinizi güvenli ödeme adımlarıyla tamamlayın. Teslimat adresinizi ve ödeme yönteminizi seçin."
        canonicalPath="/checkout"
        robots="noindex,nofollow"
      />
      <h1 className="sr-only">Siparişi Tamamla</h1>
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] items-start gap-10 max-[1024px]:grid-cols-1">

        {/* LEFT COLUMN */}
        <div className="flex min-w-0 flex-col gap-4">

          {/* HEADER ROW */}
          <div className="mb-1 flex items-center justify-between gap-5 max-[640px]:flex-col max-[640px]:items-stretch max-[640px]:gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b6349a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#111]">Ödeme ve Teslimat</h2>
            </div>
            <div className="flex max-w-[55%] min-w-0 items-start gap-2 break-words text-sm leading-5 text-[#555] max-[640px]:max-w-full max-[640px]:text-xs">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {location}
            </div>
          </div>

          {/* INFO CARD 1: Delivery info */}
          <div
            className="cursor-pointer rounded-2xl border border-[#f0f0f0] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition hover:border-[#b6349a] hover:shadow-[0_8px_24px_rgba(182,52,154,0.08)] focus:outline-none focus-visible:border-[#b6349a] focus-visible:ring-2 focus-visible:ring-[#b6349a]/20"
            role="button"
            tabIndex={0}
            onClick={openLocationModal}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openLocationModal();
              }
            }}
            aria-label={`Teslimat adresini değiştir. Mevcut adres: ${location}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#111]">Delivery info</h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div className="flex items-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex min-w-0 items-start gap-2 max-[640px]:gap-1.5">
              <span className="text-xs font-semibold text-[#777]">Deliver to</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b6349a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span className="min-w-0 break-words text-sm font-semibold leading-5 text-[#b6349a]">{location}</span>
            </div>
          </div>

          {/* INFO CARD 2: Payment Method */}
          <div
            className="cursor-pointer rounded-2xl border border-[#f0f0f0] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition hover:border-[#b6349a] hover:shadow-[0_8px_24px_rgba(182,52,154,0.08)] focus:outline-none focus-visible:border-[#b6349a] focus-visible:ring-2 focus-visible:ring-[#b6349a]/20"
            role="button"
            tabIndex={0}
            onClick={() => setIsPaymentModalOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setIsPaymentModalOpen(true);
              }
            }}
            aria-label={`Ödeme yöntemini seç veya yeni kart ekle. Seçili kart: ${cardDisplayName}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#111]">Payment Method</h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div className="flex items-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-semibold text-[#777]">Pay With</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b6349a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
              <span className="text-sm font-semibold text-[#b6349a]">{cardDisplayName}</span>
            </div>
          </div>

          {/* INFO CARD 3: Review Order */}
          <div className="rounded-2xl border border-[#f0f0f0] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#111]">Review Order</h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div className="flex items-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex flex-wrap gap-3">
                {cart.slice(0, 6).map((item) => {
                  const imageSrc = cleanImageUrl(item.data.image) || FALLBACK_IMG;
                  return (
                    <div key={item.data.id} className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-[#f7f7f7] p-2">
                      <img
                        src={imageSrc}
                        alt={item.data.title}
                        width={64}
                        height={64}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMG;
                        }}
                      />
                    </div>
                  );
                })}
                {cart.length > 6 && (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#fdf5fb] text-sm font-bold text-[#b6349a]">
                    +{cart.length - 6}
                  </div>
                )}
                {/* Fallback dummy images if cart is empty, so layout matches exact mockup */}
                {cart.length === 0 && (
                  <>
                    {Array.from({ length: 6 }).map((_, index) => <div key={index} className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-[#f7f7f7] p-2"><img src={FALLBACK_IMG} alt="" aria-hidden="true" width={64} height={64} /></div>)}
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#fdf5fb] text-sm font-bold text-[#b6349a]">+12</div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="min-w-0">
          <div className="rounded-2xl bg-white p-7 shadow-[0_4px_24px_rgba(0,0,0,0.05)] max-[640px]:p-5">

            <h3 className="mb-6 text-xl font-bold text-[#111]">Order Summary</h3>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#888]">Delivery fee</span>
                <span className="font-semibold text-[#111]">
                  {appliedCoupon?.discountType === "shipping" ? (
                    <><s className="mr-1 text-gray-400">${deliveryFee.toFixed(2)}</s> <span className="font-bold text-emerald-600">FREE</span></>
                  ) : (
                    `$${deliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#888]">Service fee</span>
                <span className="font-semibold text-[#111]">${itemsTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#888]">Items total</span>
                <span className="font-semibold text-[#111]">${itemsTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-7 border-t border-[#f0f0f0] pt-6">
              <h4 className="mb-1 text-sm font-bold text-[#111]">Delivery Tip</h4>
              <p className="mb-3 text-xs text-[#999]">Your delivery person keeps 100% of tips.</p>

              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20, 30].map((tip) => (
                  <button
                    key={tip}
                    className={`rounded-[30px] border px-3 py-2 text-xs font-semibold transition ${activeTip === tip ? "border-[#b6349a] bg-[#b6349a] text-white" : "border-[#ddd] bg-white text-[#555] hover:border-[#b6349a] hover:text-[#b6349a]"}`}
                    onClick={() => setActiveTip(activeTip === tip ? null : tip)}
                  >
                    ${tip}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  className={`rounded-[30px] border px-3 py-2 text-xs font-semibold transition ${activeTip === 'Other' ? "border-[#b6349a] bg-[#b6349a] text-white" : "border-[#ddd] bg-white text-[#555] hover:border-[#b6349a] hover:text-[#b6349a]"}`}
                  onClick={() => setActiveTip(activeTip === 'Other' ? null : 'Other')}
                >
                  Other
                </button>
                {activeTip === 'Other' && (
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Enter amount"
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    className="w-[120px] rounded-[30px] border border-[#ddd] px-3 py-2 text-[13px] outline-none focus:border-[#b6349a]"
                  />
                )}
              </div>
            </div>

            {/* COUPON ROW */}
            <div className="relative mt-7 flex items-center justify-between border-t border-[#f0f0f0] pt-6">
              <span className="text-sm font-semibold text-[#555]">Coupon</span>

              {appliedCoupon ? (
                <div className="flex items-center gap-2 rounded-lg bg-[#fdf5fb] px-2.5 py-1.5 text-xs">
                  <span>{COUPON_ICONS[appliedCoupon.type]}</span>
                  <span className="font-semibold text-[#b6349a]">{appliedCoupon.code}</span>
                  <span className="font-bold text-emerald-600">
                    {appliedCoupon.discountType === "percent" && `-${appliedCoupon.discountValue}%`}
                    {appliedCoupon.discountType === "fixed" && `-$${appliedCoupon.discountValue}`}
                    {appliedCoupon.discountType === "shipping" && "Free Shipping"}
                  </span>
                  <button
                    className="text-[#999] transition hover:text-red-500"
                    onClick={handleRemoveCoupon}
                    aria-label="Kuponu kaldır"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#b6349a] transition hover:text-[#831843]"
                  onClick={() => setIsCouponPanelOpen(!isCouponPanelOpen)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add Coupon
                </button>
              )}

              {/* COUPON DROPDOWN PANEL */}
              {isCouponPanelOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-[min(360px,calc(100vw-3rem))] overflow-hidden rounded-xl border border-[#eee] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
                  <div className="flex items-center justify-between border-b border-[#f0f0f0] px-4 py-3">
                    <h4 className="text-sm font-bold text-[#111]">Kuponlarım</h4>
                    <button
                      className="text-[#777] hover:text-[#111]"
                      onClick={() => setIsCouponPanelOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div className="flex max-h-[320px] flex-col overflow-y-auto">
                    {AVAILABLE_COUPONS.map((coupon) => {
                      const isEligible = itemsTotal >= coupon.minOrder;
                      return (
                        <div
                          key={coupon.id}
                          className={`relative flex gap-3 border-b border-[#f4f4f4] p-3 transition last:border-0 ${isEligible ? "cursor-pointer hover:bg-[#fdf5fb]" : "cursor-not-allowed opacity-50"}`}
                          onClick={() => isEligible && handleApplyCoupon(coupon)}
                        >
                          <div className={`absolute bottom-0 left-0 top-0 w-1 ${coupon.type === "discount" ? "bg-orange-500" : coupon.type === "shipping" ? "bg-[#b6349a]" : "bg-emerald-500"}`}></div>
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fdf5fb] text-lg">
                            {COUPON_ICONS[coupon.type]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-[#111]">{coupon.title}</div>
                            <div className="mt-0.5 text-xs text-[#888]">{coupon.description}</div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#888]">
                              <span className="rounded bg-[#fdf5fb] px-1.5 py-0.5 font-semibold text-[#b6349a]">{coupon.code}</span>
                              <span className="flex items-center gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                {formatDate(coupon.expiry)}
                              </span>
                              {coupon.minOrder > 0 && <span>Min. ${coupon.minOrder}</span>}
                            </div>
                            {!isEligible && (
                              <div className="mt-2 text-[11px] font-semibold text-red-500">
                                Min. ${coupon.minOrder} sipariş tutarına ulaşmanız gerekiyor
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* COUPON DISCOUNT LINE */}
            {appliedCoupon && couponDiscount > 0 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-semibold text-emerald-600">
                  🏷️ Kupon İndirimi ({appliedCoupon.code})
                </span>
                <span className="font-bold text-emerald-600">
                  -${couponDiscount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between border-t border-[#f0f0f0] pt-5">
              <span className="text-lg font-bold text-[#111]">Total</span>
              <span className="text-xl font-extrabold text-[#b6349a]">${finalTotal.toFixed(2)}</span>
            </div>

            <p className="mt-4 text-xs leading-5 text-[#999]">
              By placing this order, you are agreeing to <a className="text-[#b6349a] underline" href="#">Terms and Conditions</a>.
            </p>

            <button
              className="mt-5 w-full rounded-[30px] bg-[#b6349a] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#de57c4] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => { void handlePlaceOrder(); }}
              disabled={isSubmitting || ordersLoading}
            >
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </button>
            {submitError && <p role="alert" className="mt-3 text-sm text-red-700">{submitError}</p>}

          </div>
        </div>

      </div>

      {/* PAYMENT METHOD SELECTION & ADD MODAL */}
      <PaymentSelectionModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        selectedCardId={selectedCard?.id}
        onSelectCard={(card: PaymentCard) => setSelectedCard(card)}
        user={user}
      />

      {/* COUPON TOAST */}
      {couponToast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#111] px-4 py-3 text-sm font-semibold text-white shadow-lg">{couponToast}</div>}
    </main>
  );
}
