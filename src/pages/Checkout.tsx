import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../features/cart/CartContext";
import { useOrders } from "../features/orders/OrdersContext";
import { cleanImageUrl, FALLBACK_IMG } from "../services/api/productApi";
import { useAuth } from "../features/auth/AuthContext";
import { useLocation } from "../features/addresses/LocationContext";
import PaymentSelectionModal from "../components/PaymentSelectionModal";
import { readUserStorage, writeUserStorage } from "../utils/userStorage";
import { DEFAULT_DEMO_CARDS } from "../utils/cardUtils";
import type { PaymentCard } from "../types/payment";

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
  const { addOrder } = useOrders();
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

  // Sync selected card on mount & user change
  useEffect(() => {
    const saved = readUserStorage<PaymentCard[] | null>("savedCards", user, null);
    if (saved && saved.length > 0) {
      const def = saved.find((c) => c.isDefault) || saved[0];
      setSelectedCard(def);
    } else {
      setSelectedCard(DEFAULT_DEMO_CARDS[0]);
      writeUserStorage("savedCards", user, DEFAULT_DEMO_CARDS);
    }
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
    : "Mastercard **** 3434";

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

  return (
    <main className="main-checkout">
      <div className="checkout-container">

        {/* LEFT COLUMN */}
        <div className="checkout-left">

          {/* HEADER ROW */}
          <div className="checkout-header-row">
            <div className="checkout-header-title">
              <div className="checkout-header-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b6349a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
              </div>
              <h2>Checkout</h2>
            </div>
            <div className="checkout-header-date">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {location}
            </div>
          </div>

          {/* INFO CARD 1: Delivery info */}
          <div
            className="checkout-info-card checkout-info-card--interactive"
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
            <div className="checkout-card-header">
              <div className="checkout-card-title">
                <h3>Delivery info</h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div className="checkout-chevron">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
            <div className="checkout-card-body">
              <span className="checkout-sub-label">Deliver to</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b6349a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span className="checkout-sub-value pink-text">{location}</span>
            </div>
          </div>

          {/* INFO CARD 2: Payment Method */}
          <div
            className="checkout-info-card checkout-info-card--interactive"
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
            <div className="checkout-card-header">
              <div className="checkout-card-title">
                <h3>Payment Method</h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div className="checkout-chevron">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
            <div className="checkout-card-body">
              <span className="checkout-sub-label">Pay With</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b6349a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
              <span className="checkout-sub-value pink-text">{cardDisplayName}</span>
            </div>
          </div>

          {/* INFO CARD 3: Review Order */}
          <div className="checkout-info-card review-card">
            <div className="checkout-card-header">
              <div className="checkout-card-title">
                <h3>Review Order</h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <div className="checkout-chevron">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
            <div className="checkout-card-body review-images">
              <div className="review-images-row">
                {cart.slice(0, 6).map((item) => {
                  const imageSrc = cleanImageUrl(item.data.image) || FALLBACK_IMG;
                  return (
                    <div key={item.data.id} className="review-img-box">
                      <img
                        src={imageSrc}
                        alt={item.data.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMG;
                        }}
                      />
                    </div>
                  );
                })}
                {cart.length > 6 && (
                  <div className="review-img-box more-box">
                    +{cart.length - 6}
                  </div>
                )}
                {/* Fallback dummy images if cart is empty, so layout matches exact mockup */}
                {cart.length === 0 && (
                  <>
                    <div className="review-img-box"><img src={FALLBACK_IMG} alt="dummy" /></div>
                    <div className="review-img-box"><img src={FALLBACK_IMG} alt="dummy" /></div>
                    <div className="review-img-box"><img src={FALLBACK_IMG} alt="dummy" /></div>
                    <div className="review-img-box"><img src={FALLBACK_IMG} alt="dummy" /></div>
                    <div className="review-img-box"><img src={FALLBACK_IMG} alt="dummy" /></div>
                    <div className="review-img-box"><img src={FALLBACK_IMG} alt="dummy" /></div>
                    <div className="review-img-box more-box">+12</div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="checkout-right">
          <div className="order-summary-box">

            <h3 className="summary-title-main">Order Summary</h3>

            <div className="summary-lines">
              <div className="summary-line">
                <span className="s-label">Delivery fee</span>
                <span className="s-value">
                  {appliedCoupon?.discountType === "shipping" ? (
                    <><s style={{color:'#9ca3af',marginRight:4}}>${deliveryFee.toFixed(2)}</s> <span style={{color:'#059669',fontWeight:700}}>FREE</span></>
                  ) : (
                    `$${deliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="summary-line">
                <span className="s-label">Service fee</span>
                <span className="s-value">${itemsTotal.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span className="s-label">Items total</span>
                <span className="s-value">${itemsTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="delivery-tip-section">
              <h4 className="tip-title">Delivery Tip</h4>
              <p className="tip-desc">Your delivery person keeps 100% of tips.</p>

              <div className="tip-buttons-row">
                {[5, 10, 15, 20, 30].map((tip) => (
                  <button
                    key={tip}
                    className={`tip-btn ${activeTip === tip ? "active" : ""}`}
                    onClick={() => setActiveTip(activeTip === tip ? null : tip)}
                  >
                    ${tip}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className={`tip-btn other ${activeTip === 'Other' ? "active" : ""}`}
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
                    style={{
                      padding: '8px 12px',
                      borderRadius: '30px',
                      border: '1px solid #ddd',
                      outline: 'none',
                      width: '120px',
                      fontSize: '13px'
                    }}
                  />
                )}
              </div>
            </div>

            {/* COUPON ROW */}
            <div className="coupon-row" style={{ position: 'relative' }}>
              <span className="coupon-label">Coupon</span>

              {appliedCoupon ? (
                <div className="applied-coupon-tag">
                  <span className="applied-coupon-icon">{COUPON_ICONS[appliedCoupon.type]}</span>
                  <span className="applied-coupon-code">{appliedCoupon.code}</span>
                  <span className="applied-coupon-discount">
                    {appliedCoupon.discountType === "percent" && `-${appliedCoupon.discountValue}%`}
                    {appliedCoupon.discountType === "fixed" && `-$${appliedCoupon.discountValue}`}
                    {appliedCoupon.discountType === "shipping" && "Free Shipping"}
                  </span>
                  <button
                    className="applied-coupon-remove"
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
                  className="add-coupon-btn"
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
                <div className="coupon-dropdown-panel">
                  <div className="coupon-dropdown-header">
                    <h4>Kuponlarım</h4>
                    <button
                      className="coupon-dropdown-close"
                      onClick={() => setIsCouponPanelOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div className="coupon-dropdown-list">
                    {AVAILABLE_COUPONS.map((coupon) => {
                      const isEligible = itemsTotal >= coupon.minOrder;
                      return (
                        <div
                          key={coupon.id}
                          className={`coupon-dropdown-item ${!isEligible ? "disabled" : ""}`}
                          onClick={() => isEligible && handleApplyCoupon(coupon)}
                        >
                          <div className={`coupon-dropdown-accent ${coupon.type}`}></div>
                          <div className="coupon-dropdown-icon">
                            {COUPON_ICONS[coupon.type]}
                          </div>
                          <div className="coupon-dropdown-info">
                            <div className="coupon-dropdown-title">{coupon.title}</div>
                            <div className="coupon-dropdown-desc">{coupon.description}</div>
                            <div className="coupon-dropdown-meta">
                              <span className="coupon-dropdown-code-tag">{coupon.code}</span>
                              <span className="coupon-dropdown-expiry">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                {formatDate(coupon.expiry)}
                              </span>
                              {coupon.minOrder > 0 && (
                                <span className="coupon-dropdown-min">Min. ${coupon.minOrder}</span>
                              )}
                            </div>
                            {!isEligible && (
                              <div className="coupon-dropdown-warning">
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
              <div className="summary-line coupon-discount-line">
                <span className="s-label" style={{color:'#059669'}}>
                  🏷️ Kupon İndirimi ({appliedCoupon.code})
                </span>
                <span className="s-value" style={{color:'#059669',fontWeight:700}}>
                  -${couponDiscount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="total-row">
              <span className="total-label">Total</span>
              <span className="total-value">${finalTotal.toFixed(2)}</span>
            </div>

            <p className="terms-text">
              By placing this order, you are agreeing to <a href="#">Terms and Conditions</a>.
            </p>

            <button
              className="place-order-btn"
              onClick={() => {
                if (cart.length === 0) {
                  alert("Your cart is empty!");
                  return;
                }
                if (!isLoggedIn) {
                  openAuthModal();
                  return;
                }
                const newOrder = {
                  id: "#" + String(Date.now()).slice(-5),
                  date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
                  deliveryAddress: location,
                  paymentMethod: cardDisplayName,
                  total: finalTotal,
                  coupon: appliedCoupon ? appliedCoupon.code : null,
                  couponDiscount: couponDiscount,
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
                addOrder(newOrder);
                clearCart();
                navigate("/order-progress");
              }}
            >
              Place Order
            </button>

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
      {couponToast && <div className="coupon-toast">{couponToast}</div>}
    </main>
  );
}
