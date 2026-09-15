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
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-10 text-center">
          <div className="mb-4">
            <svg
              className="h-[180px] w-[180px]"
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

              <circle cx="11.5" cy="12" r="0.5" fill="#b6349a" stroke="none"></circle>
              <circle cx="16.5" cy="12" r="0.5" fill="#b6349a" stroke="none"></circle>
              <path d="M12.5 15.5c0.5-0.8 2.5-0.8 3 0" stroke="#b6349a"></path>
            </svg>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-[#111]">Sepetin şu an boş</h2>
          <p className="mb-6 max-w-[520px] text-sm text-[#777]">Sepetini fırsatlarla dolu dünyamızdan doldurmak için hemen alışverişe başlayabilirsin.</p>

          <Link to="/" className="rounded-xl bg-[#b6349a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#de57c4]">
            Alışverişe Başla
          </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-[1400px] justify-center px-[60px] py-10 max-[768px]:px-6">
      <div className="grid w-full grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] items-start gap-10 max-[992px]:grid-cols-1">

        {/* LEFT COLUMN */}
        <div className="flex min-w-0 flex-col">

          {/* LOCAL MARKET HEADER */}
          <div
            className="mb-[30px] flex w-full items-center justify-between rounded-[20px] border border-[#eee] bg-white p-6 text-left transition hover:border-[#b6349a] hover:shadow-[0_8px_24px_rgba(182,52,154,0.1)] focus:outline-none focus-visible:border-[#b6349a] focus-visible:shadow-[0_8px_24px_rgba(182,52,154,0.1)] max-[640px]:items-start max-[640px]:gap-4"
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
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-[#fdf5fb]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b6349a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-medium text-[#b6349a]">
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
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[30px] border border-[#ddd] bg-white px-5 py-2.5 text-sm font-semibold text-[#111] transition hover:border-[#b6349a]"
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

          <div className="mb-4 text-xs text-[#888]">Items Name</div>

          {/* CART ITEMS LIST */}
          <div className="mb-10 flex flex-col gap-6">
            {cart.map((item) => {
              const product = item.data;
              const categorySlug = product.category.toLowerCase().replace(/\s+/g, "-") || "category";
              const productId = product.id;
              const imageSrc = product.image || cleanImageUrl(product.images?.[0]) || FALLBACK_IMG;
              const oldPrice = (product.price * 1.2).toFixed(2);
              const itemTotal = (product.price * item.unit).toFixed(2);

              return (
                <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-6 max-[992px]:flex-col max-[992px]:items-start max-[992px]:gap-4" key={product.id}>
                  <Link to={`/${categorySlug}/${productId}`} className="flex min-w-0 flex-1 items-center gap-4 no-underline">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#f6f6f6] p-2">
                      <img
                        src={imageSrc}
                        alt={product.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMG;
                        }}
                      />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <h4 className="truncate text-sm font-semibold text-[#111]">{product.title || "Sweet Green Seedless Grapes 1.5-2 lb"}</h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-extrabold text-[#b6349a]">${product.price.toFixed(2)}</span>
                        <span className="text-xs text-[#aaa] line-through">${oldPrice}</span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-6 max-[992px]:w-full max-[992px]:justify-between max-[640px]:gap-3">
                    <div className="flex items-center gap-3 rounded-[30px] bg-[#f8f7f8] p-[5px]">
                      <button
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-[#ddd] bg-white text-base text-[#555]"
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
                      <span className="min-w-4 text-center text-sm font-semibold">{item.unit}</span>
                      <button
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-[#b6349a] bg-[#b6349a] text-base text-white"
                        onClick={() => updateQuantity(product.id, 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="border-0 bg-transparent text-xs font-semibold text-[#b6349a]"
                      onClick={() => removeFromCart(product.id)}
                    >
                      Remove
                    </button>
                    <div className="min-w-[60px] text-right text-base font-extrabold text-[#111]">
                      ${itemTotal}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RECOMMENDATIONS */}
          <div className="mt-10">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="m-0 text-xl font-bold">Recommendations</h2>
              <div className="flex gap-3">
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#eee] bg-white text-xl text-[#555] transition hover:bg-[#fdf5fb] hover:text-[#b6349a] prev-rec">‹</button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#eee] bg-white text-xl text-[#555] transition hover:bg-[#fdf5fb] hover:text-[#b6349a] next-rec">›</button>
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
              className="w-full"
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
        <div className="min-w-0">
          <div className="rounded-3xl bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] max-[992px]:p-6">

            <div className="mb-4 h-1.5 overflow-hidden rounded-[3px] bg-[#f0f0f0]">
              <div className="h-full w-[65%] rounded-[3px] bg-[#b6349a]"></div>
            </div>
            <p className="mb-8 text-xs text-[#555]">
              Free delivery + saving $3.00 on this order <strong className="text-[#111]">Go to</strong>
            </p>

            <h2 className="mb-6 text-lg font-bold text-[#111]">Order Summary</h2>

            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-[#555]">Items total</span>
              <span className="text-sm font-medium text-[#555]">${itemsTotal.toFixed(2)}</span>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-[#555]">Delivery fee</span>
              <span className="text-sm font-medium text-[#555]">${deliveryFee.toFixed(2)}</span>
            </div>

            <div className="my-6 h-px bg-[#eee]"></div>

            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-bold text-[#111]">Subtotal</span>
              <span className="text-base font-bold text-[#111]">${finalSubtotal.toFixed(2)}</span>
            </div>

            <Link to="/checkout" className="mt-8 flex w-full items-center justify-between rounded-[30px] bg-[#b6349a] px-6 py-4 text-white transition hover:bg-[#de57c4]">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <span className="text-base font-semibold">Checkout</span>
              </div>
              <span className="text-base font-bold">${finalSubtotal.toFixed(2)}</span>
            </Link>

          </div>
        </div>

      </div>
    </main>
  );
}
