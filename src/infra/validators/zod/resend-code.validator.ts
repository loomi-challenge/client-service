import { z } from "zod";
import { AppError } from "@/domain/errors/app-error";
import { NextFunction, Request, Response } from "express";

export const resendCodeSchema = z.object({
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Email inválido!" }),
});

export function validateResendCode(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    req.body = resendCodeSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.issues[0].message, 400);
    }
    next(error);
  }
}
