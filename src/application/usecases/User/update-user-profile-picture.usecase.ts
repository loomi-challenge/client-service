import { User } from "@/domain/entities/User";
import { IUseCase } from "../IUsecase";
import { IUserGateway } from "@/domain/gateways/user.gateway";
import { IUserCacheRepository } from "@/domain/gateways/user-cache.gateway";

export type UpdateUserProfilePictureInput = {
  id: string;
  profilePicture: string;
};

export class UpdateUserProfilePictureUsecase
  implements IUseCase<UpdateUserProfilePictureInput, User>
{
  constructor(
    private readonly userGateway: IUserGateway,
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
      throw new Error("User not found");
    }
    return user;
  }

  private async validateProfilePicture(profilePicture: string) {
    if (!profilePicture) {
      throw new Error("Profile picture is required");
    }
    return profilePicture;
  }
}
