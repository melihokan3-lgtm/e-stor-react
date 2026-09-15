import type { Product } from "./product";

export interface CartItem {
  data: Product;
  unit: number;
}

export interface CartContextValue {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: Product["id"]) => void;
  updateQuantity: (id: Product["id"], delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  tax: number;
  subtotal: number;
}
