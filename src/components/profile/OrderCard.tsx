import { Link } from "react-router-dom";
import { canEditOrderAddress } from "../../features/orders/orderStatus";
import { FALLBACK_IMG } from "../../services/api/productApi";
import type { Order } from "../../types/order";

interface OrderCardProps {
  order: Order;
  onEditAddress: (order: Order) => void;
}

export default function OrderCard({ order, onEditAddress }: OrderCardProps) {
  const isEditable = canEditOrderAddress(order.status);
  const orderDate = order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString("tr-TR") : "");

  return (
    <div className="rounded-2xl border border-[#eee] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      {order.isDemo && <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">Demo sipariş — gerçek ödeme alınmadı, ürün gönderilmeyecek.</p>}
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#f2f2f2] pb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#111]">Order {order.id}</span>
          <span className="rounded-full bg-[#b6349a]/[.1] px-2.5 py-1 text-xs font-semibold text-[#b6349a]">
            {order.status}
          </span>
        </div>
        <span className="text-xs text-[#999]">{orderDate}</span>
      </div>

      <div className="mb-4 flex items-start justify-between gap-4 rounded-xl bg-[#faf9fa] p-4 max-sm:flex-col">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b6349a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-xs font-bold text-[#555]">Teslimat Adresi</span>
          </div>
          <span className="block break-words text-sm text-[#777]">{order.deliveryAddress || "Adres belirtilmemiş"}</span>
        </div>

        <div className="shrink-0">
          {isEditable ? (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#b6349a] transition hover:bg-[#b6349a]/[.08]"
              onClick={() => onEditAddress(order)}
              title="Kargoya verilmediği için adresi değiştirebilirsiniz"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Adresi Değiştir
            </button>
          ) : order.isDemo ? (
            <span className="text-xs font-semibold text-amber-800">Demo — gönderim yok</span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-[#6b7280]" title="Sipariş kargoya verildiği veya teslim edildiği için adres değiştirilemez">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              Kargoya Verildi
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        {order.items.map((item) => {
          const categorySlug = item.category?.toLowerCase().replace(/\s+/g, "-") || "product";
          const itemUrl = item.id ? `/${categorySlug}/${item.id}` : "#";

          return (
            <Link
              key={`${item.id || item.title}-${item.qty || 0}`}
              to={itemUrl}
              className="flex min-w-[180px] flex-1 items-center gap-3 rounded-xl border border-[#f2f2f2] p-3 transition hover:border-[#b6349a]/[.3]"
              onClick={(event) => { if (!item.id) event.preventDefault(); }}
            >
              <img
                src={item.img || FALLBACK_IMG}
                alt={item.title}
                width={56}
                height={56}
                className="h-14 w-14 rounded-lg bg-[#faf9fa] object-contain p-1"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_IMG;
                }}
              />
              <div className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[#222]">{item.title}</span>
                <span className="text-xs text-[#999]">Qty: {item.qty} &middot; ${Number(item.price || 0).toFixed(2)}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-[#f2f2f2] pt-4">
        <span className="font-bold text-[#111]">Total: ${order.total.toFixed(2)}</span>
        <span className="text-xs text-[#999]">{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}
