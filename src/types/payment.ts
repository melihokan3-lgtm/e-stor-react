export interface PaymentCard {
  id: string;
  cardHolder: string;
  maskedNumber: string;
  last4: string;
  expiry: string;
  cardType: "visa" | "mastercard";
  theme: string;
  isDefault: boolean;
  createdAt: number;
}
