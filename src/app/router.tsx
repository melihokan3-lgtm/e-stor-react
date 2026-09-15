import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const Home = lazy(() => import("../pages/Home"));
const Category = lazy(() => import("../pages/Category"));
const Search = lazy(() => import("../pages/Search"));
const Cart = lazy(() => import("../pages/Cart"));
const Checkout = lazy(() => import("../pages/Checkout"));
const ProductDetail = lazy(() => import("../pages/ProductDetail"));
const OrderProgress = lazy(() => import("../pages/OrderProgress"));
const ProfileLayout = lazy(() => import("../layouts/ProfileLayout"));
const AccountDetails = lazy(() => import("../pages/profile/AccountDetails"));
const MyOrders = lazy(() => import("../pages/profile/MyOrders"));
const MyAddresses = lazy(() => import("../pages/profile/MyAddresses"));
const MyPayments = lazy(() => import("../pages/profile/MyPayments"));
const NotificationSetting = lazy(() => import("../pages/profile/NotificationSetting"));
const ReferFriends = lazy(() => import("../pages/profile/ReferFriends"));
const Coupons = lazy(() => import("../pages/profile/Coupons"));
const AccountSettings = lazy(() => import("../pages/profile/AccountSettings"));
const HelpCenter = lazy(() => import("../pages/profile/HelpCenter"));

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/category" element={<Category />} />
      <Route path="/search" element={<Search />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-progress" element={<OrderProgress />} />
      <Route path="/profile" element={<ProfileLayout />}>
        <Route index element={<Navigate to="details" replace />} />
        <Route path="details" element={<AccountDetails />} />
        <Route path="orders" element={<MyOrders />} />
        <Route path="addresses" element={<MyAddresses />} />
        <Route path="payments" element={<MyPayments />} />
        <Route path="notifications" element={<NotificationSetting />} />
        <Route path="refer" element={<ReferFriends />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="settings" element={<AccountSettings />} />
        <Route path="help" element={<HelpCenter />} />
      </Route>
      <Route path="/:categorySlug/:productId" element={<ProductDetail />} />
    </Routes>
  );
}
