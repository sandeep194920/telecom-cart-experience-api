import { Cart } from "./Cart";

export interface CheckoutCart {
  orderId: string;
  status: "confirmed" | "pending";
  cart: Cart;
  confirmationNumber: string;
  paymentMethodId: string;
  estimatedDelivery?: string; // ISO 8601
}
