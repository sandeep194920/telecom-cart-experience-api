import { CartController } from "../../../src/controllers/CartController";
import { CartService } from "../../../src/services/CartService";

describe("CartController", () => {
  let mockService: jest.Mocked<CartService>;
  let controller: CartController;
  let req: any, res: any, next: any;

  beforeEach(() => {
    mockService = {
      createCart: jest.fn(),
      getCart: jest.fn(),
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateCart: jest.fn(),
      deleteCart: jest.fn(),
      checkoutCart: jest.fn(),
    } as any;

    controller = new CartController(mockService);

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  test("createCart should respond with 201 and cart", async () => {
    mockService.createCart.mockResolvedValue({ id: "1" } as any);
    req = { body: {} };
    await controller.createCart(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: "1" });
  });

  test("getCart should return cart with 200", async () => {
    mockService.getCart.mockResolvedValue({ id: "1" } as any);
    req = { params: { cartId: "1" } };
    await controller.getCart(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("checkoutCart should call service and return result", async () => {
    mockService.checkoutCart.mockResolvedValue({ orderId: "o1" } as any);
    req = {
      params: { cartId: "1" },
      body: { customerId: "c1", paymentMethodId: "pm1" },
    };
    await controller.checkoutCart(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ orderId: "o1" });
  });

  test("controller passes error to next()", async () => {
    const err = new Error("fail");
    mockService.getCart.mockRejectedValue(err);
    req = { params: { cartId: "1" } };
    await controller.getCart(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  test("removeItem endpoint calls service and returns updated cart", async () => {
    mockService.removeItem.mockResolvedValue({ id: "1", items: [] } as any);
    req = { params: { cartId: "1", itemId: "i1" } };
    await controller.removeItem(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: "1", items: [] });
  });

  test("updateCart endpoint returns updated cart", async () => {
    mockService.updateCart.mockResolvedValue({
      id: "1",
      customerId: "c1",
    } as any);
    req = { params: { cartId: "1" }, body: { customerId: "c1" } };
    await controller.updateCart(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: "1", customerId: "c1" });
  });
});
