import { Router } from "express";
import { FindUserController } from "../../controllers/User/find-user.controller";
import { UpdateUserController } from "../../controllers/User/update-user.controller";
import { expressAdaptRoute } from "../../adapters/express";
import { UpdateUserProfilePictureController } from "../../controllers/User/update-user-profile-picture.controller";
import { container } from "../../../config/container";

export const userRouter = Router();

const findUserController = container.resolve(FindUserController);
const updateUserController = container.resolve(UpdateUserController);
const updateUserProfilePictureController = container.resolve(
  UpdateUserProfilePictureController
);

userRouter.get("/:id", expressAdaptRoute(findUserController));
userRouter.patch("/:id", expressAdaptRoute(updateUserController));
userRouter.patch(
  "/:id/profile-picture",
  expressAdaptRoute(updateUserProfilePictureController)
);
