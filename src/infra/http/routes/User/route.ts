import { Router } from "express";
import { FindUserController } from "../../controllers/User/find-user.controller";
import { UpdateUserController } from "../../controllers/User/update-user.controller";
import { expressAdaptRoute } from "../../adapters/express";
import { UpdateUserProfilePictureController } from "../../controllers/User/update-user-profile-picture.controller";
import { container } from "../../../config/container";
import { validateUpdateUser } from "@/infra/validators/zod/update-user.validator";
import { profilePictureUpload } from "../../middlewares/profile-picture-upload.middleware";
import { ListUsersController } from "../../controllers/User/list-users.controller";

export const userRouter = Router();

const findUserController = container.resolve(FindUserController);
const updateUserController = container.resolve(UpdateUserController);
const updateUserProfilePictureController = container.resolve(
  UpdateUserProfilePictureController
);
const listUsersController = container.resolve(ListUsersController);

userRouter.get("/list", expressAdaptRoute(listUsersController));
userRouter.get("/", expressAdaptRoute(findUserController));
userRouter.patch(
  "/",
  validateUpdateUser,
  expressAdaptRoute(updateUserController)
);
userRouter.patch(
  "/profile-picture",
  profilePictureUpload,
  expressAdaptRoute(updateUserProfilePictureController)
);
