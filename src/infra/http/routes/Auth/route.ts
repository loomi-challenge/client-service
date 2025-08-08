import { Router } from "express";
import { expressAdaptRoute } from "../../adapters/express";
import { CreateUserController } from "../../controllers/Auth/create-user.controller";
import { AuthUserController } from "../../controllers/Auth/auth-user.controller";
import { ConfirmUserController } from "../../controllers/Auth/confirm-user.controller";
import { ResendConfirmationCodeController } from "../../controllers/Auth/resend-confirmation-code.controller";
import { container } from "tsyringe";
import { validateCreateUser } from "@/infra/validators/zod/create-user.validator";
import { validateAuthUser } from "@/infra/validators/zod/auth-user.validator";
import { validateConfirmUser } from "@/infra/validators/zod/confirm-user.validator";
import { validateResendCode } from "@/infra/validators/zod/resend-code.validator";

export const authRouter = Router();

const createUserController = container.resolve(CreateUserController);

const authUserController = container.resolve(AuthUserController);
const confirmUserController = container.resolve(ConfirmUserController);

const resendConfirmationCodeController = container.resolve(
  ResendConfirmationCodeController
);

authRouter.post(
  "/login",
  validateAuthUser,
  expressAdaptRoute(authUserController)
);
authRouter.post(
  "/register",
  validateCreateUser,
  expressAdaptRoute(createUserController)
);
authRouter.post(
  "/confirm-user",
  validateConfirmUser,
  expressAdaptRoute(confirmUserController)
);
authRouter.post(
  "/resend-confirmation-code",
  validateResendCode,
  expressAdaptRoute(resendConfirmationCodeController)
);
