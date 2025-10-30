import request from "supertest";
import app from "../../src/app";
import config from "../../src/config";

export const api = {
  get: (path: string) => request(app).get(`${config.api.basePath}${path}`),
  post: (path: string) => request(app).post(`${config.api.basePath}${path}`),
  put: (path: string) => request(app).put(`${config.api.basePath}${path}`),
  delete: (path: string) =>
    request(app).delete(`${config.api.basePath}${path}`),
};
import { salesforceClient } from "../../src/clients/SalesforceClient";
import { Cart } from "../../src/models";

describe("Cart API Integration - Edge Cases", () => {
  let cartId: string;

  beforeEach(async () => {
    // Clear in-memory carts
    (
      salesforceClient as unknown as {
        cartContexts: Map<string, { cart: Cart }>;
      }
    ).cartContexts.clear();

    // Create a new cart
    const res = await api.post("/carts").send({});
    cartId = res.body.id;
  });

  test("Adding item with quantity > 10 → validation fails", async () => {
    const res = await api
      .post(`/carts/${cartId}/items`)
      .send({ productId: "p1", quantity: 11 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("Checkout empty cart → returns EMPTY_CART", async () => {
    const res = await api
      .post(`/carts/${cartId}/checkout`)
      .send({ customerId: "c1", paymentMethodId: "pm1" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("EMPTY_CART");
  });

  test("Adding incompatible plans → returns INCOMPATIBLE_ITEMS", async () => {
    // Add first plan
    const res1 = await api.post(`/carts/${cartId}/items`).send({
      productId: "plan1",
      quantity: 1,
      metadata: { planType: "prepaid" },
    });
    expect(res1.status).toBe(200);

    // Add second plan with conflicting planType
    const res2 = await api.post(`/carts/${cartId}/items`).send({
      productId: "plan2",
      quantity: 1,
      metadata: { planType: "postpaid" },
    });

    expect(res2.status).toBe(409);
    expect(res2.body.error.code).toBe("INCOMPATIBLE_ITEMS");
  });

  test("Fetch non-existent cart → CART_EXPIRED", async () => {
    const fakeId = "non-existent";
    const res = await api.get(`/carts/${fakeId}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("CART_EXPIRED");
  });
});
