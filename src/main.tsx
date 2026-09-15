import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./style.css";
// Import Swiper styles bundle to match the old CDN swiper-bundle.min.css
import "swiper/css/bundle";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { OrdersProvider } from "./context/OrdersContext";
import { LocationProvider } from "./context/LocationContext";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Application root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
        <AuthProvider>
          <LocationProvider>
            <OrdersProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </OrdersProvider>
          </LocationProvider>
        </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
