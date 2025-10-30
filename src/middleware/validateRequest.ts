import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";
import { AppError } from "./ErrorHandling";

export const zodMiddleware =
  (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (err: any) {
      next(
        new AppError(
          err.errors?.[0]?.message || "Validation failed",
          400,
          "VALIDATION_ERROR"
        )
      );
    }
  };
