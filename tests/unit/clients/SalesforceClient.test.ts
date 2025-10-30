import { salesforceClient } from "../../../src/clients/SalesforceClient";
import { AppError } from "../../../src/middleware/ErrorHandling";

describe("SalesforceClient", () => {
  beforeEach(() => {
    (salesforceClient as any).cartContexts.clear();
  });

  test("createCart should return cart with defaults", async () => {
    const cart = await salesforceClient.createCart();
    expect(cart.id).toBeDefined();
    expect(cart.items).toEqual([]);
    expect(cart.total).toBe(0);
  });

  test("addItem should add item to cart", async () => {
    const cart = await salesforceClient.createCart();
    const updated = await salesforceClient.addItem(cart.id, {
      productId: "p1",
      quantity: 2,
    });
    expect(updated.items.length).toBe(1);
    expect(updated.subtotal).toBeGreaterThan(0);
  });

  test("removeItem should throw if item not found", async () => {
    const cart = await salesforceClient.createCart();
    await expect(salesforceClient.removeItem(cart.id, "fake")).rejects.toThrow(
      AppError
    );
  });

  test("getCart throws CART_EXPIRED for expired carts", async () => {
    const cart = await salesforceClient.createCart();
    // simulate expiration
    (cart.expiresAt as any) = new Date(Date.now() - 10000).toISOString();
    (salesforceClient as any).cartContexts.set(cart.id, { cart });
    await expect(salesforceClient.getCart(cart.id)).rejects.toMatchObject({
      code: "CART_EXPIRED",
    });
  });

  test("updateCart should persist customerId", async () => {
    const cart = await salesforceClient.createCart();
    const updated = await salesforceClient.updateCart(cart.id, {
      customerId: "c123",
    });
    expect(updated.customerId).toBe("c123");
  });

  test("getCart throws CART_EXPIRED if cart expired", async () => {
    const cart = await salesforceClient.createCart();
    cart.expiresAt = new Date(Date.now() - 1000).toISOString();
    (salesforceClient as any).cartContexts.set(cart.id, { cart });

    await expect(salesforceClient.getCart(cart.id)).rejects.toMatchObject({
      code: "CART_EXPIRED",
    });
  });
});
