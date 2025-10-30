import { randomUUID } from "crypto";
import { ICartRepository } from "../clients/ICartRepository";
import { AppError } from "../middleware/ErrorHandling";
import { Cart, CartItemInput, CheckoutCart } from "../models/";

export class CartService {
  constructor(private cartRepository: ICartRepository) {}

  async createCart(customerId?: string): Promise<Cart> {
    const cart = await this.cartRepository.createCart();
    if (customerId) {
      return this.cartRepository.updateCart(cart.id, { customerId });
    }

    return cart;
  }

  async getCart(cartId: string): Promise<Cart> {
    return this.cartRepository.getCart(cartId);
  }

  async addItem(cartId: string, item: CartItemInput): Promise<Cart> {
    const cart = await this.cartRepository.addItem(cartId, item);

    if (item.quantity < 1 || item.quantity > 10)
      throw new AppError("Invalid item quantity", 400, "INVALID_ITEM");

    if (!cart) throw new AppError("Cart not found", 404, "CART_NOT_FOUND");

    // Apply business rules
    this.validateCartRules(cart);

    return cart;
  }

  async removeItem(cartId: string, itemId: string): Promise<Cart> {
    return this.cartRepository.removeItem(cartId, itemId);
  }

  async updateCart(cartId: string, updates: Partial<Cart>): Promise<Cart> {
    // Here only safe updates like customerId, etc. are expected
    const updatedCart = await this.cartRepository.updateCart(cartId, updates);
    return updatedCart;
  }

  async deleteCart(cartId: string): Promise<void> {
    await this.cartRepository.deleteCart(cartId);
  }

  async checkoutCart(
    cartId: string,
    customerId: string,
    paymentMethodId: string
  ): Promise<CheckoutCart> {
    const cart = await this.getCart(cartId);

    if (!cart.items.length) {
      throw new AppError("Cannot checkout an empty cart", 400, "EMPTY_CART");
    }

    // simulate payment processing here
    const orderId = randomUUID();
    const confirmationNumber = `CONF-${Math.floor(Math.random() * 1000)}`;

    // optionally, update customerId
    await this.updateCart(cartId, { customerId });

    return {
      orderId,
      status: "confirmed",
      confirmationNumber,
      cart,
      paymentMethodId,
    };
  }

  private validateCartRules(cart: Cart): void {
    // Example: Can't mix prepaid and postpaid plans
    const planTypes = cart.items
      .filter((item) => item.productType === "plan")
      .map((item) => item.metadata?.planType)
      .filter(Boolean);

    const uniquePlanTypes = new Set(planTypes);

    if (uniquePlanTypes.size > 1) {
      throw new AppError(
        "Incompatible items in cart",
        409,
        "INCOMPATIBLE_ITEMS"
      );
    }
  }
}
