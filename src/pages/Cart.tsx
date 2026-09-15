import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../features/cart/CartContext";
import { fetchProducts, cleanImageUrl, FALLBACK_IMG } from "../services/api/productApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import SearchProductCard from "../components/product/SearchProductCard";
import { useLocation } from "../features/addresses/LocationContext";
import type { Product } from "../types/product";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { location, openLocationModal } = useLocation();

  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    fetchProducts()
      .then((data) => { if (active) setRecommendations(data.slice(0, 10)); })
      .catch(() => { if (active) setRecommendations([]); });
    return () => { active = false; };
  }, []);

  const deliveryFee = 5.78;
  const itemsTotal = totalPrice;
  const finalSubtotal = itemsTotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <main className="main-cart">
        <div className="cart-empty-state centered-flex">
          <div className="cart-empty-animation-container">
            <svg
              className="cart-empty-svg"
              width="180" height="180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#b6349a"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>

              <circle cx="11.5" cy="12" r="0.5" fill="#b6349a" stroke="none" className="sad-eye-left"></circle>
              <circle cx="16.5" cy="12" r="0.5" fill="#b6349a" stroke="none" className="sad-eye-right"></circle>
              <path d="M12.5 15.5c0.5-0.8 2.5-0.8 3 0" stroke="#b6349a" className="sad-mouth"></path>
            </svg>

            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
          </div>

          <h2 className="cart-empty-title">Sepetin şu an boş</h2>
          <p className="cart-empty-subtitle">Sepetini fırsatlarla dolu dünyamızdan doldurmak için hemen alışverişe başlayabilirsin.</p>

          <Link to="/" className="cart-empty-cta-btn">
            Alışverişe Başla
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="main-cart">
      <div className="cart-container">

        {/* LEFT COLUMN */}
        <div className="cart-left">

          {/* LOCAL MARKET HEADER */}
          <div
            className="cart-local-market"
            onClick={openLocationModal}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openLocationModal();
              }
            }}
            aria-label={`Teslimat adresini değiştir. Mevcut adres: ${location}`}
          >
            <div className="local-market-info">
              <div className="local-market-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b6349a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <div className="local-market-texts">
                <p>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {location}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="local-market-date-btn"
              onClick={(event) => {
                event.stopPropagation();
                openLocationModal();
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Change address {'>'}
            </button>
          </div>

          <div className="cart-items-header">Items Name</div>

          {/* CART ITEMS LIST */}
          <div className="cart-items-list">
            {cart.map((item) => {
              const product = item.data;
              const categorySlug = product.category.toLowerCase().replace(/\s+/g, "-") || "category";
              const productId = product.id;
              const imageSrc = product.image || cleanImageUrl(product.images?.[0]) || FALLBACK_IMG;
              const oldPrice = (product.price * 1.2).toFixed(2);
              const itemTotal = (product.price * item.unit).toFixed(2);

              return (
                <div className="cart-item-row" key={product.id}>
                  <Link to={`/${categorySlug}/${productId}`} className="cart-item-image-col">
                    <div className="cart-item-image-wrapper">
                      <img
                        src={imageSrc}
                        alt={product.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMG;
                        }}
                      />
                    </div>
                    <div className="cart-item-info">
                      <h4 className="cart-item-title">{product.title || "Sweet Green Seedless Grapes 1.5-2 lb"}</h4>
                      <div className="cart-item-prices">
                        <span className="cart-item-price-new">${product.price.toFixed(2)}</span>
                        <span className="cart-item-price-old">${oldPrice}</span>
                      </div>
                    </div>
                  </Link>

                  <div className="cart-item-actions-col">
                    <div className="cart-item-qty-control">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(product.id, -1)}
                      >
                        {item.unit === 1 ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        ) : (
                          "–"
                        )}
                      </button>
                      <span className="qty-value">{item.unit}</span>
                      <button
                        className="qty-btn plus"
                        onClick={() => updateQuantity(product.id, 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="cart-item-remove-btn"
                      onClick={() => removeFromCart(product.id)}
                    >
                      Remove
                    </button>
                    <div className="cart-item-total-price">
                      ${itemTotal}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RECOMMENDATIONS */}
          <div className="cart-recommendations">
            <div className="recommendations-header">
              <h2>Recommendations</h2>
              <div className="swiper-nav-group">
                <button className="nav-btn prev-rec">‹</button>
                <button className="nav-btn next-rec">›</button>
              </div>
            </div>
            <Swiper
              modules={[Navigation]}
              navigation={{ nextEl: ".next-rec", prevEl: ".prev-rec" }}
              slidesPerView={4}
              spaceBetween={20}
              breakpoints={{
                320: { slidesPerView: 1 },
                640: { slidesPerView: 2 },
                992: { slidesPerView: 3 },
                1200: { slidesPerView: 4 },
              }}
              className="recommendations-swiper"
            >
              {recommendations.map((product) => (
                <SwiperSlide key={`rec-${product.id}`}>
                  <SearchProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="cart-right">
          <div className="cart-summary-card">

            <div className="cart-progress-bar">
              <div className="progress-fill" style={{ width: "65%" }}></div>
            </div>
            <p className="cart-progress-text">
              Free delivery + saving $3.00 on this order <strong>Go to</strong>
            </p>

            <h2 className="summary-title">Order Summary</h2>

            <div className="summary-row">
              <span className="summary-label">Items total</span>
              <span className="summary-value">${itemsTotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span className="summary-label">Delivery fee</span>
              <span className="summary-value">${deliveryFee.toFixed(2)}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row subtotal">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">${finalSubtotal.toFixed(2)}</span>
            </div>

            <Link to="/checkout" className="cart-checkout-btn">
              <div className="checkout-left-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="checkout-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <span className="checkout-text">Checkout</span>
              </div>
              <span className="checkout-price">${finalSubtotal.toFixed(2)}</span>
            </Link>

          </div>
        </div>

      </div>
    </main>
  );
}
