import { User } from "@/domain/entities/User";
import { IUseCase } from "../IUsecase";
import { IUserGateway } from "@/domain/gateways/user.gateway";
import { IStorageGateway } from "@/domain/gateways/storage.gateway";
import { File } from "@/shared/types/file.types";

export type UpdateUserProfilePictureInput = {
  id: string;
  profilePicture: File;
};

export class UpdateUserProfilePictureUsecase
  implements IUseCase<UpdateUserProfilePictureInput, User>
{
  constructor(
    private readonly userGateway: IUserGateway,
    private readonly storageGateway: IStorageGateway
  ) {}

  async execute(input: UpdateUserProfilePictureInput) {
    console.log("input", input);
    await this.validateUser(input.id);
    await this.validateProfilePicture(input.profilePicture);

    const profilePictureBase64 = input.profilePicture.buffer.toString('base64');

    const profilePictureUrl = await this.storageGateway.uploadProfilePicture(
      input.id,
      profilePictureBase64
    );

    return this.userGateway.updateUserProfilePicture(
      input.id,
      profilePictureUrl
    );
  }

  private async validateUser(id: string) {
    const user = await this.userGateway.findUserById(id);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    return user;
  }

  private async validateProfilePicture(profilePicture: File) {
    console.log(profilePicture);
    if (!profilePicture || !profilePicture.buffer) {
      throw new Error("Envie uma foto de perfil");
    }
    return profilePicture;
  }
}
