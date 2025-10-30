import { NextFunction, Request, Response } from "express";
import { CartService } from "../services/CartService";

export class CartController {
  constructor(private cartService: CartService) {}

  async createCart(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await this.cartService.createCart(req.body?.customerId);
      res.status(201).json(cart);
    } catch (err) {
      next(err);
    }
  }

  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await this.cartService.getCart(req.params.cartId);
      res.status(200).json(cart);
    } catch (err) {
      next(err);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { cartId } = req.params;
      const item = req.body;
      const updatedCart = await this.cartService.addItem(cartId, item);
      res.status(200).json(updatedCart);
    } catch (err) {
      next(err);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { cartId, itemId } = req.params;
      const updatedCart = await this.cartService.removeItem(cartId, itemId);
      res.status(200).json(updatedCart);
    } catch (err) {
      next(err);
    }
  }

  async updateCart(req: Request, res: Response, next: NextFunction) {
    try {
      const { cartId } = req.params;
      const updates = req.body;
      const updatedCart = await this.cartService.updateCart(cartId, updates);
      res.status(200).json(updatedCart);
    } catch (err) {
      next(err);
    }
  }

  async deleteCart(req: Request, res: Response, next: NextFunction) {
    try {
      const { cartId } = req.params;
      await this.cartService.deleteCart(cartId);
      res.status(204).json({});
    } catch (err) {
      next(err);
    }
  }

  async checkoutCart(req: Request, res: Response, next: NextFunction) {
    try {
      const { cartId } = req.params;
      const { customerId, paymentMethodId } = req.body;

      const checkoutResult = await this.cartService.checkoutCart(
        cartId,
        customerId,
        paymentMethodId
      );

      res.status(200).json(checkoutResult);
    } catch (err) {
      next(err);
    }
  }
}
