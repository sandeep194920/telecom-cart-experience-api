import { Router } from "express";
import { CartController } from "./controllers/CartController";
import { CartService } from "./services/CartService";
import { salesforceClient } from "./clients/SalesforceClient";
import { errorHandler } from "./middleware/ErrorHandling";
import { zodMiddleware } from "./middleware/ValidateRequest";
import { addItemSchema, checkoutSchema } from "./validators/CartValidator";

// Initialize repository, service, controller
const cartService = new CartService(salesforceClient);
const cartController = new CartController(cartService);

const router = Router();

router.get("/", (req, res) => {
  res.send("Welcome to Experience API. All the cart routes start with /carts");
});

// Cart endpoints
router.post("/carts", (req, res, next) =>
  cartController.createCart(req, res, next)
);

router.get("/carts/:cartId", (req, res, next) =>
  cartController.getCart(req, res, next)
);

router.post(
  "/carts/:cartId/items",
  zodMiddleware(addItemSchema),
  (req, res, next) => cartController.addItem(req, res, next)
);

router.delete("/carts/:cartId/items/:itemId", (req, res, next) =>
  cartController.removeItem(req, res, next)
);

router.patch("/carts/:cartId", (req, res, next) =>
  cartController.updateCart(req, res, next)
);

router.post(
  "/carts/:cartId/checkout",
  zodMiddleware(checkoutSchema),
  (req, res, next) => cartController.checkoutCart(req, res, next)
);

router.delete("/carts/:cartId", (req, res, next) =>
  cartController.deleteCart(req, res, next)
);

router.use(errorHandler);

export default router;
