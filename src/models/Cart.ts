import { CartItem } from "./CartItem";

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  tax: number;
  subtotal: number;
  createdAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
  customerId?: string;
}
