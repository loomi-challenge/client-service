import { Router } from "express";
import { FindUserController } from "../../controllers/User/find-user.controller";
import { UpdateUserController } from "../../controllers/User/update-user.controller";
import { expressAdaptRoute } from "../../adapters/express";
import { UserRepository } from "@/infra/repositories/prisma/User/user.repository";
import { FindUserUsecase } from "@/application/usecases/User/find-user.usecase";
import { UpdateUserUsecase } from "@/application/usecases/User/update-user.usecase";
import { UpdateUserProfilePictureController } from "../../controllers/User/update-user-profile-picture.controller";
import { UpdateUserProfilePictureUsecase } from "@/application/usecases/User/update-user-profile-picture.usecase";
import { UserCacheRepository } from "@/infra/repositories/cache/User/user-cache.repository";

export const userRouter = Router();
const userRepository = new UserRepository();
const userCacheRepository = new UserCacheRepository();
const findUserUseCase = new FindUserUsecase(
  userRepository,
  userCacheRepository
);
const updateUserUseCase = new UpdateUserUsecase(
  userRepository,
  userCacheRepository
);
const updateUserProfilePictureUseCase = new UpdateUserProfilePictureUsecase(
  userRepository,
  userCacheRepository
);

const findUserController = new FindUserController(findUserUseCase);
const updateUserController = new UpdateUserController(updateUserUseCase);
const updateUserProfilePictureController =
  new UpdateUserProfilePictureController(updateUserProfilePictureUseCase);

userRouter.get("/:id", expressAdaptRoute(findUserController));
userRouter.patch("/:id", expressAdaptRoute(updateUserController));
userRouter.patch(
  "/:id/profile-picture",
  expressAdaptRoute(updateUserProfilePictureController)
);
