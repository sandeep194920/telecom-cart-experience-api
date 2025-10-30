import { z } from "zod";

export const addItemSchema = z.object({
  params: z.object({
    cartId: z.string(),
  }),
  body: z.object({
    productId: z.string(),
    quantity: z.number().int().min(1).max(10), // now validation is here
    metadata: z
      .object({
        planType: z.enum(["prepaid", "postpaid"]).optional(),
        contractLength: z.number().optional(),
        imei: z.string().optional(),
      })
      .optional(),
  }),
});

export const checkoutSchema = z.object({
  body: z.object({
    customerId: z.string(),
    paymentMethodId: z.string(),
  }),
});
