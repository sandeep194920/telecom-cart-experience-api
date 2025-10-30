import { Cart, CartItemInput } from "../models/";

export interface ICartRepository {
  createCart(): Promise<Cart>;
  getCart(cartId: string): Promise<Cart>;
  addItem(cartId: string, item: CartItemInput): Promise<Cart>;
  removeItem(cartId: string, itemId: string): Promise<Cart>;
  updateCart(cartId: string, updates: Partial<Cart>): Promise<Cart>;
  deleteCart(cartId: string): Promise<void>;
}
