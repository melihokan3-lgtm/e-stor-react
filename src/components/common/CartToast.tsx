import { translate } from "../../features/i18n/LanguageContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../features/cart/CartContext";

export default function CartToast() {
  const { lastAddedProduct, dismissCartToast } = useCart();
  const [isExiting, setIsExiting] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const closeToast = useCallback(() => {
    setIsExiting(true);
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      dismissCartToast();
      closeTimerRef.current = null;
    }, 400);
  }, [dismissCartToast]);

  useEffect(() => {
    if (!lastAddedProduct) return;
    setIsExiting(false);
    const timeoutId = window.setTimeout(closeToast, 3500);
    return () => window.clearTimeout(timeoutId);
  }, [lastAddedProduct, closeToast]);

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
  }, []);

  if (!lastAddedProduct) return null;

  return (
    <div className={`fixed right-4 top-4 z-[100] flex w-[min(360px,calc(100vw-32px))] items-start gap-3 rounded-2xl border border-[#ecd7e8] bg-white p-4 shadow-[0_12px_32px_rgba(62,28,55,0.16)] transition-[transform,opacity] duration-400 ease-out [@media(max-width:480px)]:right-3 [@media(max-width:480px)]:top-3 ${isExiting ? "-translate-y-3 opacity-0" : "translate-y-0 opacity-100"}`}>
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f8e8f5] text-[#b6349a]" aria-hidden="true">
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 7h15l-1.5 9h-12z" />
          <path d="M6 7 5 3H2" />
          <circle cx="9" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm font-bold text-[#222]">{translate("Added to cart")}</p>
        <p className="mt-1 truncate text-xs text-[#777]" title={lastAddedProduct}>{lastAddedProduct}</p>
        <Link to="/cart" onClick={closeToast} className="mt-2 inline-flex text-xs font-bold text-[#b6349a] hover:text-[#92277a]">{translate("View cart")}</Link>
      </div>
      <button type="button" onClick={closeToast} className="grid size-7 shrink-0 place-items-center rounded-full text-lg leading-none text-[#999] transition hover:bg-[#f8e8f5] hover:text-[#b6349a]" aria-label={translate("Close notification")}>×</button>
    </div>
  );
}
