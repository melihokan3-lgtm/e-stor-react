export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image?: string;
  images?: string[];
  oldPrice?: number | string;
  isNew?: boolean;
  stock?: number;
  brand?: string;
  rating?: {
    rate: number;
    count?: number;
  };
}
