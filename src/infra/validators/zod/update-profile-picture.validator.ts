import { z } from "zod";
import { AppError } from "@/domain/errors/app-error";
import { NextFunction, Request, Response } from "express";

export const updateUserProfilePictureSchema = z.object({
  profilePicture: z.instanceof(File, { message: "A foto de perfil deve ser um arquivo" }),
});

export function validateUpdateUserProfilePicture(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    req.body = updateUserProfilePictureSchema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError(error.issues[0].message, 400);
    }
    next(error);
  }
}
