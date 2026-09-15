import type { AuthUser } from "../../types/auth";
import type { PaymentCard } from "../../types/payment";
import { DEFAULT_DEMO_CARDS } from "../../utils/cardUtils";
import { readUserStorage, writeUserStorage } from "../../utils/userStorage";

const STORAGE_KEY = "savedCards";

export function loadSavedCards(user: AuthUser | null): PaymentCard[] {
  if (!user) return DEFAULT_DEMO_CARDS;

  const saved = readUserStorage<PaymentCard[] | null>(STORAGE_KEY, user, null);
  if (Array.isArray(saved)) return saved;

  writeUserStorage(STORAGE_KEY, user, DEFAULT_DEMO_CARDS);
  return DEFAULT_DEMO_CARDS;
}

export function saveSavedCards(user: AuthUser | null, cards: PaymentCard[]): void {
  if (!user) return;
  writeUserStorage(STORAGE_KEY, user, cards);
}
