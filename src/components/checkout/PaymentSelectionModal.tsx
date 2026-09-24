import { translate } from "../../features/i18n/LanguageContext";
import { useState, useEffect, type FormEvent } from "react";
import { CARD_THEMES, detectCardType } from "../../utils/cardUtils";
import { loadSavedCards, saveSavedCards } from "../../features/payments/savedCards";
import { useCardForm } from "../../features/payments/useCardForm";
import CardThemeSelector from "../payments/CardThemeSelector";
import type { AuthUser } from "../../types/auth";
import type { PaymentCard } from "../../types/payment";

const cardFieldClass = "flex min-h-12 items-center gap-2 rounded-xl border border-[#e8e8e8] bg-[#fafafa] px-3.5 transition focus-within:border-[#b6349a] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#b6349a]/10";
const cardInputClass = "box-border min-w-0 w-full flex-1 border-0 bg-transparent px-1 py-0.5 text-sm font-medium text-[#222] outline-none placeholder:text-[#b8b8b8]";

interface PaymentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCardId?: PaymentCard["id"];
  onSelectCard: (card: PaymentCard) => void;
  user: AuthUser | null;
}

export default function PaymentSelectionModal({
  isOpen,
  onClose,
  selectedCardId,
  onSelectCard,
  user
}: PaymentSelectionModalProps) {
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [activeTab, setActiveTab] = useState<"saved" | "new">("saved");
  const {
    formData, errors, handleNameChange, handleCardNumberChange,
    handleExpiryChange, handleCvvChange, validateForm, createCard, setTheme, resetForm,
  } = useCardForm();

  // Sync cards with user storage on open / user change
  useEffect(() => {
    if (!isOpen) return;
    setCards(loadSavedCards(user));
  }, [isOpen, user]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddCardSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newCard = createCard(cards.length === 0);

    const updated = [newCard, ...cards];
    setCards(updated);
    saveSavedCards(user, updated);

    // Auto-select the newly added card and close modal
    onSelectCard(newCard);
    resetForm();
    setActiveTab("saved");
    onClose();
  };

  const renderCardLogo = (type: PaymentCard["cardType"]) => {
    if (type === "mastercard") {
      return (
        <svg className="shrink-0" width="38" height="24" viewBox="0 0 46 30" fill="none">
          <circle cx="15" cy="15" r="14" fill="#EB001B" fillOpacity="0.9" />
          <circle cx="31" cy="15" r="14" fill="#F79E1B" fillOpacity="0.85" />
        </svg>
      );
    }
    return (
      <svg className="shrink-0" width="46" height="16" viewBox="0 0 100 32" fill="#FFFFFF">
        <path d="M38.5 2.5L25.4 29.5H17.2L10.5 8.9C10.1 7.3 9.8 6.7 8.5 6C6.4 4.8 3 3.8 0 3.2L0.3 2.5H13.6C15.3 2.5 16.9 3.7 17.2 5.7L20.5 22.8L28.8 2.5H38.5ZM72.6 20.8C72.7 13.5 62 13.1 62.1 9.7C62.2 8.7 63.2 7.6 65.5 7.3C66.7 7.2 70.1 7.1 73.8 8.8L75.3 2C73.3 1.3 70.4 0.6 66.8 0.6C58.6 0.6 52.8 4.9 52.7 11C52.6 15.6 56.8 18.2 60 19.7C63.2 21.2 64.3 22.2 64.3 23.6C64.2 25.7 61.7 26.6 59.4 26.7C55.3 26.8 52.8 25.6 51 24.8L49.4 31.8C51.4 32.7 55.1 33.5 59 33.5C67.6 33.5 72.5 29.3 72.6 20.8ZM93.4 29.5H100.5L94.3 2.5H88.3C86.7 2.5 85.4 3.4 84.8 4.8L72.4 29.5H81.3L83.1 24.6H92L93.4 29.5ZM85.5 18.2L89.1 8.5L91.2 18.2H85.5ZM49.8 2.5L42.9 29.5H34.4L41.3 2.5H49.8Z" />
      </svg>
    );
  };

  const previewTheme = CARD_THEMES.find((t) => t.id === formData.theme) || CARD_THEMES[0];
  const previewType = detectCardType(formData.cardNumber);

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-[rgba(22,16,22,0.55)] p-5" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-[680px] overflow-y-auto rounded-2xl bg-white p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#eee] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#222] sm:text-xl">{translate("Test Kartı Seçin")}</h3>
            <p className="mt-1 text-sm text-[#777]">
              {translate("\n              Yalnızca test kartı seçin veya ekleyin; gerçek kart bilgisi girmeyin.\n            ")}</p>
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-full text-[#777] hover:bg-[#fff5fc] hover:text-[#b6349a]" onClick={onClose} aria-label={translate("Kapat")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <p role="note" className="mb-5 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
          {translate("\n          Gerçek kart bilgisi girmeyin. Test kartı: 4242 4242 4242 4242. Ödeme alınmaz; yalnızca maskelenmiş son dört hane tarayıcınızda saklanır, CVV saklanmaz.\n        ")}</p>

        {/* Tab Navigation */}
        <div className="mb-5 flex gap-2 border-b border-[#eee]">
          <button
            type="button"
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === "saved" ? "border-[#b6349a] text-[#b6349a]" : ""}`}
            onClick={() => setActiveTab("saved")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
            {translate("\n            Kayıtlı Kartlarım (")}{cards.length})
          </button>
          <button
            type="button"
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === "new" ? "border-[#b6349a] text-[#b6349a]" : ""}`}
            onClick={() => setActiveTab("new")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {translate("\n            Yeni Kart Ekle\n          ")}</button>
        </div>

        {/* TAB 1: SAVED CARDS */}
        {activeTab === "saved" && (
          <div className="grid gap-4">
            {cards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#e5e7eb] bg-[#f9fafb] p-8 text-center">
                <p>{translate("Henüz kayıtlı bir kredi kartınız bulunmuyor.")}</p>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#b6349a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#98277f]"
                  onClick={() => setActiveTab("new")}
                >
                  {translate("\n                  + İlk Kartınızı Ekleyin\n                ")}</button>
              </div>
            ) : (
              <>
                <div className="grid gap-3">
                  {cards.map((card) => {
                    const isSelected = String(card.id) === String(selectedCardId);
                    const themeObj = CARD_THEMES.find((t) => t.id === card.theme) || CARD_THEMES[0];
                    return (
                      <div
                        key={card.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border border-[#eee] p-3 transition hover:border-[#b6349a] ${isSelected ? "border-[#b6349a] bg-[#fff8fd]" : ""}`}
                        onClick={() => {
                          onSelectCard(card);
                          onClose();
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelectCard(card);
                            onClose();
                          }
                        }}
                      >
                        {/* Mini visual icon with theme gradient */}
                        <div
                          className="grid h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-lg p-2 text-white"
                          style={{ background: themeObj.gradient }}
                        >
                          {renderCardLogo(card.cardType)}
                        </div>

                        {/* Card Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-[#222]">
                              {card.cardType === "visa" ? "Visa" : "Mastercard"} •••• {card.last4 || card.maskedNumber?.slice(-4)}
                            </span>
                            {card.isDefault && (
                              <span className="rounded-full bg-[#fff0fa] px-2 py-0.5 text-[10px] font-semibold text-[#b6349a]">{translate("Varsayılan")}</span>
                            )}
                          </div>
                          <div className="mt-1 flex gap-2 text-xs text-[#888]">
                            <span>{card.cardHolder}</span>
                            <span>•</span>
                            <span>{translate("SKT: ")}{card.expiry}</span>
                          </div>
                        </div>

                        {/* Radio Checkmark */}
                        <div className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-[#d5d5d5] ${isSelected ? "border-[#b6349a] bg-[#b6349a]" : ""}`}>
                          {isSelected && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-dashed border-[#b6349a] px-4 py-2.5 text-sm font-semibold text-[#b6349a] hover:bg-[#fff5fc]"
                  onClick={() => setActiveTab("new")}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  {translate("\n                  Başka Bir Kart Ekle\n                ")}</button>
              </>
            )}
          </div>
        )}

        {/* TAB 2: ADD NEW CARD */}
        {activeTab === "new" && (
          <div className="grid gap-5">
            {/* Live Card Preview */}
            <div className="flex justify-center">
              <div
                className="relative w-full max-w-[420px] rounded-2xl p-6 text-white shadow-xl min-h-[220px]"
                style={{ background: previewTheme.gradient }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-10 rounded bg-white/20"></div>
                    <svg className="text-white" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 8.5a9.5 9.5 0 0 1 14 0" />
                      <path d="M7.5 11a6 6 0 0 1 9 0" />
                      <path d="M10 13.5a2.5 2.5 0 0 1 4 0" />
                    </svg>
                  </div>
                  {renderCardLogo(previewType)}
                </div>

                <div className="mt-10 text-xl tracking-[0.18em] font-mono">
                  {formData.cardNumber || "•••• •••• •••• ••••"}
                </div>

                <div className="mt-10 flex justify-between gap-4">
                  <div className="flex min-w-0 flex-col">
                    <span className="text-[10px] uppercase text-white/70">{translate("KART SAHİBİ")}</span>
                    <span className="mt-1 text-sm font-semibold">{formData.cardHolder || "AD SOYAD"}</span>
                  </div>
                  <div className="flex shrink-0 flex-col">
                    <span className="text-[10px] uppercase text-white/70">{translate("SON KULLANMA")}</span>
                    <span className="mt-1 text-sm font-semibold">{formData.expiry || "AA/YY"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Selector */}
            <CardThemeSelector selectedTheme={formData.theme} onSelectTheme={setTheme} />

            {/* Form Fields */}
            <form onSubmit={handleAddCardSubmit} className="grid gap-4" noValidate>
              <div className="grid gap-1.5">
                <label className="text-sm font-semibold text-[#555]">{translate("Kart Üzerindeki İsim")}</label>
                <div className={cardFieldClass}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    aria-label={translate("Test kartı üzerindeki isim")}
                    placeholder={translate("AD SOYAD")}
                    value={formData.cardHolder}
                    onChange={handleNameChange}
                    maxLength={30}
                    className={`${cardInputClass} ${errors.cardHolder ? "text-red-700" : ""}`}
                  />
                </div>
                {errors.cardHolder && <span className="text-xs text-red-600">{errors.cardHolder}</span>}
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-semibold text-[#555]">{translate("Kart Numarası")}</label>
                <div className={cardFieldClass}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  <input
                    type="text"
                    aria-label={translate("Test kartı numarası")}
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="4242 4242 4242 4242"
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    className={`${cardInputClass} ${errors.cardNumber ? "text-red-700" : ""}`}
                  />
                </div>
                {errors.cardNumber && <span className="text-xs text-red-600">{errors.cardNumber}</span>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5 min-w-0">
                  <label className="text-sm font-semibold text-[#555]">{translate("Son Kullanma")}</label>
                  <div className={cardFieldClass}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <input
                      type="text"
                      aria-label={translate("Test kartı son kullanma tarihi")}
                      placeholder={translate("AA/YY")}
                      value={formData.expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      className={`${cardInputClass} ${errors.expiry ? "text-red-700" : ""}`}
                    />
                  </div>
                  {errors.expiry && <span className="text-xs text-red-600">{errors.expiry}</span>}
                </div>

                <div className="grid gap-1.5 min-w-0">
                  <label className="text-sm font-semibold text-[#555]">
                    {translate("\n                    CVV / CVC\n                    ")}<span className="text-xs font-normal text-[#999]">{translate("(3 hane)")}</span>
                  </label>
                  <div className={cardFieldClass}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type="password"
                      aria-label={translate("Test kartı güvenlik kodu")}
                      autoComplete="off"
                      placeholder="•••"
                      value={formData.cvv}
                      onChange={handleCvvChange}
                      maxLength={3}
                      className={`${cardInputClass} ${errors.cvv ? "text-red-700" : ""}`}
                    />
                  </div>
                  {errors.cvv && <span className="text-xs text-red-600">{errors.cvv}</span>}
                </div>
              </div>

              <button type="submit" className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#b6349a] px-4 py-3 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(182,52,154,0.2)] transition hover:bg-[#98277f] focus:outline-none focus:ring-4 focus:ring-[#b6349a]/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {translate("\n                Kartı Kaydet ve Siparişte Kullan\n              ")}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
