import type { ReactNode } from "react";
import { AuthProvider } from "../features/auth/AuthContext";
import { CartProvider } from "../features/cart/CartContext";
import { LocationProvider } from "../features/addresses/LocationContext";
import { OrdersProvider } from "../features/orders/OrdersContext";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LocationProvider>
        <OrdersProvider>
          <CartProvider>{children}</CartProvider>
        </OrdersProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
