import { translate } from "../../features/i18n/LanguageContext";
import { useState } from "react";
import { useOrders } from "../../features/orders/OrdersContext";
import { isPendingOrder } from "../../features/orders/orderStatus";
import { EditOrderAddressModal, OrderCard, ProfileEmptyState, ProfileFilterTabs, ProfileToast } from "../../components/profile";
import type { Order } from "../../types/order";
import SeoMeta from "../../components/common/SeoMeta";

export default function MyOrders() {
  const { orders, ordersLoading, ordersError, updateOrderAddress } = useOrders();
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const [filterTab, setFilterTab] = useState<"all" | "pending" | "delivered" | "demo">("all");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const demoOrders = orders.filter((order) => order.isDemo);
  const pendingOrders = orders.filter((order) => !order.isDemo && isPendingOrder(order.status));
  const deliveredOrders = orders.filter((order) => !order.isDemo && !isPendingOrder(order.status));

  const handleSaveNewAddress = (orderId: Order["id"], newAddress: string) => {
    if (!orderId) return;
    updateOrderAddress(orderId, newAddress);
    showToast("✨ Teslimat adresi başarıyla güncellendi!");
  };

  const renderOrderList = (orderList: Order[]) => (
    orderList.length === 0 ? (
      <ProfileEmptyState compact className="text-sm text-[#777]">{translate("Bu kategoride siparişiniz bulunmuyor.")}</ProfileEmptyState>
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
      <SeoMeta title={translate("Siparişlerim | E-Storee")} description="E-Storee sipariş geçmişinizi ve teslimat durumlarınızı görüntüleyin." canonicalPath="/profile/orders" robots="noindex,nofollow" />
      <div className="mb-8 flex items-start justify-between gap-4 max-md:flex-col">
        <h1 className="text-[28px] font-extrabold text-[#111]">{translate("Siparişlerim (My Orders)")}</h1>
        
        {/* Filters Tabs */}
        {!ordersLoading && !ordersError && orders.length > 0 && (
          <ProfileFilterTabs
            options={[
              { id: "all", label: `Tüm Siparişlerim (${orders.length})` },
              { id: "pending", label: `Devam Eden / Teslim Edilmeyenler (${pendingOrders.length})` },
              { id: "delivered", label: `Teslim Edilenler (${deliveredOrders.length})` },
              { id: "demo", label: `Test İşlemleri (${demoOrders.length})` },
            ]}
            selected={filterTab}
            onSelect={setFilterTab}
          />
        )}
      </div>

      {ordersError && orders.length > 0 && <p role="status" className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{ordersError}</p>}
      {ordersLoading ? (
        <div className="rounded-2xl border border-[#eee] p-8 text-center text-sm text-[#777]">{translate("Siparişler yükleniyor...")}</div>
      ) : ordersError && orders.length === 0 ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700" role="alert">{ordersError}</div>
      ) : orders.length === 0 ? (
        <ProfileEmptyState>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <p className="font-semibold text-[#555]">{translate("You have no orders yet.")}</p>
          <span className="text-sm text-[#999]">{translate("Your past orders will appear here after you complete a purchase.")}</span>
        </ProfileEmptyState>
      ) : (
        <div className="flex flex-col gap-8">
          
          {(filterTab === 'all' || filterTab === 'pending') && (
            <div className="orders-section">
              <h3 className="mb-4 border-b-2 border-[#eaeaea] pb-2 text-lg font-bold text-[#111]">
                {translate("\r\n                Devam Eden Siparişler (Pending)\r\n              ")}</h3>
              {renderOrderList(pendingOrders)}
            </div>
          )}

          {(filterTab === 'all' || filterTab === 'delivered') && (
            <div className="orders-section">
              <h3 className="mb-4 border-b-2 border-[#eaeaea] pb-2 text-lg font-bold text-[#111]">
                {translate("\r\n                Teslim Edilenler / Kargodakiler\r\n              ")}</h3>
              {renderOrderList(deliveredOrders)}
            </div>
          )}

          {(filterTab === 'all' || filterTab === 'demo') && demoOrders.length > 0 && (
            <div className="orders-section">
              <h3 className="mb-4 border-b-2 border-[#eaeaea] pb-2 text-lg font-bold text-[#111]">{translate("Test işlemleri — ödeme ve kargo yok")}</h3>
              {renderOrderList(demoOrders)}
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
