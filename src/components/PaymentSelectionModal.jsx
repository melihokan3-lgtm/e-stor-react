import { useState, useEffect } from "react";
import { readUserStorage, writeUserStorage } from "../utils/userStorage";
import {
  CARD_THEMES,
  DEFAULT_DEMO_CARDS,
  detectCardType,
  maskCardNumber
} from "../utils/cardUtils";

export default function PaymentSelectionModal({
  isOpen,
  onClose,
  selectedCardId,
  onSelectCard,
  user
}) {
  const [cards, setCards] = useState([]);
  const [activeTab, setActiveTab] = useState("saved"); // "saved" | "new"

  // Form State
  const [formData, setFormData] = useState({
    cardHolder: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    theme: "purple",
  });
  const [errors, setErrors] = useState({});

  // Sync cards with user storage on open / user change
  useEffect(() => {
    if (!isOpen) return;
    const saved = readUserStorage("savedCards", user, null);
    if (saved !== null && Array.isArray(saved) && saved.length > 0) {
      setCards(saved);
    } else {
      setCards(DEFAULT_DEMO_CARDS);
      writeUserStorage("savedCards", user, DEFAULT_DEMO_CARDS);
    }
  }, [isOpen, user]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Form handlers
  const handleNameChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, "").toUpperCase();
    setFormData((prev) => ({ ...prev, cardHolder: val }));
    if (errors.cardHolder) setErrors((prev) => ({ ...prev, cardHolder: null }));
  };

  const handleCardNumberChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = rawDigits.match(/.{1,4}/g)?.join(" ") || rawDigits;
    setFormData((prev) => ({ ...prev, cardNumber: formatted }));
    if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: null }));
  };

  const handleExpiryChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, "").slice(0, 4);
    let formatted = rawDigits;
    if (rawDigits.length >= 2) {
      formatted = `${rawDigits.slice(0, 2)}/${rawDigits.slice(2)}`;
    }
    setFormData((prev) => ({ ...prev, expiry: formatted }));
    if (errors.expiry) setErrors((prev) => ({ ...prev, expiry: null }));
  };

  const handleCvvChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 3);
    setFormData((prev) => ({ ...prev, cvv: val }));
    if (errors.cvv) setErrors((prev) => ({ ...prev, cvv: null }));
  };

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

  const handleAddCardSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const rawNumber = formData.cardNumber.replace(/\s/g, "");
    const cardType = detectCardType(rawNumber);
    const masked = maskCardNumber(rawNumber);

    const newCard = {
      id: "card_" + Date.now(),
      cardHolder: formData.cardHolder.trim(),
      maskedNumber: masked,
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

    // Auto-select the newly added card and close modal
    onSelectCard(newCard);
    setFormData({
      cardHolder: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
      theme: "purple",
    });
    setErrors({});
    setActiveTab("saved");
    onClose();
  };

  const renderCardLogo = (type) => {
    if (type === "mastercard") {
      return (
        <svg className="card-brand-svg" width="38" height="24" viewBox="0 0 46 30" fill="none">
          <circle cx="15" cy="15" r="14" fill="#EB001B" fillOpacity="0.9" />
          <circle cx="31" cy="15" r="14" fill="#F79E1B" fillOpacity="0.85" />
        </svg>
      );
    }
    return (
      <svg className="card-brand-svg" width="46" height="16" viewBox="0 0 100 32" fill="#FFFFFF">
        <path d="M38.5 2.5L25.4 29.5H17.2L10.5 8.9C10.1 7.3 9.8 6.7 8.5 6C6.4 4.8 3 3.8 0 3.2L0.3 2.5H13.6C15.3 2.5 16.9 3.7 17.2 5.7L20.5 22.8L28.8 2.5H38.5ZM72.6 20.8C72.7 13.5 62 13.1 62.1 9.7C62.2 8.7 63.2 7.6 65.5 7.3C66.7 7.2 70.1 7.1 73.8 8.8L75.3 2C73.3 1.3 70.4 0.6 66.8 0.6C58.6 0.6 52.8 4.9 52.7 11C52.6 15.6 56.8 18.2 60 19.7C63.2 21.2 64.3 22.2 64.3 23.6C64.2 25.7 61.7 26.6 59.4 26.7C55.3 26.8 52.8 25.6 51 24.8L49.4 31.8C51.4 32.7 55.1 33.5 59 33.5C67.6 33.5 72.5 29.3 72.6 20.8ZM93.4 29.5H100.5L94.3 2.5H88.3C86.7 2.5 85.4 3.4 84.8 4.8L72.4 29.5H81.3L83.1 24.6H92L93.4 29.5ZM85.5 18.2L89.1 8.5L91.2 18.2H85.5ZM49.8 2.5L42.9 29.5H34.4L41.3 2.5H49.8Z" />
      </svg>
    );
  };

  const previewTheme = CARD_THEMES.find((t) => t.id === formData.theme) || CARD_THEMES[0];
  const previewType = detectCardType(formData.cardNumber);

  return (
    <div className="card-modal-overlay" onClick={onClose}>
      <div className="card-modal-box checkout-card-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="card-modal-header">
          <div>
            <h3>Ödeme Yöntemi Seçin</h3>
            <p className="checkout-modal-subtitle">
              Siparişiniz için kayıtlı bir kart seçin veya yeni bir kredi kartı ekleyin.
            </p>
          </div>
          <button className="card-modal-close-btn" onClick={onClose} aria-label="Kapat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="checkout-payment-modal-tabs">
          <button
            type="button"
            className={`payment-tab-btn ${activeTab === "saved" ? "active" : ""}`}
            onClick={() => setActiveTab("saved")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
            Kayıtlı Kartlarım ({cards.length})
          </button>
          <button
            type="button"
            className={`payment-tab-btn ${activeTab === "new" ? "active" : ""}`}
            onClick={() => setActiveTab("new")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Yeni Kart Ekle
          </button>
        </div>

        {/* TAB 1: SAVED CARDS */}
        {activeTab === "saved" && (
          <div className="saved-cards-selection-list">
            {cards.length === 0 ? (
              <div className="no-cards-empty-state">
                <p>Henüz kayıtlı bir kredi kartınız bulunmuyor.</p>
                <button
                  type="button"
                  className="btn-primary-card"
                  onClick={() => setActiveTab("new")}
                >
                  + İlk Kartınızı Ekleyin
                </button>
              </div>
            ) : (
              <>
                <div className="card-selection-items">
                  {cards.map((card) => {
                    const isSelected = String(card.id) === String(selectedCardId);
                    const themeObj = CARD_THEMES.find((t) => t.id === card.theme) || CARD_THEMES[0];
                    return (
                      <div
                        key={card.id}
                        className={`card-select-row ${isSelected ? "selected" : ""}`}
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
                          className="card-mini-visual"
                          style={{ background: themeObj.gradient }}
                        >
                          {renderCardLogo(card.cardType)}
                        </div>

                        {/* Card Info */}
                        <div className="card-select-info">
                          <div className="card-select-number-row">
                            <span className="card-select-number">
                              {card.cardType === "visa" ? "Visa" : "Mastercard"} •••• {card.last4 || card.maskedNumber?.slice(-4)}
                            </span>
                            {card.isDefault && (
                              <span className="card-default-badge">Varsayılan</span>
                            )}
                          </div>
                          <div className="card-select-subtext">
                            <span>{card.cardHolder}</span>
                            <span>•</span>
                            <span>SKT: {card.expiry}</span>
                          </div>
                        </div>

                        {/* Radio Checkmark */}
                        <div className={`card-select-radio ${isSelected ? "checked" : ""}`}>
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
                  className="checkout-add-card-inline-btn"
                  onClick={() => setActiveTab("new")}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Başka Bir Kart Ekle
                </button>
              </>
            )}
          </div>
        )}

        {/* TAB 2: ADD NEW CARD */}
        {activeTab === "new" && (
          <div className="new-card-form-wrapper">
            {/* Live Card Preview */}
            <div className="modal-live-preview-container">
              <div
                className="credit-card-ui preview-mode"
                style={{ background: previewTheme.gradient }}
              >
                <div className="card-top-row">
                  <div className="card-chip-container">
                    <div className="card-chip"></div>
                    <svg className="contactless-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 8.5a9.5 9.5 0 0 1 14 0" />
                      <path d="M7.5 11a6 6 0 0 1 9 0" />
                      <path d="M10 13.5a2.5 2.5 0 0 1 4 0" />
                    </svg>
                  </div>
                  {renderCardLogo(previewType)}
                </div>

                <div className="card-number-display preview-number">
                  {formData.cardNumber || "•••• •••• •••• ••••"}
                </div>

                <div className="card-bottom-row">
                  <div className="card-holder-col">
                    <span className="card-meta-label">KART SAHİBİ</span>
                    <span className="card-meta-val">{formData.cardHolder || "AD SOYAD"}</span>
                  </div>
                  <div className="card-expiry-col">
                    <span className="card-meta-label">SON KULLANMA</span>
                    <span className="card-meta-val">{formData.expiry || "AA/YY"}</span>
                  </div>
                </div>
              </div>
            </div>

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
                    onClick={() => setFormData((prev) => ({ ...prev, theme: theme.id }))}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleAddCardSubmit} className="card-entry-form" noValidate>
              <div className="form-group-field">
                <label className="field-label-text">Kart Üzerindeki İsim</label>
                <div className="input-with-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    placeholder="AD SOYAD"
                    value={formData.cardHolder}
                    onChange={handleNameChange}
                    maxLength={30}
                    className={errors.cardHolder ? "input-error" : ""}
                  />
                </div>
                {errors.cardHolder && <span className="field-error-text">{errors.cardHolder}</span>}
              </div>

              <div className="form-group-field">
                <label className="field-label-text">Kart Numarası</label>
                <div className="input-with-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    className={errors.cardNumber ? "input-error" : ""}
                  />
                </div>
                {errors.cardNumber && <span className="field-error-text">{errors.cardNumber}</span>}
              </div>

              <div className="form-row-halves">
                <div className="form-group-field half">
                  <label className="field-label-text">Son Kullanma</label>
                  <div className="input-with-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <input
                      type="text"
                      placeholder="AA/YY"
                      value={formData.expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      className={errors.expiry ? "input-error" : ""}
                    />
                  </div>
                  {errors.expiry && <span className="field-error-text">{errors.expiry}</span>}
                </div>

                <div className="form-group-field half">
                  <label className="field-label-text">
                    CVV / CVC
                    <span className="cvv-tooltip-hint">(3 hane)</span>
                  </label>
                  <div className="input-with-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type="password"
                      placeholder="•••"
                      value={formData.cvv}
                      onChange={handleCvvChange}
                      maxLength={3}
                      className={errors.cvv ? "input-error" : ""}
                    />
                  </div>
                  {errors.cvv && <span className="field-error-text">{errors.cvv}</span>}
                </div>
              </div>

              <button type="submit" className="btn-primary-card submit-card-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Kartı Kaydet ve Siparişte Kullan
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
