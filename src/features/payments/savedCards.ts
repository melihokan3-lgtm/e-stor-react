import type { AuthUser } from "../../types/auth";
import type { PaymentCard } from "../../types/payment";
import { DEFAULT_DEMO_CARDS } from "../../utils/cardUtils";
import { readUserStorage, writeUserStorage } from "../../utils/userStorage";

const STORAGE_KEY = "savedCards";

const isPaymentCard = (value: unknown): value is PaymentCard => {
  if (!value || typeof value !== "object") return false;
  const card = value as Partial<PaymentCard>;
  return typeof card.id === "string"
    && typeof card.cardHolder === "string"
    && typeof card.maskedNumber === "string"
    && /^\d{4}$/.test(card.last4 || "")
    && typeof card.expiry === "string"
    && (card.cardType === "visa" || card.cardType === "mastercard")
    && typeof card.theme === "string"
    && typeof card.isDefault === "boolean"
    && typeof card.createdAt === "number";
};

export function loadSavedCards(user: AuthUser | null): PaymentCard[] {
  if (!user) return DEFAULT_DEMO_CARDS;

  const saved = readUserStorage<PaymentCard[] | null>(STORAGE_KEY, user, null);
  if (Array.isArray(saved) && saved.every(isPaymentCard)) {
    return saved.map((card) =>
      card.id.startsWith("card_demo_") && card.cardHolder === "DEMO USER"
        ? { ...card, cardHolder: "TEST KULLANICI" }
        : card,
    );
  }

  writeUserStorage(STORAGE_KEY, user, DEFAULT_DEMO_CARDS);
  return DEFAULT_DEMO_CARDS;
}

export function saveSavedCards(user: AuthUser | null, cards: PaymentCard[]): void {
  if (!user) return;
  writeUserStorage(STORAGE_KEY, user, cards);
}
