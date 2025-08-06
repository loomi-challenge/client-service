import { Router } from "express";
import { FindUserController } from "../../controllers/User/find-user.controller";
import { UpdateUserController } from "../../controllers/User/update-user.controller";
import { expressAdaptRoute } from "../../adapters/express";
import { UserRepository } from "@/infra/repositories/prisma/User/user.repository";
import { FindUserUsecase } from "@/application/usecases/User/find-user.usecase";
import { UpdateUserUsecase } from "@/application/usecases/User/update-user.usecase";
import { UpdateUserProfilePictureController } from "../../controllers/User/update-user-profile-picture.controller";
import { UpdateUserProfilePictureUsecase } from "@/application/usecases/User/update-user-profile-picture.usecase";
import { S3StorageGateway } from "@/infra/aws/s3";
import multer from "multer";

export const userRouter = Router();
const userRepository = new UserRepository();
const storageGateway = new S3StorageGateway();
const findUserUseCase = new FindUserUsecase(userRepository);
const updateUserUseCase = new UpdateUserUsecase(userRepository);
const updateUserProfilePictureUseCase = new UpdateUserProfilePictureUsecase(
  userRepository,
  storageGateway
);
const storage = multer.memoryStorage();
const upload = multer({ storage });
const findUserController = new FindUserController(findUserUseCase);
const updateUserController = new UpdateUserController(updateUserUseCase);
const updateUserProfilePictureController =
  new UpdateUserProfilePictureController(updateUserProfilePictureUseCase);

userRouter.get("/:id", expressAdaptRoute(findUserController));
userRouter.patch("/:id", expressAdaptRoute(updateUserController));
userRouter.patch(
  "/:id/profile-picture",
  upload.single("profilePicture"),
  async (req, res) => {
    console.log("req.file", req.file);
    console.log("req.body", req.body);
    res.send("ok");
  }
);
