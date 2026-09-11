import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { readUserStorage, writeUserStorage } from "../../utils/userStorage";
import {
  CARD_THEMES,
  DEFAULT_DEMO_CARDS,
  detectCardType,
  maskCardNumber,
} from "../../utils/cardUtils";

export default function MyPayments() {
  const { user } = useContext(AuthContext);
  const [cards, setCards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    cardHolder: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    theme: "purple",
  });
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState("");

  // Load cards from localStorage on mount / user change
  useEffect(() => {
    const saved = readUserStorage("savedCards", user, null);
    if (saved !== null && Array.isArray(saved)) {
      setCards(saved);
    } else {
      // Initialize with demo cards for instant visual WOW
      setCards(DEFAULT_DEMO_CARDS);
      writeUserStorage("savedCards", user, DEFAULT_DEMO_CARDS);
    }
  }, [user]);

  // Show temporary toast notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Live input handlers with formatting
  const handleNameChange = (e) => {
    // Only accept letters, spaces and common Turkish characters
    const val = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, "").toUpperCase();
    setFormData((prev) => ({ ...prev, cardHolder: val }));
    if (errors.cardHolder) setErrors((prev) => ({ ...prev, cardHolder: null }));
  };

  const handleCardNumberChange = (e) => {
    // Keep only digits, max 16 digits
    const rawDigits = e.target.value.replace(/\D/g, "").slice(0, 16);
    // Split into chunks of 4 separated by spaces
    const formatted = rawDigits.match(/.{1,4}/g)?.join(" ") || rawDigits;
    setFormData((prev) => ({ ...prev, cardNumber: formatted }));
    if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: null }));
  };

  const handleExpiryChange = (e) => {
    // Digits only, max 4 digits (MMYY)
    const rawDigits = e.target.value.replace(/\D/g, "").slice(0, 4);
    let formatted = rawDigits;
    if (rawDigits.length >= 2) {
      formatted = `${rawDigits.slice(0, 2)}/${rawDigits.slice(2)}`;
    }
    setFormData((prev) => ({ ...prev, expiry: formatted }));
    if (errors.expiry) setErrors((prev) => ({ ...prev, expiry: null }));
  };

  const handleCvvChange = (e) => {
    // Digits only, max 3 digits
    const val = e.target.value.replace(/\D/g, "").slice(0, 3);
    setFormData((prev) => ({ ...prev, cvv: val }));
    if (errors.cvv) setErrors((prev) => ({ ...prev, cvv: null }));
  };

  // Validation function
  const validateForm = () => {
    const errs = {};
    const rawNumber = formData.cardNumber.replace(/\s/g, "");

    if (!formData.cardHolder.trim() || formData.cardHolder.trim().length < 3) {
      errs.cardHolder = "Lütfen kart üzerindeki adı ve soyadı girin (En az 3 harf).";
    }

    if (rawNumber.length !== 16) {
      errs.cardNumber = "Kart numarası 16 haneli olmalıdır.";
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiry)) {
      errs.expiry = "Geçerli bir son kullanma tarihi girin (AA/YY).";
    } else {
      const [monthStr, yearStr] = formData.expiry.split("/");
      const month = parseInt(monthStr, 10);
      const year = parseInt("20" + yearStr, 10);
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errs.expiry = "Kartın son kullanma tarihi geçmiş olamaz.";
      }
    }

    if (formData.cvv.length !== 3) {
      errs.cvv = "CVV güvenlik kodu 3 haneli olmalıdır.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Form Submit
  const handleAddCardSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const rawNumber = formData.cardNumber.replace(/\s/g, "");
    const cardType = detectCardType(rawNumber);
    const maskedNumber = maskCardNumber(rawNumber);

    const newCard = {
      id: "card_" + Date.now(),
      cardHolder: formData.cardHolder.trim(),
      maskedNumber: maskedNumber,
      last4: rawNumber.slice(-4),
      expiry: formData.expiry,
      cardType: cardType,
      theme: formData.theme,
      isDefault: cards.length === 0,
      createdAt: Date.now(),
    };

    const updated = [newCard, ...cards];
    setCards(updated);
    writeUserStorage("savedCards", user, updated);

    // Reset & Close
    setFormData({
      cardHolder: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
      theme: "purple",
    });
    setErrors({});
    setIsModalOpen(false);
    showToast("✨ Yeni kartınız başarıyla güvenli bir şekilde kaydedildi!");
  };

  // Set as Default Card
  const handleSetDefault = (cardId) => {
    const updated = cards.map((c) => ({
      ...c,
      isDefault: c.id === cardId,
    }));
    setCards(updated);
    writeUserStorage("savedCards", user, updated);
    showToast("Varsayılan ödeme kartınız güncellendi.");
  };

  // Delete Card: Open Confirmation Modal
  const handlePromptDelete = (card) => {
    setCardToDelete(card);
  };

  // Delete Card: Confirmed by user in modal
  const handleConfirmDelete = () => {
    if (!cardToDelete) return;

    const targetId = cardToDelete.id;
    const last4 = cardToDelete.last4 || cardToDelete.maskedNumber?.slice(-4) || "kartı";

    setCards((prev) => {
      let filtered = prev.filter((c) => String(c.id) !== String(targetId));
      // If we deleted the default card, set the first remaining one as default
      if (filtered.length > 0 && !filtered.some((c) => c.isDefault)) {
        filtered = filtered.map((c, i) => (i === 0 ? { ...c, isDefault: true } : c));
      }
      writeUserStorage("savedCards", user, filtered);
      return filtered;
    });

    setCardToDelete(null);
    showToast(`Sonu ${last4} ile biten kart başarıyla silindi.`);
  };

  // Render SVG Logos
  const renderCardLogo = (type) => {
    if (type === "mastercard") {
      return (
        <svg className="card-brand-svg" width="46" height="30" viewBox="0 0 46 30" fill="none">
          <circle cx="15" cy="15" r="14" fill="#EB001B" fillOpacity="0.9" />
          <circle cx="31" cy="15" r="14" fill="#F79E1B" fillOpacity="0.85" />
        </svg>
      );
    }
    // Visa
    return (
      <svg className="card-brand-svg" width="56" height="20" viewBox="0 0 100 32" fill="#FFFFFF">
        <path d="M38.5 2.5L25.4 29.5H17.2L10.5 8.9C10.1 7.3 9.8 6.7 8.5 6C6.4 4.8 3 3.8 0 3.2L0.3 2.5H13.6C15.3 2.5 16.9 3.7 17.2 5.7L20.5 22.8L28.8 2.5H38.5ZM72.6 20.8C72.7 13.5 62 13.1 62.1 9.7C62.2 8.7 63.2 7.6 65.5 7.3C66.7 7.2 70.1 7.1 73.8 8.8L75.3 2C73.3 1.3 70.4 0.6 66.8 0.6C58.6 0.6 52.8 4.9 52.7 11C52.6 15.6 56.8 18.2 60 19.7C63.2 21.2 64.3 22.2 64.3 23.6C64.2 25.7 61.7 26.6 59.4 26.7C55.3 26.8 52.8 25.6 51 24.8L49.4 31.8C51.4 32.7 55.1 33.5 59 33.5C67.6 33.5 72.5 29.3 72.6 20.8ZM93.4 29.5H100.5L94.3 2.5H88.3C86.7 2.5 85.4 3.4 84.8 4.8L72.4 29.5H81.3L83.1 24.6H92L93.4 29.5ZM85.5 18.2L89.1 8.5L91.2 18.2H85.5ZM49.8 2.5L42.9 29.5H34.4L41.3 2.5H49.8Z" />
      </svg>
    );
  };

  // Active theme gradient helper
  const getThemeGradient = (themeId) => {
    const found = CARD_THEMES.find((t) => t.id === themeId);
    return found ? found.gradient : CARD_THEMES[0].gradient;
  };

  // Preview data for modal
  const previewType = detectCardType(formData.cardNumber);
  const previewNumber = formData.cardNumber
    ? formData.cardNumber.padEnd(19, "•")
    : "•••• •••• •••• ••••";
  const previewHolder = formData.cardHolder || "KART SAHİBİ";
  const previewExpiry = formData.expiry || "AA/YY";

  return (
    <div className="payments-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="payment-toast-alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="payments-header-row">
        <div>
          <h2 className="profile-page-title">Ödeme Yöntemlerim (My Payments)</h2>
          <p className="payments-subtitle">
            Kayıtlı banka ve kredi kartlarınızı yönetin, tek tıkla hızlı ve güvenli ödeme yapın.
          </p>
        </div>
        <button
          type="button"
          className="add-new-card-main-btn"
          onClick={() => {
            setFormData({
              cardHolder: "",
              cardNumber: "",
              expiry: "",
              cvv: "",
              theme: "purple",
            });
            setErrors({});
            setIsModalOpen(true);
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Yeni Kart Ekle
        </button>
      </div>

      {/* Cards Grid */}
      <div className="payment-cards-grid">
        {cards.map((card) => (
          <div key={card.id} className="payment-card-wrapper">
            {/* 3D Realistic Credit Card */}
            <div
              className={`credit-card-ui ${card.isDefault ? "is-default-card" : ""}`}
              style={{ background: getThemeGradient(card.theme) }}
            >
              {/* Shimmer light effect overlay */}
              <div className="card-shimmer-gloss"></div>

              {/* Default Badge */}
              {card.isDefault && (
                <div className="card-default-pill">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Varsayılan Kart
                </div>
              )}

              {/* Top Row: Chip, Contactless & Brand Logo */}
              <div className="card-top-row">
                <div className="card-chip-contactless">
                  {/* EMV Chip */}
                  <div className="emv-chip">
                    <div className="chip-line chip-line-1"></div>
                    <div className="chip-line chip-line-2"></div>
                    <div className="chip-core"></div>
                  </div>
                  {/* Contactless waves */}
                  <div className="contactless-icon" title="Temassız Ödeme">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                      <path d="M12 19a8.5 8.5 0 0 1 0-14" />
                      <path d="M15.5 21.5a12 12 0 0 1 0-19" />
                    </svg>
                  </div>
                </div>

                {/* Card Brand SVG */}
                <div className="card-brand-box">
                  {renderCardLogo(card.cardType)}
                </div>
              </div>

              {/* Middle: Masked 16-Digit Number */}
              <div className="card-number-display">
                {card.maskedNumber}
              </div>

              {/* Bottom: Cardholder and Expiry */}
              <div className="card-bottom-row">
                <div className="card-holder-col">
                  <span className="card-meta-label">KART SAHİBİ</span>
                  <span className="card-meta-val">{card.cardHolder}</span>
                </div>
                <div className="card-expiry-col">
                  <span className="card-meta-label">SON KULLANMA</span>
                  <span className="card-meta-val">{card.expiry}</span>
                </div>
              </div>
            </div>

            {/* Card Action Controls */}
            <div className="card-action-bar">
              {!card.isDefault ? (
                <button
                  type="button"
                  className="card-action-btn set-default-btn"
                  onClick={() => handleSetDefault(card.id)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 14 14"></polyline>
                  </svg>
                  Varsayılan Yap
                </button>
              ) : (
                <span className="card-active-label">
                  <span className="active-dot"></span> Aktif Varsayılan
                </span>
              )}

              <button
                type="button"
                className="card-action-btn delete-card-btn"
                title="Kartı Sil"
                onClick={() => handlePromptDelete(card)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Sil
              </button>
            </div>
          </div>
        ))}

        {cards.length === 0 && (
          <div className="no-cards-placeholder-box">
            <p>Kayıtlı herhangi bir kartınız bulunmuyor. Yeni bir kart ekleyebilirsiniz.</p>
          </div>
        )}

        {/* Add Card Interactive Dashed Placeholder */}
        <div
          className="add-card-placeholder"
          onClick={() => {
            setFormData({
              cardHolder: "",
              cardNumber: "",
              expiry: "",
              cvv: "",
              theme: "purple",
            });
            setErrors({});
            setIsModalOpen(true);
          }}
        >
          <div className="add-card-icon-circle">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b6349a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <h4>Yeni Kart Ekle</h4>
          <p>Kredi veya Banka Kartı ekleyerek hızlı ödeme yapın</p>
        </div>
      </div>

      {/* Security Info Banner */}
      <div className="payment-security-notice">
        <div className="notice-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <div className="notice-text">
          <strong>PCI-DSS & 256-Bit SSL Güvenli Kart Saklama Standardı</strong>
          <p>
            Kart bilgileriniz uçtan uca şifrelenir. Tam kart numarası ve CVV kodunuz asla sunucularımızda veya tarayıcınızda düz metin olarak saklanmaz. Yalnızca son 4 hane maskelenerek referans tutulur.
          </p>
        </div>
      </div>

      {/* NEW CARD MODAL */}
      {isModalOpen && (
        <div className="card-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="card-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="card-modal-header">
              <h3>Yeni Kart Ekle</h3>
              <button
                type="button"
                className="card-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* LIVE CARD PREVIEW IN MODAL */}
            <div className="modal-live-preview-container">
              <div
                className="credit-card-ui preview-mode"
                style={{ background: getThemeGradient(formData.theme) }}
              >
                <div className="card-shimmer-gloss"></div>
                <div className="card-top-row">
                  <div className="card-chip-contactless">
                    <div className="emv-chip">
                      <div className="chip-line chip-line-1"></div>
                      <div className="chip-line chip-line-2"></div>
                      <div className="chip-core"></div>
                    </div>
                    <div className="contactless-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                        <path d="M12 19a8.5 8.5 0 0 1 0-14" />
                        <path d="M15.5 21.5a12 12 0 0 1 0-19" />
                      </svg>
                    </div>
                  </div>
                  <div className="card-brand-box">
                    {renderCardLogo(previewType)}
                  </div>
                </div>

                <div className="card-number-display preview-number">
                  {previewNumber}
                </div>

                <div className="card-bottom-row">
                  <div className="card-holder-col">
                    <span className="card-meta-label">KART SAHİBİ</span>
                    <span className="card-meta-val">{previewHolder}</span>
                  </div>
                  <div className="card-expiry-col">
                    <span className="card-meta-label">SON KULLANMA</span>
                    <span className="card-meta-val">{previewExpiry}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleAddCardSubmit} className="card-entry-form" noValidate>
              {/* Theme Selector */}
              <div className="theme-selection-row">
                <span className="field-label-text">Kart Teması:</span>
                <div className="theme-options">
                  {CARD_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      className={`theme-dot ${formData.theme === theme.id ? "selected" : ""}`}
                      style={{ background: theme.gradient }}
                      title={theme.name}
                      onClick={() => setFormData((prev) => ({ ...prev, theme: theme.id }))}
                    />
                  ))}
                </div>
              </div>

              {/* Cardholder Name */}
              <div className="form-group-field">
                <label className="field-label-text">Kart Üzerindeki İsim</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    name="cardHolder"
                    placeholder="Örn: MELİH YILMAZ"
                    value={formData.cardHolder}
                    onChange={handleNameChange}
                    maxLength={30}
                    className={`payment-input ${errors.cardHolder ? "has-error" : ""}`}
                    autoComplete="cc-name"
                  />
                  <div className="field-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                </div>
                {errors.cardHolder && <span className="field-error-msg">{errors.cardHolder}</span>}
              </div>

              {/* Card Number */}
              <div className="form-group-field">
                <label className="field-label-text">Kart Numarası (16 Hane)</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    inputMode="numeric"
                    name="cardNumber"
                    placeholder="1234 5678 1234 5678"
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    className={`payment-input ${errors.cardNumber ? "has-error" : ""}`}
                    autoComplete="cc-number"
                  />
                  <div className="field-icon-brand">
                    {renderCardLogo(previewType)}
                  </div>
                </div>
                {errors.cardNumber && <span className="field-error-msg">{errors.cardNumber}</span>}
              </div>

              {/* Row: Expiry + CVV */}
              <div className="form-row-halves">
                {/* Expiry */}
                <div className="form-group-field half">
                  <label className="field-label-text">Son Kullanma (AA/YY)</label>
                  <div className="input-with-icon">
                    <input
                      type="text"
                      inputMode="numeric"
                      name="expiry"
                      placeholder="AA/YY"
                      value={formData.expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      className={`payment-input ${errors.expiry ? "has-error" : ""}`}
                      autoComplete="cc-exp"
                    />
                    <div className="field-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                  </div>
                  {errors.expiry && <span className="field-error-msg">{errors.expiry}</span>}
                </div>

                {/* CVV */}
                <div className="form-group-field half">
                  <label className="field-label-text">
                    CVV / CVC
                    <span className="cvv-tooltip-hint" title="Kartınızın arkasındaki 3 haneli güvenlik kodu">(3 Hane)</span>
                  </label>
                  <div className="input-with-icon">
                    <input
                      type="password"
                      inputMode="numeric"
                      name="cvv"
                      placeholder="•••"
                      value={formData.cvv}
                      onChange={handleCvvChange}
                      maxLength={3}
                      className={`payment-input ${errors.cvv ? "has-error" : ""}`}
                      autoComplete="cc-csc"
                    />
                    <div className="field-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                  </div>
                  {errors.cvv && <span className="field-error-msg">{errors.cvv}</span>}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="modal-actions-row">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="modal-save-card-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Kartı Güvenle Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DELETE MODAL */}
      {cardToDelete && (
        <div className="card-modal-overlay" onClick={() => setCardToDelete(null)}>
          <div className="card-delete-confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>

            <h3 className="confirm-modal-title">Kartı Silmek İstediğinize Emin Misiniz?</h3>
            <p className="confirm-modal-desc">
              Bu sonu <strong>{cardToDelete.last4 || cardToDelete.maskedNumber?.slice(-4)}</strong> ile biten kartı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>

            <div className="confirm-modal-card-preview">
              <span className="confirm-card-brand">{cardToDelete.cardType?.toUpperCase()}</span>
              <span className="confirm-card-num">{cardToDelete.maskedNumber}</span>
            </div>

            <div className="confirm-modal-actions">
              <button
                type="button"
                className="confirm-btn-cancel"
                onClick={() => setCardToDelete(null)}
              >
                Vazgeç
              </button>
              <button
                type="button"
                className="confirm-btn-delete"
                onClick={handleConfirmDelete}
              >
                Evet, Kartı Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
