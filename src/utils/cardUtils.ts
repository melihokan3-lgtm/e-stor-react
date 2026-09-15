import type { PaymentCard } from "../types/payment";

// Theme presets for credit cards
export const CARD_THEMES = [
  { id: "purple", name: "Neon Lüks", gradient: "linear-gradient(135deg, #301860 0%, #7B1FA2 50%, #E91E63 100%)" },
  { id: "midnight", name: "Gece Mavisi", gradient: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)" },
  { id: "emerald", name: "Zümrüt", gradient: "linear-gradient(135deg, #053b34 0%, #0d735a 50%, #17b978 100%)" },
  { id: "sunset", name: "Altın & Günbatımı", gradient: "linear-gradient(135deg, #cb2d3e 0%, #ef473a 50%, #f7b733 100%)" },
  { id: "dark", name: "Platin Titanyum", gradient: "linear-gradient(135deg, #141414 0%, #282828 50%, #434343 100%)" },
];

// Seed initial card if none exists for a rich first-glance presentation
export const DEFAULT_DEMO_CARDS: PaymentCard[] = [
  {
    id: "card_demo_1",
    cardHolder: "MELİH YILMAZ",
    maskedNumber: "**** **** **** 4892",
    last4: "4892",
    expiry: "09/29",
    cardType: "mastercard",
    theme: "purple",
    isDefault: true,
    createdAt: Date.now() - 10000000,
  },
  {
    id: "card_demo_2",
    cardHolder: "MELİH YILMAZ",
    maskedNumber: "**** **** **** 8214",
    last4: "8214",
    expiry: "11/28",
    cardType: "visa",
    theme: "midnight",
    isDefault: false,
    createdAt: Date.now() - 5000000,
  }
];

// Helper: detect card type from number
export const detectCardType = (number = ""): PaymentCard["cardType"] => {
  const clean = number.replace(/\D/g, "");
  if (clean.startsWith("4")) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(clean)) return "mastercard";
  return "visa"; // default fallback
};

// Helper: mask 16-digit card number (PCI-DSS simulation)
export const maskCardNumber = (number = ""): string => {
  const clean = number.replace(/\D/g, "");
  const last4 = clean.slice(-4) || "0000";
  return `**** **** **** ${last4}`;
};
