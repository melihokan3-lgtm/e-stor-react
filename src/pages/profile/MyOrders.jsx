import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { OrdersContext } from "../../context/OrdersContext";
import { FALLBACK_IMG } from "../../services/api";
import EditOrderAddressModal from "../../components/EditOrderAddressModal";

// Returns true if order has NOT yet been shipped or completed
export const canEditOrderAddress = (status = "") => {
  const s = String(status).toLowerCase().trim();
  const shippedStatuses = [
    "shipped",
    "kargoda",
    "kargoya verildi",
    "in transit",
    "on the way",
    "delivered",
    "teslim edildi",
    "cancelled",
    "iptal edildi"
  ];
  return !shippedStatuses.includes(s);
};

export default function MyOrders() {
  const { orders, updateOrderAddress } = useContext(OrdersContext);
  const [editingOrder, setEditingOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const [filterTab, setFilterTab] = useState("all"); // 'all', 'pending', 'delivered'

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const isPending = (status) => {
    const s = String(status).toLowerCase();
    return s === "pending" || s === "processing" || s === "order placed" || s === "hazırlanıyor";
  };

  const pendingOrders = orders.filter((order) => isPending(order.status));
  const deliveredOrders = orders.filter((order) => !isPending(order.status));

  const handleSaveNewAddress = (orderId, newAddress) => {
    if (!orderId) return;
    updateOrderAddress(orderId, newAddress);
    showToast("✨ Teslimat adresi başarıyla güncellendi!");
  };

  const renderOrderList = (orderList) => {
    if (orderList.length === 0) return (
      <div className="orders-empty-state">Bu kategoride siparişiniz bulunmuyor.</div>
    );

    return (
      <div className="order-list">
        {orderList.map((order, idx) => {
          const isEditable = canEditOrderAddress(order.status);

          return (
            <div key={idx} className="order-card">
              {/* Header */}
              <div className="order-header">
                <div className="order-header-left">
                  <span className="order-id">Order {order.id}</span>
                  <span className={`order-status status-${String(order.status).toLowerCase().replace(/\s+/g, "-")}`}>
                    {order.status}
                  </span>
                </div>
                <span className="order-date">{order.date}</span>
              </div>

              {/* Address Section */}
              <div className="order-address-section">
                <div className="order-address-info">
                  <div className="order-address-label-row">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b6349a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
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
                      onClick={() => setEditingOrder(order)}
                      title="Kargoya verilmediği için adresi değiştirebilirsiniz"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Adresi Değiştir
                    </button>
                  ) : (
                    <span className="order-address-locked-badge" title="Sipariş kargoya verildiği veya teslim edildiği için adres değiştirilemez">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                      </svg>
                      Kargoya Verildi
                    </span>
                  )}
                </div>
              </div>

            {/* Items */}
            <div className="order-items">
              {order.items.map((item, i) => {
                const categorySlug =
                  (typeof item.category === "string" ? item.category : item.category?.name)
                    ?.toLowerCase()
                    .replace(/\s+/g, "-") || "product";
                const itemUrl = item.id ? `/${categorySlug}/${item.id}` : "#";

                return (
                  <Link
                    key={i}
                    to={itemUrl}
                    className="order-item"
                    onClick={(e) => {
                      if (!item.id) e.preventDefault();
                    }}
                  >
                    <img
                      src={item.img || FALLBACK_IMG}
                      alt={item.title}
                      className="order-item-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMG;
                      }}
                    />
                    <div className="order-item-info">
                      <span className="order-item-title">{item.title}</span>
                      <span className="order-item-meta">
                        Qty: {item.qty} &middot; ${Number(item.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Footer */}
            <div className="order-footer">
              <span className="order-total">Total: ${order.total.toFixed(2)}</span>
              <span className="order-items-count">{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
            </div>
          </div>
        );
      })}
      </div>
    );
  };

  return (
    <div className="my-orders-page">
      <div className="orders-page-header">
        <h2 className="profile-page-title">Siparişlerim (My Orders)</h2>
        
        {/* Filters Tabs */}
        {orders.length > 0 && (
          <div className="orders-filter-tabs">
            <button 
              className={`order-tab-btn ${filterTab === 'all' ? 'active' : ''}`}
              onClick={() => setFilterTab('all')}
            >
              Tüm Siparişlerim ({orders.length})
            </button>
            <button 
              className={`order-tab-btn ${filterTab === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterTab('pending')}
            >
              Devam Eden / Teslim Edilmeyenler ({pendingOrders.length})
            </button>
            <button 
              className={`order-tab-btn ${filterTab === 'delivered' ? 'active' : ''}`}
              onClick={() => setFilterTab('delivered')}
            >
              Teslim Edilenler ({deliveredOrders.length})
            </button>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <p>You have no orders yet.</p>
          <span>Your past orders will appear here after you complete a purchase.</span>
        </div>
      ) : (
        <div className="orders-container" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          
          {(filterTab === 'all' || filterTab === 'pending') && (
            <div className="orders-section">
              <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#111", borderBottom: "2px solid #eaeaea", paddingBottom: "8px" }}>
                Devam Eden Siparişler (Pending)
              </h3>
              {renderOrderList(pendingOrders)}
            </div>
          )}

          {(filterTab === 'all' || filterTab === 'delivered') && (
            <div className="orders-section">
              <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#111", borderBottom: "2px solid #eaeaea", paddingBottom: "8px" }}>
                Teslim Edilenler / Kargodakiler
              </h3>
              {renderOrderList(deliveredOrders)}
            </div>
          )}

        </div>
      )}

      {/* Edit Address Modal */}
      <EditOrderAddressModal
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        order={editingOrder}
        onSaveAddress={handleSaveNewAddress}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="payments-toast-notification">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
