import { CartService } from "../../../src/services/CartService";
import { AppError } from "../../../src/middleware/ErrorHandling";
import { ICartRepository } from "../../../src/clients/ICartRepository";
import { Cart } from "../../../src/models";

describe("CartService", () => {
  let mockRepo: jest.Mocked<ICartRepository>;
  let service: CartService;

  beforeEach(() => {
    mockRepo = {
      createCart: jest.fn(),
      getCart: jest.fn(),
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateCart: jest.fn(),
      deleteCart: jest.fn(),
    };
    service = new CartService(mockRepo);
  });

  test("createCart() should call repo.createCart and return cart", async () => {
    const fakeCart: Cart = {
      id: "123",
      items: [],
      subtotal: 0,
      total: 0,
      tax: 0,
      createdAt: new Date().toISOString(),
      expiresAt: "",
      customerId: undefined,
    };
    mockRepo.createCart.mockResolvedValue(fakeCart);

    const result = await service.createCart();
    expect(mockRepo.createCart).toHaveBeenCalledTimes(1);
    expect(result).toEqual(fakeCart);
  });

  test("addItem() throws INVALID_ITEM when quantity < 1", async () => {
    const item = { productId: "p1", quantity: 0 };
    await expect(service.addItem("cart1", item as any)).rejects.toThrow(
      AppError
    );
    await expect(service.addItem("cart1", item as any)).rejects.toMatchObject({
      code: "INVALID_ITEM",
    });
  });

  test("addItem() throws CART_NOT_FOUND when repo returns null", async () => {
    mockRepo.addItem.mockResolvedValueOnce(null as any);
    const item = { productId: "p1", quantity: 2 };
    await expect(service.addItem("cart1", item as any)).rejects.toThrow(
      "Cart not found"
    );
  });

  test("validateCartRules throws INCOMPATIBLE_ITEMS for mixed plan types", async () => {
    const fakeCart = {
      id: "1",
      items: [
        {
          id: "a",
          productType: "plan",
          quantity: 1,
          unitPrice: 10,
          totalPrice: 10,
          productId: "1",
          productName: "Plan A",
          metadata: { planType: "prepaid" },
        },
        {
          id: "b",
          productType: "plan",
          quantity: 1,
          unitPrice: 10,
          totalPrice: 10,
          productId: "2",
          productName: "Plan B",
          metadata: { planType: "postpaid" },
        },
      ],
    } as any;
    expect(() => (service as any).validateCartRules(fakeCart)).toThrow(
      AppError
    );
  });

  test("checkoutCart() throws EMPTY_CART for empty cart", async () => {
    mockRepo.getCart.mockResolvedValue({
      id: "1",
      items: [],
      subtotal: 0,
      total: 0,
      tax: 0,
    } as any);
    await expect(service.checkoutCart("1", "c1", "pm1")).rejects.toMatchObject({
      code: "EMPTY_CART",
    });
  });

  test("validateCartRules allows single plan type", () => {
    const fakeCart = {
      id: "1",
      items: [
        {
          id: "a",
          productType: "plan",
          quantity: 1,
          unitPrice: 10,
          totalPrice: 10,
          productId: "1",
          productName: "Plan A",
          metadata: { planType: "prepaid" },
        },
      ],
    } as any;

    expect(() => (service as any).validateCartRules(fakeCart)).not.toThrow();
  });

  test("updateCart() updates safe fields correctly", async () => {
    const fakeCart = {
      id: "1",
      items: [],
      subtotal: 0,
      total: 0,
      tax: 0,
      createdAt: new Date().toISOString(),
      expiresAt: "",
    } as any;
    mockRepo.updateCart.mockResolvedValue({ ...fakeCart, customerId: "c123" });

    const result = await service.updateCart("1", { customerId: "c123" });
    expect(result.customerId).toBe("c123");
    expect(mockRepo.updateCart).toHaveBeenCalledWith("1", {
      customerId: "c123",
    });
  });

  test("checkoutCart() returns confirmed with realistic items", async () => {
    const fakeCart = {
      id: "1",
      items: [
        {
          id: "i1",
          productId: "p1",
          productName: "Prod1",
          productType: "device",
          quantity: 2,
          unitPrice: 50,
          totalPrice: 100,
        },
      ],
      subtotal: 100,
      tax: 13,
      total: 113,
    } as any;

    mockRepo.getCart.mockResolvedValue(fakeCart);
    mockRepo.updateCart.mockResolvedValue(fakeCart);

    const result = await service.checkoutCart("1", "c1", "pm1");

    expect(result.status).toBe("confirmed");
    expect(result.cart).toEqual(fakeCart);
    expect(result.orderId).toBeDefined();
    expect(result.confirmationNumber).toMatch(/^CONF-/);
  });

  test("checkoutCart() returns valid confirmation for non-empty cart", async () => {
    const fakeCart = {
      id: "1",
      items: [{ id: "i1", quantity: 1 }],
      subtotal: 10,
      total: 11,
      tax: 1,
    };
    mockRepo.getCart.mockResolvedValue(fakeCart as any);
    mockRepo.updateCart.mockResolvedValue(fakeCart as any);

    const result = await service.checkoutCart("1", "c1", "pm1");

    expect(result.status).toBe("confirmed");
    expect(result.cart).toEqual(fakeCart);
    expect(mockRepo.updateCart).toHaveBeenCalledWith("1", { customerId: "c1" });
  });
});
