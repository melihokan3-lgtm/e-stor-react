import { translate } from "../../features/i18n/LanguageContext";
import { useState, useEffect, type FormEvent } from "react";
import { useLocation } from "../../features/addresses/LocationContext";
import type { Order } from "../../types/order";

interface EditOrderAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSaveAddress: (orderId: Order["id"], address: string) => void;
}

export default function EditOrderAddressModal({
  isOpen,
  onClose,
  order,
  onSaveAddress,
}: EditOrderAddressModalProps) {
  const { location, addresses } = useLocation();
  const [addressInput, setAddressInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (order) {
      setAddressInput(order.deliveryAddress || "");
      setError("");
    }
  }, [order, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = addressInput.trim();
    if (!trimmed) {
      setError("Lütfen geçerli bir teslimat adresi girin.");
      return;
    }
    if (trimmed.length < 5) {
      setError("Adres en az 5 karakterden oluşmalıdır.");
      return;
    }
    onSaveAddress(order.id, trimmed);
    onClose();
  };

  // Quick selectable addresses
  const quickOptions = [
    ...(addresses?.map((a) => a.address) || []),
    location,
    "Bursa, Nilüfer, Türkiye",
    "İstanbul, Kadıköy, Türkiye"
  ].filter(Boolean);

  const uniqueQuickOptions = Array.from(new Set(quickOptions)).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-address-modal-title"
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#eee] pb-4">
          <div>
            <h3 id="edit-address-modal-title" className="text-lg font-bold text-[#111]">{translate("Teslimat Adresini Değiştir")}</h3>
            <span className="text-xs text-[#999]">
              {translate("Order: ")}{order.id} {translate(" • Status: ")}{translate(order.status)}
            </span>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-[#777] hover:bg-[#f5f5f5]"
            onClick={onClose}
            aria-label={translate("Kapat")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Notice Info */}
        <div className="mb-5 flex gap-3 rounded-xl bg-sky-50 p-3 text-sm text-sky-800">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <div>
            <strong className="block">{translate("Kargoya Verilmedi")}</strong>
            <p className="m-0 mt-1 text-xs">{translate("Siparişiniz henüz kargoya teslim edilmediği için teslimat adresinizi güncelleyebilirsiniz.")}</p>
          </div>
        </div>

        {/* Quick select pills */}
        {uniqueQuickOptions.length > 0 && (
          <div className="mb-5">
            <span className="mb-2 block text-xs font-semibold text-[#777]">{translate("Kayıtlı & Önerilen Adresler:")}</span>
            <div className="flex flex-wrap gap-2">
              {uniqueQuickOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition ${addressInput === opt ? "border-[#b6349a] bg-[#b6349a] text-white" : "border-[#eee] text-[#777] hover:border-[#b6349a]"}`}
                  onClick={() => {
                    setAddressInput(opt);
                    setError("");
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#333]">{translate("Yeni Teslimat Adresi")}</label>
            <textarea
              className={`w-full resize-y rounded-xl border bg-white p-3 text-sm outline-none transition focus:border-[#b6349a] focus:ring-2 focus:ring-[#b6349a]/[.12] ${error ? "border-red-500" : "border-[#ddd]"}`}
              rows={3}
              placeholder={translate("Mahalle, sokak, bina no, ilçe ve şehir giriniz...")}
              value={addressInput}
              onChange={(e) => {
                setAddressInput(e.target.value);
                if (error) setError("");
              }}
              autoFocus
            />
            {error && <span className="mt-1 block text-xs text-red-600">{translate(error)}</span>}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg bg-[#f3f3f3] px-4 py-2.5 text-sm font-semibold text-[#555]"
              onClick={onClose}
            >
              {translate("\r\n              Vazgeç\r\n            ")}</button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-[#b6349a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#92277a]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
              {translate("\r\n              Adresi Güncelle\r\n            ")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
