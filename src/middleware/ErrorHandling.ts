import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "CART_EXPIRED"
  | "EMPTY_CART"
  | "ITEM_NOT_FOUND"
  | "INCOMPATIBLE_ITEMS"
  | "CART_NOT_FOUND"
  | "INVALID_ITEM"
  | "INTERNAL_ERROR"
  | "INVALID_REQUEST"
  | "INVALID_CART_ID"
  | "PRODUCT_UNAVAILABLE"
  | "INVENTORY_UNAVAILABLE"
  | "PAYMENT_FAILED"
  | "INVALID_PROMO_CODE";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number, // only used internally
    public code: ErrorCode,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  logger(`Unexpexted error, ${err}`);

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
};
