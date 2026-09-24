import { translate } from "../../features/i18n/LanguageContext";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import {
  loadSavedCards,
  saveSavedCards,
} from "../../features/payments/savedCards";
import { useCardForm } from "../../features/payments/useCardForm";
import { CardThemeSelector } from "../../components/payments";
import { ProfileEmptyState, ProfileToast } from "../../components/profile";
import type { PaymentCard } from "../../types/payment";
import { getCardThemeGradient } from "../../utils/cardUtils";
import SeoMeta from "../../components/common/SeoMeta";

const inputClass =
  "mt-1 box-border min-h-12 w-full appearance-none rounded-xl border border-[#e8e8e8] bg-[#fafafa] px-3.5 py-3 text-sm font-medium leading-5 text-[#222] outline-none transition placeholder:text-[#b8b8b8] focus:border-[#b6349a] focus:bg-white focus:ring-4 focus:ring-[#b6349a]/10";

export default function MyPayments() {
  const { user } = useAuth();
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<PaymentCard | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const {
    formData,
    errors,
    handleNameChange,
    handleCardNumberChange,
    handleExpiryChange,
    handleCvvChange,
    validateForm,
    createCard,
    setTheme,
    resetForm,
  } = useCardForm();
  useEffect(() => setCards(loadSavedCards(user)), [user]);
  const toast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3500);
  };
  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;
    const next = [createCard(cards.length === 0), ...cards];
    setCards(next);
    saveSavedCards(user, next);
    resetForm();
    setIsModalOpen(false);
    toast("Test kartı görünümü kaydedildi. Gerçek ödeme alınmaz.");
  };
  const setDefault = (id: PaymentCard["id"]) => {
    const next = cards.map((card) => ({ ...card, isDefault: card.id === id }));
    setCards(next);
    saveSavedCards(user, next);
    toast("Varsayılan ödeme kartınız güncellendi.");
  };
  const removeCard = () => {
    if (!cardToDelete) return;
    let next = cards.filter(
      (card) => String(card.id) !== String(cardToDelete.id),
    );
    if (next.length && !next.some((card) => card.isDefault))
      next = next.map((card, index) =>
        index === 0 ? { ...card, isDefault: true } : card,
      );
    setCards(next);
    saveSavedCards(user, next);
    setCardToDelete(null);
    toast("Kart başarıyla silindi.");
  };

  return (
    <div className="w-full">
      <SeoMeta title={translate("Ödeme Yöntemlerim | E-Storee")} description={translate("Manage your saved payment methods in E-Storee.")} canonicalPath="/profile/payments" robots="noindex,nofollow" />
      <ProfileToast message={toastMessage} />
      <div className="mb-8 flex items-start justify-between gap-4 max-sm:flex-col">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#111]">
            {translate("\n            Ödeme Yöntemlerim\n          ")}</h1>
          <p className="mt-2 text-sm text-[#777]">
            {translate("\n            Test kartı görünümlerinizi yönetin. Gerçek kart bilgisi girmeyin; test kartı: 4242 4242 4242 4242. Bu ekranda ödeme yapılmaz.\n          ")}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="rounded-lg bg-[#b6349a] px-4 py-2.5 text-sm font-semibold text-white"
        >
          {translate("\n          + Yeni Kart Ekle\n        ")}</button>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.id}
            className="overflow-hidden rounded-2xl border border-[#eee] bg-white p-4 shadow-sm"
          >
            <div
              className="relative min-h-48 rounded-2xl p-5 text-white shadow-lg"
              style={{
                background: getCardThemeGradient(card.theme),
              }}
            >
              <div className="flex justify-between text-xs opacity-80">
                <span>
                  {translate(card.isDefault ? "Default card" : "E-Store Card")}
                </span>
                <span>{card.cardType?.toUpperCase()}</span>
              </div>
              <div className="mt-12 font-mono text-lg tracking-wider">
                {card.maskedNumber}
              </div>
              <div className="mt-6 flex justify-between text-xs">
                <span>
                  <small className="block opacity-70">{translate("KART SAHİBİ")}</small>
                  {card.cardHolder}
                </span>
                <span>
                  <small className="block opacity-70">{translate("SON KULLANMA")}</small>
                  {card.expiry}
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setDefault(card.id)}
                disabled={card.isDefault}
                className="text-xs font-semibold text-[#b6349a] disabled:text-[#999]"
              >
                {translate(card.isDefault ? "Default" : "Set as default")}
              </button>
              <button
                type="button"
                onClick={() => setCardToDelete(card)}
                className="text-xs font-semibold text-red-600"
              >
                {translate("\n                Sil\n              ")}</button>
            </div>
          </article>
        ))}
        {cards.length === 0 && (
          <ProfileEmptyState compact className="text-sm text-[#777]">
            {translate("\n            Kayıtlı kartınız bulunmuyor.\n          ")}</ProfileEmptyState>
        )}
        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex min-h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d9b4d0] bg-[#fff8fd] p-6 text-center"
        >
          <span className="text-3xl text-[#b6349a]">+</span>
          <strong className="mt-2 text-[#333]">{translate("Yeni Kart Ekle")}</strong>
          <span className="mt-1 text-xs text-[#777]">
            {translate("\n            Kredi veya banka kartı ekleyerek hızlı ödeme yapın\n          ")}</span>
        </button>
      </div>
      <div className="mt-6 flex gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
        <span>🔒</span>
        <p className="m-0">
          <strong>{translate("Test Kartı Görünümü")}</strong>
          <br />
          {translate("\n          Yalnızca maskelenmiş kart numarası tarayıcıda saklanır. Gerçek kart\n          bilgisi girmeyin.\n        ")}</p>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex justify-between border-b border-[#eee] pb-4">
              <h3 className="text-lg font-bold text-[#111]">{translate("Yeni Kart Ekle")}</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="grid size-8 place-items-center rounded-full text-xl leading-none text-[#777] transition hover:bg-[#fff5fc] hover:text-[#b6349a]"
              >
                ×
              </button>
            </div>
            <div
              className="mb-5 rounded-2xl p-5 text-white"
              style={{ background: getCardThemeGradient(formData.theme) }}
            >
              <div className="flex justify-between text-xs">
                <span>{translate("E-Store Card")}</span>
                <span>{formData.cardNumber || "•••• •••• •••• ••••"}</span>
              </div>
              <div className="mt-10 flex justify-between text-xs">
                <span>{formData.cardHolder || translate("Cardholder")}</span>
                <span>{formData.expiry || "AA/YY"}</span>
              </div>
            </div>
            <form onSubmit={handleAdd} className="space-y-4" noValidate>
              <CardThemeSelector
                selectedTheme={formData.theme}
                onSelectTheme={setTheme}
              />
              <label className="block space-y-1 text-sm font-semibold text-[#555]">
                {translate("\n                Kart Üzerindeki İsim\n                ")}<input
                  name="cardHolder"
                  value={formData.cardHolder}
                  onChange={handleNameChange}
                  className={inputClass}
                  placeholder={translate("Örn: MELİH YILMAZ")}
                />
                {errors.cardHolder && (
                  <span className="text-xs text-red-600">
                    {translate(errors.cardHolder)}
                  </span>
                )}
              </label>
              <label className="block space-y-1 text-sm font-semibold text-[#555]">
                {translate("\n                Kart Numarası\n                ")}<input
                  name="cardNumber"
                  inputMode="numeric"
                  value={formData.cardNumber}
                  onChange={handleCardNumberChange}
                  className={inputClass}
                  placeholder="1234 5678 1234 5678"
                />
                {errors.cardNumber && (
                  <span className="text-xs text-red-600">
                    {translate(errors.cardNumber)}
                  </span>
                )}
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1 text-sm font-semibold text-[#555]">
                  {translate("\n                  Son Kullanma\n                  ")}<input
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleExpiryChange}
                    className={inputClass}
                    placeholder={translate("AA/YY")}
                  />
                  {errors.expiry && (
                    <span className="text-xs text-red-600">
                      {translate(errors.expiry)}
                    </span>
                  )}
                </label>
                <label className="block space-y-1 text-sm font-semibold text-[#555]">
                  {translate("\n                  CVV\n                  ")}<input
                    name="cvv"
                    type="password"
                    value={formData.cvv}
                    onChange={handleCvvChange}
                    className={inputClass}
                    placeholder="•••"
                  />
                  {errors.cvv && (
                  <span className="text-xs text-red-600">{translate(errors.cvv)}</span>
                  )}
                </label>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg bg-[#f3f3f3] px-4 py-2.5 text-sm font-semibold text-[#555]"
                >
                  {translate("\n                  Vazgeç\n                ")}</button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#b6349a] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  {translate("\n                  Test Kartını Kaydet\n                ")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {cardToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => setCardToDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#111]">
              {translate("\n              Kartı silmek istediğinize emin misiniz?\n            ")}</h3>
            <p className="mt-2 text-sm text-[#777]">
              {cardToDelete.maskedNumber} {translate(" kartı silinecek. Bu işlem geri\n              alınamaz.\n            ")}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCardToDelete(null)}
                className="rounded-lg bg-[#f3f3f3] px-4 py-2.5 text-sm font-semibold text-[#555]"
              >
                {translate("\n                Vazgeç\n              ")}</button>
              <button
                type="button"
                onClick={removeCard}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                {translate("\n                Evet, Kartı Sil\n              ")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
