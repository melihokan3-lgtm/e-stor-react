import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import AppProviders from "./app/providers";
import "./style.css";
import "./styles/tailwind.css";
import "swiper/css";

// Remove obsolete demo payment-card metadata left by older releases.
// Real card details must only ever be handled by a hosted payment provider.
try {
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith("savedCards_")) localStorage.removeItem(key);
  }
} catch {
  // Storage may be unavailable in privacy-restricted browsers.
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Application root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
        <AppProviders>
          <App />
        </AppProviders>
    </BrowserRouter>
  </StrictMode>,
);
