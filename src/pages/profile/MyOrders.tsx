import { useState } from "react";
import { useOrders } from "../../features/orders/OrdersContext";
import { isPendingOrder } from "../../features/orders/orderStatus";
import { EditOrderAddressModal, OrderCard, ProfileEmptyState, ProfileFilterTabs, ProfileToast } from "../../components/profile";
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
      <ProfileEmptyState compact className="text-sm text-[#777]">Bu kategoride siparişiniz bulunmuyor.</ProfileEmptyState>
    ) : (
      <div className="flex flex-col gap-4">
        {orderList.map((order) => (
          <OrderCard key={order.id} order={order} onEditAddress={setEditingOrder} />
        ))}
      </div>
    )
  );

  return (
    <div className="w-full">
      <div className="mb-8 flex items-start justify-between gap-4 max-md:flex-col">
        <h2 className="text-[28px] font-extrabold text-[#111]">Siparişlerim (My Orders)</h2>
        
        {/* Filters Tabs */}
        {!ordersLoading && !ordersError && orders.length > 0 && (
          <ProfileFilterTabs
            options={[
              { id: "all", label: `Tüm Siparişlerim (${orders.length})` },
              { id: "pending", label: `Devam Eden / Teslim Edilmeyenler (${pendingOrders.length})` },
              { id: "delivered", label: `Teslim Edilenler (${deliveredOrders.length})` },
            ]}
            selected={filterTab}
            onSelect={setFilterTab}
          />
        )}
      </div>

      {ordersLoading ? (
        <div className="rounded-2xl border border-[#eee] p-8 text-center text-sm text-[#777]">Siparişler yükleniyor...</div>
      ) : ordersError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700" role="alert">{ordersError}</div>
      ) : orders.length === 0 ? (
        <ProfileEmptyState>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <p className="font-semibold text-[#555]">You have no orders yet.</p>
          <span className="text-sm text-[#999]">Your past orders will appear here after you complete a purchase.</span>
        </ProfileEmptyState>
      ) : (
        <div className="flex flex-col gap-8">
          
          {(filterTab === 'all' || filterTab === 'pending') && (
            <div className="orders-section">
              <h3 className="mb-4 border-b-2 border-[#eaeaea] pb-2 text-lg font-bold text-[#111]">
                Devam Eden Siparişler (Pending)
              </h3>
              {renderOrderList(pendingOrders)}
            </div>
          )}

          {(filterTab === 'all' || filterTab === 'delivered') && (
            <div className="orders-section">
              <h3 className="mb-4 border-b-2 border-[#eaeaea] pb-2 text-lg font-bold text-[#111]">
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
      <ProfileToast message={toastMessage} />
    </div>
  );
}
