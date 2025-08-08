import { z } from "zod";
import { AppError } from "@/domain/errors/app-error";
import { NextFunction, Request, Response } from "express";

export const confirmUserSchema = z.object({
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Email inválido!" }),
  code: z.string()
    .min(1, { message: "Digite o código de confirmação!" })
    .refine((value) => isNaN(Number(value)) === false, {
      message: "O código deve ser um número válido"
    }),
});

export function validateConfirmUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    req.body = confirmUserSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.issues[0].message, 400);
    }
    next(error);
  }
}
