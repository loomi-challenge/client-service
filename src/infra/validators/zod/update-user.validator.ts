import { z } from "zod";
import { AppError } from "@/domain/errors/app-error";
import { NextFunction, Request, Response } from "express";

export const updateUserSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  address: z.string().min(3, { message: "O endereço deve ter pelo menos 3 caracteres" }),
  bankingDetails: z.object({
    agency: z.string().min(3, { message: "A agência deve ter pelo menos 3 caracteres" }),
    accountNumber: z.string().min(3, { message: "O número da conta deve ter pelo menos 3 caracteres" }),
  }),
});

export function validateUpdateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    req.body = updateUserSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.issues[0].message, 400);
    }
    next(error);
  }
}
