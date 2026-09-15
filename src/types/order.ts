import type { CartItem } from "./cart";

export interface Order {
  id: string | number;
  userId?: string | number;
  status: string;
  total: number;
  deliveryAddress: string;
  items: CartItem[];
  date?: string;
}

export interface CreateOrderInput extends Omit<Order, "id" | "userId"> {
  id?: string | number;
}

export interface OrdersContextValue {
  orders: Order[];
  addOrder: (order: CreateOrderInput) => void;
  updateOrderAddress: (orderId: Order["id"], address: string) => void;
}
