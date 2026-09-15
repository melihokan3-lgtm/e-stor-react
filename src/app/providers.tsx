import type { ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { LocationProvider } from "../context/LocationContext";
import { OrdersProvider } from "../context/OrdersContext";

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
