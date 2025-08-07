import { container } from "tsyringe";
import { UserRepository } from "@/infra/repositories/prisma/User/user.repository";
import { IUserGateway } from "@/domain/gateways/user.gateway";
import { FindUserUsecase } from "@/application/usecases/User/find-user.usecase";
import { UpdateUserProfilePictureUsecase } from "@/application/usecases/User/update-user-profile-picture.usecase";
import { UpdateUserUsecase } from "@/application/usecases/User/update-user.usecase";

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

export { container };
