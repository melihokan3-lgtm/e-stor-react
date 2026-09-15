export interface OrderItem {
  id: number;
  title: string;
  img: string;
  price: number;
  qty: number;
  category: string;
}

export interface Order {
  id: string | number;
  userId?: string | number;
  status: string;
  total: number;
  deliveryAddress: string;
  items: OrderItem[];
  date?: string;
  createdAt?: string;
  paymentMethod?: string;
  coupon?: string | null;
  couponDiscount?: number;
}

export interface CreateOrderInput extends Omit<Order, "id" | "userId"> {
  id?: string | number;
}

export interface OrdersContextValue {
  orders: Order[];
  ordersLoading: boolean;
  ordersError: string;
  addOrder: (order: CreateOrderInput) => Promise<Order>;
  updateOrderAddress: (orderId: Order["id"], address: string) => void;
}
