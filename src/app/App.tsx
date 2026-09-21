import { lazy, Suspense, useEffect, useState } from "react";
import Navbar from "../components/layout/Navbar";
import LoadingState from "../components/common/LoadingState";
import AppRouter from "./router";

const Footer = lazy(() => import("../components/layout/Footer"));

export default function App() {
  const [footerReady, setFooterReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setFooterReady(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <Navbar />
      <Suspense fallback={<LoadingState message="Sayfa yükleniyor..." />}>
        <AppRouter />
      </Suspense>
      {footerReady && (
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      )}
    </>
  );
}
