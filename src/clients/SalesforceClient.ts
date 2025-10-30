import { randomUUID } from "crypto";
import { Cart, CartItem, CartItemInput } from "../models";
import { ICartRepository } from "./ICartRepository";
import { AppError } from "../middleware/ErrorHandling";

class SalesforceClient implements ICartRepository {
  private cartContexts: Map<string, { cart: Cart }> = new Map();
  private readonly CONTEXT_TTL = 30 * 60 * 1000; // 30 minutes

  async createCart(): Promise<Cart> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.CONTEXT_TTL).toISOString();

    const cart: Cart = {
      id: randomUUID(),
      items: [],
      createdAt: now.toISOString(),
      total: 0,
      tax: 0.13, // for ON province - hardcoding this for testing
      subtotal: 0,
      expiresAt,
      customerId: undefined,
    };
    this.storeCartContext(cart);
    return cart;
  }

  async getCart(cartId: string): Promise<Cart> {
    const context = this.cartContexts.get(cartId);

    if (!context || new Date() > new Date(context.cart.expiresAt)) {
      const errorMsg = `Cart ${cartId} has expired`;
      throw new AppError(errorMsg, 404, "CART_EXPIRED");
    }

    return context.cart;
  }

  async addItem(cartId: string, item: CartItemInput): Promise<Cart> {
    const cart = await this.getCart(cartId);

    const { productId, quantity, metadata } = item;

    if (quantity < 1) {
      throw new AppError(
        "Quantity must be at least 1",
        400,
        "VALIDATION_ERROR"
      );
    }

    const unitPrice = await this.lookupPrice(productId);

    const newItem: CartItem = {
      id: randomUUID(),
      productId,
      productName: await this.lookupProductName(productId),
      quantity,
      unitPrice,
      productType: !!metadata?.planType ? "plan" : "addon", // correctly assign productType based on metadata
      totalPrice: unitPrice * quantity,
      metadata: metadata ? { ...metadata } : undefined, // persist metadata for plans
    };

    cart.items.push(newItem);

    this.calculateCartTotals(cart);
    this.storeCartContext(cart);

    return cart;
  }

  async removeItem(cartId: string, itemId: string): Promise<Cart> {
    const cart = await this.getCart(cartId);

    const itemIndex = cart.items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      throw new AppError(
        `Item ${itemId} not found in cart`,
        404,
        "ITEM_NOT_FOUND"
      );
    }

    cart.items = cart.items.filter((item) => item.id !== itemId);
    this.calculateCartTotals(cart);
    this.storeCartContext(cart);

    return cart;
  }

  async updateCart(cartId: string, updates: Partial<Cart>): Promise<Cart> {
    const cart = await this.getCart(cartId);

    // Merge updates into cart.
    // Only safe for metadata fields like customerId
    const updatedCart = { ...cart, ...updates };

    this.storeCartContext(updatedCart);
    return updatedCart;
  }

  async deleteCart(cartId: string): Promise<void> {
    this.cartContexts.delete(cartId);
  }

  private storeCartContext(cart: Cart): void {
    this.cartContexts.set(cart.id, {
      cart,
    });
  }

  private async lookupProductName(productId: string): Promise<string> {
    // Simulate product lookup
    return `Product ${productId}`;
  }

  private async lookupPrice(productId: string): Promise<number> {
    // Simulate product lookup
    return 99.99;
  }

  private calculateCartTotals(cart: Cart): void {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    cart.tax = cart.subtotal * 0.13; // 13% HST for Ontario
    cart.total = cart.subtotal + cart.tax;
  }
}

export const salesforceClient = new SalesforceClient();
