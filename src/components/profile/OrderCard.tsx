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
    <div className="order-card">
      <div className="order-header">
        <div className="order-header-left">
          <span className="order-id">Order {order.id}</span>
          <span className={`order-status status-${order.status.toLowerCase().replace(/\s+/g, "-")}`}>
            {order.status}
          </span>
        </div>
        <span className="order-date">{orderDate}</span>
      </div>

      <div className="order-address-section">
        <div className="order-address-info">
          <div className="order-address-label-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b6349a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="order-address-label">Teslimat Adresi</span>
          </div>
          <span className="order-address-value">{order.deliveryAddress || "Adres belirtilmemiş"}</span>
        </div>

        <div className="order-address-action-area">
          {isEditable ? (
            <button
              type="button"
              className="order-address-edit-btn"
              onClick={() => onEditAddress(order)}
              title="Kargoya verilmediği için adresi değiştirebilirsiniz"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Adresi Değiştir
            </button>
          ) : (
            <span className="order-address-locked-badge" title="Sipariş kargoya verildiği veya teslim edildiği için adres değiştirilemez">
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

      <div className="order-items">
        {order.items.map((item) => {
          const categorySlug = item.category?.toLowerCase().replace(/\s+/g, "-") || "product";
          const itemUrl = item.id ? `/${categorySlug}/${item.id}` : "#";

          return (
            <Link
              key={`${item.id || item.title}-${item.qty || 0}`}
              to={itemUrl}
              className="order-item"
              onClick={(event) => { if (!item.id) event.preventDefault(); }}
            >
              <img
                src={item.img || FALLBACK_IMG}
                alt={item.title}
                className="order-item-img"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_IMG;
                }}
              />
              <div className="order-item-info">
                <span className="order-item-title">{item.title}</span>
                <span className="order-item-meta">Qty: {item.qty} &middot; ${Number(item.price || 0).toFixed(2)}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="order-footer">
        <span className="order-total">Total: ${order.total.toFixed(2)}</span>
        <span className="order-items-count">{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}
