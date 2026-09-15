import { useState } from "react";
import { useOrders } from "../../features/orders/OrdersContext";
import { isPendingOrder } from "../../features/orders/orderStatus";
import EditOrderAddressModal from "../../components/profile/EditOrderAddressModal";
import OrderCard from "../../components/profile/OrderCard";
import type { Order } from "../../types/order";

export default function MyOrders() {
  const { orders, ordersLoading, ordersError, updateOrderAddress } = useOrders();
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const [filterTab, setFilterTab] = useState<"all" | "pending" | "delivered">("all");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const pendingOrders = orders.filter((order) => isPendingOrder(order.status));
  const deliveredOrders = orders.filter((order) => !isPendingOrder(order.status));

  const handleSaveNewAddress = (orderId: Order["id"], newAddress: string) => {
    if (!orderId) return;
    updateOrderAddress(orderId, newAddress);
    showToast("✨ Teslimat adresi başarıyla güncellendi!");
  };

  const renderOrderList = (orderList: Order[]) => (
    orderList.length === 0 ? (
      <div className="orders-empty-state">Bu kategoride siparişiniz bulunmuyor.</div>
    ) : (
      <div className="order-list">
        {orderList.map((order) => (
          <OrderCard key={order.id} order={order} onEditAddress={setEditingOrder} />
        ))}
      </div>
    )
  );

  return (
    <div className="my-orders-page">
      <div className="orders-page-header">
        <h2 className="profile-page-title">Siparişlerim (My Orders)</h2>
        
        {/* Filters Tabs */}
        {!ordersLoading && !ordersError && orders.length > 0 && (
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

      {ordersLoading ? (
        <div className="orders-empty">Siparişler yükleniyor...</div>
      ) : ordersError ? (
        <div className="orders-empty" role="alert">{ordersError}</div>
      ) : orders.length === 0 ? (
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
