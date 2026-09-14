import { useState, useEffect } from "react";
import { useLocation } from "../context/LocationContext";

export default function EditOrderAddressModal({
  isOpen,
  onClose,
  order,
  onSaveAddress,
}) {
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
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handleSubmit = (e) => {
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
    <div className="card-modal-overlay" onClick={onClose}>
      <div
        className="card-modal-box edit-address-modal-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-address-modal-title"
      >
        {/* Header */}
        <div className="card-modal-header">
          <div>
            <h3 id="edit-address-modal-title">Teslimat Adresini Değiştir</h3>
            <span className="order-modal-badge">
              Sipariş: {order.id} • Durum: {order.status}
            </span>
          </div>
          <button
            type="button"
            className="card-modal-close-btn"
            onClick={onClose}
            aria-label="Kapat"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Notice Info */}
        <div className="address-modal-info-alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <div className="alert-text">
            <strong>Kargoya Verilmedi</strong>
            <p>Siparişiniz henüz kargoya teslim edilmediği için teslimat adresinizi güncelleyebilirsiniz.</p>
          </div>
        </div>

        {/* Quick select pills */}
        {uniqueQuickOptions.length > 0 && (
          <div className="address-quick-options">
            <span className="quick-options-label">Kayıtlı & Önerilen Adresler:</span>
            <div className="quick-pills-row">
              {uniqueQuickOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`quick-pill-btn ${addressInput === opt ? "active" : ""}`}
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
        <form onSubmit={handleSubmit} className="edit-address-form" noValidate>
          <div className="form-group-field">
            <label className="field-label-text">Yeni Teslimat Adresi</label>
            <textarea
              className={`address-textarea-input ${error ? "has-error" : ""}`}
              rows={3}
              placeholder="Mahalle, sokak, bina no, ilçe ve şehir giriniz..."
              value={addressInput}
              onChange={(e) => {
                setAddressInput(e.target.value);
                if (error) setError("");
              }}
              autoFocus
            />
            {error && <span className="field-error-text">{error}</span>}
          </div>

          <div className="address-modal-actions">
            <button
              type="button"
              className="modal-cancel-btn"
              onClick={onClose}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="modal-save-address-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
              Adresi Güncelle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
