import { Navigate, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Category from "./pages/Category";
import Search from "./pages/Search";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetail";
import OrderProgress from "./pages/OrderProgress";

import ProfileLayout from "./layouts/ProfileLayout";
import AccountDetails from "./pages/profile/AccountDetails";
import MyOrders from "./pages/profile/MyOrders";
import MyAddresses from "./pages/profile/MyAddresses";
import MyPayments from "./pages/profile/MyPayments";
import NotificationSetting from "./pages/profile/NotificationSetting";
import ReferFriends from "./pages/profile/ReferFriends";
import Coupons from "./pages/profile/Coupons";
import MyRecipes from "./pages/profile/MyRecipes";
import AccountSettings from "./pages/profile/AccountSettings";
import HelpCenter from "./pages/profile/HelpCenter";

export default function App() {
  return (
    <>
      <Navbar />
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
          <Route path="recipes" element={<MyRecipes />} />
          <Route path="settings" element={<AccountSettings />} />
          <Route path="help" element={<HelpCenter />} />
        </Route>
        <Route path="/:categorySlug/:productId" element={<ProductDetail />} />
      </Routes>
      <Footer />
    </>
  );
}
