import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import LoadingState from "../components/common/LoadingState";
import AppRouter from "./router";
import { useLanguage, translate } from "../features/i18n/LanguageContext";

const Footer = lazy(() => import("../components/layout/Footer"));

export default function App() {
  const { language } = useLanguage();
  const [footerReady, setFooterReady] = useState(false);
  const location = useLocation();
  const accountDeleted = (location.state as { accountDeleted?: boolean } | null)?.accountDeleted === true;

  useEffect(() => {
    const timer = window.setTimeout(() => setFooterReady(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <Navbar />
      {accountDeleted && (
        <div role="status" className="mx-auto my-4 w-[min(92%,1200px)] rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800">
          {translate("Hesabınız silindi ve oturumunuz kapatıldı.", language)}
        </div>
      )}
      <Suspense fallback={<LoadingState message={translate("Sayfa yükleniyor...", language)} />}>
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
