import { useState, type ChangeEvent } from "react";
import type { PaymentCard } from "../../types/payment";
import { detectCardType, maskCardNumber } from "../../utils/cardUtils";

export interface CardForm {
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  theme: string;
}

export type CardFormErrors = Partial<Record<"cardHolder" | "cardNumber" | "expiry" | "cvv", string>>;

const EMPTY_FORM: CardForm = {
  cardHolder: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  theme: "purple",
};

export function useCardForm() {
  const [formData, setFormData] = useState<CardForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<CardFormErrors>({});

  const clearError = (field: keyof CardFormErrors): void => {
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.currentTarget.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, "").toUpperCase();
    setFormData((previous) => ({ ...previous, cardHolder: value }));
    clearError("cardHolder");
  };

  const handleCardNumberChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const digits = event.currentTarget.value.replace(/\D/g, "").slice(0, 16);
    const formattedNumber = digits.match(/.{1,4}/g)?.join(" ") || digits;
    setFormData((previous) => ({ ...previous, cardNumber: formattedNumber }));
    clearError("cardNumber");
  };

  const handleExpiryChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const digits = event.currentTarget.value.replace(/\D/g, "").slice(0, 4);
    const expiry = digits.length >= 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    setFormData((previous) => ({ ...previous, expiry }));
    clearError("expiry");
  };

  const handleCvvChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const cvv = event.currentTarget.value.replace(/\D/g, "").slice(0, 3);
    setFormData((previous) => ({ ...previous, cvv }));
    clearError("cvv");
  };

  const validateForm = (): boolean => {
    const nextErrors: CardFormErrors = {};
    const rawNumber = formData.cardNumber.replace(/\s/g, "");

    if (formData.cardHolder.trim().length < 3) {
      nextErrors.cardHolder = "Lütfen kart üzerindeki adı ve soyadı girin (En az 3 harf).";
    }
    if (rawNumber.length !== 16) {
      nextErrors.cardNumber = "Kart numarası 16 haneli olmalıdır.";
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiry)) {
      nextErrors.expiry = "Geçerli bir son kullanma tarihi girin (AA/YY).";
    } else {
      const [monthText, yearText] = formData.expiry.split("/");
      const month = Number(monthText);
      const year = Number(`20${yearText}`);
      const now = new Date();
      if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
        nextErrors.expiry = "Kartın son kullanma tarihi geçmiş olamaz.";
      }
    }
    if (formData.cvv.length !== 3) {
      nextErrors.cvv = "CVV güvenlik kodu 3 haneli olmalıdır.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const createCard = (isDefault: boolean): PaymentCard => {
    const rawNumber = formData.cardNumber.replace(/\s/g, "");
    return {
      id: `card_${Date.now()}`,
      cardHolder: formData.cardHolder.trim(),
      maskedNumber: maskCardNumber(rawNumber),
      last4: rawNumber.slice(-4),
      expiry: formData.expiry,
      cardType: detectCardType(rawNumber),
      theme: formData.theme,
      isDefault,
      createdAt: Date.now(),
    };
  };

  const setTheme = (theme: string): void => {
    setFormData((previous) => ({ ...previous, theme }));
  };

  const resetForm = (): void => {
    setFormData(EMPTY_FORM);
    setErrors({});
  };

  return {
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
  };
}
