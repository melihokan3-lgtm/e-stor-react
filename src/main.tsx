import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
import AppProviders from "./app/providers";
import "./style.css";
import "./styles/tailwind.css";
// Import Swiper styles bundle to match the old CDN swiper-bundle.min.css
import "swiper/css/bundle";

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
