import { Router } from "express";
import { expressAdaptRoute } from "../../adapters/express";
import { CreateUserController } from "../../controllers/Auth/create-user.controller";
import { CreateUserUseCase } from "@/application/usecases/Auth/create-user.usecase";

import { AuthUserUseCase } from "@/application/usecases/Auth/auth-user.usecase";
import { AuthUserController } from "../../controllers/Auth/auth-user.controller";
import { ConfirmUserController } from "../../controllers/Auth/confirm-user.controller";
import { ConfirmUserUseCase } from "@/application/usecases/Auth/confirm-user.usecase";
import { UserRepository } from "@/infra/repositories/prisma/User/user.repository";
import { CognitoAuthProvider } from "@/infra/auth/cognito-auth-provider";
import { ResendConfirmationCodeController } from "../../controllers/Auth/resend-confirmation-code.controller";
import { ResendConfirmationCodeUseCase } from "@/application/usecases/Auth/resend-confirmation-code.usecase";

export const authRouter = Router();

const authProvider = new CognitoAuthProvider();
const userRepository = new UserRepository();

const createUserUseCase = new CreateUserUseCase(authProvider, userRepository);
const createUserController = new CreateUserController(createUserUseCase);
const authUserUseCase = new AuthUserUseCase(authProvider);
const authUserController = new AuthUserController(authUserUseCase);
const confirmUserUseCase = new ConfirmUserUseCase(authProvider);
const confirmUserController = new ConfirmUserController(confirmUserUseCase);
const resendConfirmationCodeUseCase = new ResendConfirmationCodeUseCase(
  authProvider
);
const resendConfirmationCodeController = new ResendConfirmationCodeController(
  resendConfirmationCodeUseCase
);

authRouter.post("/login", expressAdaptRoute(authUserController));
authRouter.post("/register", expressAdaptRoute(createUserController));
authRouter.post("/confirm-user", expressAdaptRoute(confirmUserController));
authRouter.post("/resend-confirmation-code", expressAdaptRoute(resendConfirmationCodeController));
