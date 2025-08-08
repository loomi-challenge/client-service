import { User } from "@/domain/entities/User";
import { IUseCase } from "../IUsecase";
import { IUserGateway } from "@/domain/gateways/user.gateway";
import { inject, injectable } from "tsyringe";
import { IUserCacheRepository } from "@/domain/gateways/user-cache.gateway";
import { AppError } from "@/domain/errors/app-error";

export type UpdateUserProfilePictureInput = {
  id: string;
  profilePicture: string;
};
@injectable()
export class UpdateUserProfilePictureUsecase
  implements IUseCase<UpdateUserProfilePictureInput, User>
{
  constructor(
    @inject("UserGateway") private readonly userGateway: IUserGateway,
    @inject("UserCacheRepository")
    private readonly userCacheRepository: IUserCacheRepository
  ) {}

  async execute(input: UpdateUserProfilePictureInput) {
    await this.validateUser(input.id);
    await this.validateProfilePicture(input.profilePicture);
    const updatedUser = await this.userGateway.updateUserProfilePicture(
      input.id,
      input.profilePicture
    );
    await this.userCacheRepository.invalidateUserCache(input.id);
    return updatedUser;
  }

  private async validateUser(id: string) {
    const user = await this.userGateway.findUserById(id);
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }
    return user;
  }

  private async validateProfilePicture(profilePicture: string) {
    if (!profilePicture) {
      throw new AppError("Foto de perfil é obrigatória", 400);
    }
    return profilePicture;
  }
}
