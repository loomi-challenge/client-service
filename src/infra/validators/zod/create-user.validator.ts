import { z } from "zod";
import { AppError } from "@/domain/errors/app-error";
import { NextFunction, Request, Response } from "express";

export const createUserSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: "Email inválido" }),
  password: z.string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres" })
    .refine((password) => /[a-z]/.test(password), {
      message: "A senha deve conter pelo menos 1 letra minúscula"
    })
    .refine((password) => /[A-Z]/.test(password), {
      message: "A senha deve conter pelo menos 1 letra maiúscula"
    })
    .refine((password) => /\d/.test(password), {
      message: "A senha deve conter pelo menos 1 número"
    })
    .refine((password) => /[^a-zA-Z\d]/.test(password), {
      message: "A senha deve conter pelo menos 1 caractere especial"
    }),
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  address: z.string().min(3, { message: "O endereço deve ter pelo menos 3 caracteres" }),
  bankingDetails: z.object({
    agency: z.string().min(3, { message: "A agência deve ter pelo menos 3 caracteres" }),
    accountNumber: z.string().min(3, { message: "O número da conta deve ter pelo menos 3 caracteres" }),
  }),
});

export function validateCreateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    req.body = createUserSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.issues[0].message, 400);
    }
    next(error);
  }
}
