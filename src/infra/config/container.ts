import { container } from "tsyringe";
import { UserRepository } from "@/infra/repositories/prisma/User/user.repository";
import { IUserGateway } from "@/domain/gateways/user.gateway";
import { FindUserUsecase } from "@/application/usecases/User/find-user.usecase";
import { UpdateUserProfilePictureUsecase } from "@/application/usecases/User/update-user-profile-picture.usecase";
import { UpdateUserUsecase } from "@/application/usecases/User/update-user.usecase";
import { AuthUserUseCase } from "@/application/usecases/Auth/auth-user.usecase";
import { ConfirmUserUseCase } from "@/application/usecases/Auth/confirm-user.usecase";
import { CreateUserUseCase } from "@/application/usecases/Auth/create-user.usecase";
import { ResendConfirmationCodeUseCase } from "@/application/usecases/Auth/resend-confirmation-code.usecase";
import { CognitoAuthProvider } from "../auth/cognito-auth-provider";
import { UserCacheRepository } from "../repositories/cache/User/user-cache.repository";

// User

container.register<IUserGateway>("UserGateway", {
  useClass: UserRepository,
});

container.register("FindUserUsecase", {
  useClass: FindUserUsecase,
});

container.register("UpdateUserUsecase", {
  useClass: UpdateUserUsecase,
});

container.register("UpdateUserProfilePictureUsecase", {
  useClass: UpdateUserProfilePictureUsecase,
});

container.register("UserCacheRepository", {
  useClass: UserCacheRepository,
});

// Auth
container.register("AuthProvider", {
  useClass: CognitoAuthProvider,
});

container.register("AuthUserUseCase", {
  useClass: AuthUserUseCase,
});

container.register("ConfirmUserUseCase", {
  useClass: ConfirmUserUseCase,
});

container.register("CreateUserUseCase", {
  useClass: CreateUserUseCase,
});

container.register("ResendConfirmationCodeUseCase", {
  useClass: ResendConfirmationCodeUseCase,
});

export { container };
