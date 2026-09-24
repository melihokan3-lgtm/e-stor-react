import type { ReactNode } from "react";
import { AuthProvider } from "../features/auth/AuthContext";
import { CartProvider } from "../features/cart/CartContext";
import { LocationProvider } from "../features/addresses/LocationContext";
import { OrdersProvider } from "../features/orders/OrdersContext";
import CartToast from "../components/common/CartToast";
import { LanguageProvider } from "../features/i18n/LanguageContext";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
    <AuthProvider>
      <LocationProvider>
        <OrdersProvider>
          <CartProvider>
            {children}
            <CartToast />
          </CartProvider>
        </OrdersProvider>
      </LocationProvider>
    </AuthProvider>
    </LanguageProvider>
  );
}
