import { Router } from "express";
import { FindUserController } from "../../controllers/User/find-user.controller";
import { UpdateUserController } from "../../controllers/User/update-user.controller";
import { expressAdaptRoute } from "../../adapters/express";
import { UpdateUserProfilePictureController } from "../../controllers/User/update-user-profile-picture.controller";
import { container } from "../../../config/container";
import { validateUpdateUser } from "@/infra/validators/zod/update-user.validator";

export const userRouter = Router();

const findUserController = container.resolve(FindUserController);
const updateUserController = container.resolve(UpdateUserController);
const updateUserProfilePictureController = container.resolve(
  UpdateUserProfilePictureController
);

userRouter.get("/", expressAdaptRoute(findUserController));
userRouter.patch("/", validateUpdateUser, expressAdaptRoute(updateUserController));
userRouter.patch(
  "/profile-picture",
  expressAdaptRoute(updateUserProfilePictureController)
);
