import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useOrders } from "../features/orders/OrdersContext";
import { useAuth } from "../features/auth/AuthContext";
import { FALLBACK_IMG } from "../services/api/productApi";
import SeoMeta from "../components/common/SeoMeta";

const formatAmount = (amount: number): string =>
  `${amount < 0 ? "-" : ""}$${Math.abs(amount).toFixed(2)}`;

export default function OrderProgress() {
  const { orders, ordersLoading, ordersError } = useOrders();
  const { isLoggedIn, openAuthModal } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedOrderId = searchParams.get("orderId");
  const order = requestedOrderId
    ? orders.find((item) => String(item.id) === requestedOrderId)
    : orders[0];
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { setCurrentPage(1); }, [requestedOrderId]);

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#fafafa] px-5 py-10">
        <SeoMeta title="Sipariş Takibi | E-Storee" description="E-Storee siparişinizin durumunu ve teslimat bilgilerini takip edin." canonicalPath="/order-progress" robots="noindex,nofollow" />
        <h1 className="sr-only">Sipariş Takibi</h1>
        <div className="mx-auto w-full max-w-[1200px] rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <p>Siparişinizi görmek için giriş yapın.</p>
          <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-[#b6349a] px-4 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[#98277f]" onClick={openAuthModal}>Login</button>
        </div>
      </main>
    );
  }
  if (ordersLoading) {
    return <main className="min-h-screen bg-[#fafafa] px-5 py-10"><SeoMeta title="Sipariş Takibi | E-Storee" description="E-Storee siparişinizin durumunu ve teslimat bilgilerini takip edin." canonicalPath="/order-progress" robots="noindex,nofollow" /><h1 className="sr-only">Sipariş Takibi</h1><div className="mx-auto w-full max-w-[1200px] rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">Loading order...</div></main>;
  }
  if (ordersError && !order?.isDemo) {
    return <main className="min-h-screen bg-[#fafafa] px-5 py-10"><SeoMeta title="Sipariş Takibi | E-Storee" description="E-Storee siparişinizin durumunu ve teslimat bilgilerini takip edin." canonicalPath="/order-progress" robots="noindex,nofollow" /><h1 className="sr-only">Sipariş Takibi</h1><div className="mx-auto w-full max-w-[1200px] rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]" role="alert">{ordersError}</div></main>;
  }
  if (!order) {
    return (
      <main className="min-h-screen bg-[#fafafa] px-5 py-10">
        <SeoMeta title="Sipariş Takibi | E-Storee" description="E-Storee siparişinizin durumunu ve teslimat bilgilerini takip edin." canonicalPath="/order-progress" robots="noindex,nofollow" />
        <h1 className="sr-only">Sipariş Takibi</h1>
        <div className="mx-auto w-full max-w-[1200px] rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <p>Order not found.</p>
          <Link to="/profile/orders" className="inline-flex items-center gap-2 rounded-lg bg-[#b6349a] px-4 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[#98277f]">My Orders</Link>
        </div>
      </main>
    );
  }

  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(order.items.length / itemsPerPage));
  const page = Math.min(currentPage, totalPages);
  const displayedItems = order.items.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const itemsTotal = order.items.reduce((total, item) => total + item.price * item.qty, 0);
  const adjustments = order.total - itemsTotal;
  const placedAt = order.createdAt
    ? new Date(order.createdAt).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : order.date || "";
  const status = order.status || "Processing";

  return (
    <main className="min-h-screen bg-[#fafafa] px-5 py-10">
      <SeoMeta title={order.isDemo ? "Demo Ödeme Onayı | E-Storee" : "Sipariş Takibi | E-Storee"} description={order.isDemo ? "Demo ödeme onayı ve ürün özeti. Gerçek ödeme alınmaz." : "E-Storee siparişinizin durumunu ve teslimat bilgilerini takip edin."} canonicalPath="/order-progress" robots="noindex,nofollow" />
      <h1 className="sr-only">{order.isDemo ? "Demo Ödeme Onayı" : "Sipariş Takibi"}</h1>
      <div className="mx-auto w-full max-w-[1200px]">

        {order.isDemo && (
          <div role="status" className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
            <h2 className="text-xl font-bold">Demo ödeme tamamlandı</h2>
            <p className="mt-1 text-sm leading-6">Bu bir test işlemidir. Gerçek para çekilmedi, Supabase'te gerçek sipariş oluşturulmadı ve ürün gönderilmeyecek.</p>
          </div>
        )}

        {/* Top Actions */}
        <div className="mb-6 flex items-center justify-between">
          <button type="button" aria-label="Go back" className="grid h-10 w-10 place-items-center rounded-full border border-[#eee] bg-white text-[#555] hover:border-[#b6349a]" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <Link to={order.isDemo ? "/profile/orders" : "/profile/help"} className="inline-flex items-center gap-2 rounded-lg bg-[#b6349a] px-4 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[#98277f] no-underline">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            {order.isDemo ? "Demo kayıtlarım" : "Help"}
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
          {/* LEFT COLUMN */}
          <div className="grid gap-5">

            {/* Order Status Card */}
            <div className="rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2>{order.isDemo ? "Ödeme Onayı ve Özet" : `Order ${status === "Processing" ? "In Progress" : status}`}</h2>
                  <p>{order.isDemo ? "Demo işlem tarihi" : "Order placed on"} {placedAt}</p>
                </div>
                <div className="rounded-full bg-[#fff0fa] px-3 py-1 text-xs font-semibold text-[#b6349a]">{status}</div>
              </div>

              <div className="my-8 flex flex-col items-center justify-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-[#b6349a]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h3>{order.isDemo ? "Demo işlem onaylandı" : "Order is Placed"}</h3>
              </div>

              {!order.isDemo && <div className="relative mt-8">
                <div className="absolute left-0 right-0 top-4 h-1 bg-[#eee]"></div>
                <div className="absolute left-0 top-4 h-1 w-1/2 bg-[#b6349a]"></div>

                <div className="relative flex justify-between">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#b6349a] bg-[#b6349a]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-xs text-[#777]">{placedAt}</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#b6349a] bg-white"></div>
                    <span className="text-xs text-[#777]">{status}</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#ddd] bg-white"></div>
                    <span className="text-xs text-[#777]">Pending</span>
                  </div>
                </div>
              </div>}
            </div>

            {/* Items List Card */}
            <div className="rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <div className="mb-4 flex justify-between border-b border-[#eee] pb-3 text-sm font-semibold text-[#555]">
                <span className="h-left">Items Name</span>
                <span className="h-right">N.of items</span>
              </div>

              <div className="space-y-3">
                {displayedItems.map((item) => {
                  const imageSrc = item.img || FALLBACK_IMG;
                  return (
                    <div className="flex items-center justify-between gap-4 border-b border-[#f1f1f1] pb-3" key={item.id}>
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f8f8f8]">
                          <img
                            src={imageSrc}
                            alt={item.title}
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
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-semibold text-[#222]">{item.title}</h4>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#222]">{formatAmount(item.price)}</span>
                            {!order.isDemo && <span className="text-xs text-[#999] line-through">{formatAmount(item.price * 1.2)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-[#555]">
                        {item.qty}x
                      </div>
                    </div>
                  );
                })}
                {order.items.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                    No items in order.
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-5 flex items-center justify-center gap-2">
                  <button
                    className="grid h-8 w-8 place-items-center rounded border border-[#eee] bg-white text-[#555] disabled:opacity-40"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`grid h-8 w-8 place-items-center rounded text-sm text-[#555] ${page === i + 1 ? 'bg-[#b6349a] text-white' : ''}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="grid h-8 w-8 place-items-center rounded border border-[#eee] bg-white text-[#555] disabled:opacity-40"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Help Card */}
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <p>Need help with this order?</p>
              <Link className="rounded-lg border border-[#b6349a] px-4 py-2 text-sm font-semibold text-[#b6349a] no-underline no-underline" to="/profile/help">Help Center</Link>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="grid content-start gap-5">

            {/* Order Summary */}
            <div className="rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <h3 className="mb-4 text-base font-semibold text-[#222]">Order Summary</h3>
              <div className="flex items-center justify-between gap-4 border-b border-[#eee] pb-3">
                <span className="text-sm text-[#888]">Order Number</span>
                <span className="text-sm font-bold text-[#111] text-[#b6349a] flex min-w-0 items-center gap-2 break-all min-w-0 break-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  {order.id}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 mt-4">
                <span className="text-sm text-[#888]">Items total</span>
                <span className="text-sm font-bold text-[#111]">{formatAmount(itemsTotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-[#888]">Delivery & adjustments</span>
                <span className="text-sm font-bold text-[#111]">{formatAmount(adjustments)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-[#eee] pt-5 mt-6">
                <span className="text-base font-semibold text-[#222]">Total</span>
                <span className="text-lg font-bold text-[#b6349a]">{formatAmount(order.total)}</span>
              </div>
            </div>

            {/* Pay With */}
            <div className="rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <h3 className="mb-4 text-base font-semibold text-[#222]">{order.isDemo ? "Demo Kart (tahsilat yok)" : "Pay With"}</h3>
              <div className="flex items-center gap-3 text-sm">
                <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="20" rx="4" fill="#111"/>
                  <circle cx="12" cy="10" r="6" fill="#EB001B"/>
                  <circle cx="20" cy="10" r="6" fill="#F79E1B" fillOpacity="0.8"/>
                </svg>
                <span className="text-[#b6349a]">{order.paymentMethod || "Payment method unavailable"}</span>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="rounded-2xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <h3 className="mb-4 text-base font-semibold text-[#222]">{order.isDemo ? "Seçilen Adres (gönderim yok)" : "Delivery Address"}</h3>
              <div className="flex items-center gap-3 text-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b6349a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span className="text-[#b6349a] min-w-0 break-words">{order.deliveryAddress}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
