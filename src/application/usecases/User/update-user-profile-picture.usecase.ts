import { User } from "@/domain/entities/User";
import { IUseCase } from "../IUsecase";
import { IUserGateway } from "@/domain/gateways/user.gateway";
import { inject, injectable } from "tsyringe";
import { IUserCacheRepository } from "@/domain/gateways/user-cache.gateway";
import { AppError } from "@/domain/errors/app-error";
import { IStorageProvider } from "@/domain/providers/storage-provider";
import * as fs from "fs";

export type UpdateUserProfilePictureInput = {
  id: string;
  profilePicture: Express.Multer.File;
};
@injectable()
export class UpdateUserProfilePictureUsecase
  implements IUseCase<UpdateUserProfilePictureInput, User>
{
  constructor(
    @inject("UserGateway") private readonly userGateway: IUserGateway,
    @inject("UserCacheRepository")
    private readonly userCacheRepository: IUserCacheRepository,
    @inject("StorageProvider")
    private readonly storageProvider: IStorageProvider
  ) {}

  async execute(input: UpdateUserProfilePictureInput) {
    await this.validateUser(input.id);
    await this.validateProfilePicture(input.profilePicture);
    
    let fileBuffer: Buffer;
    if (input.profilePicture.buffer) {
      fileBuffer = input.profilePicture.buffer;
    } else if (input.profilePicture.path) {
      fileBuffer = fs.readFileSync(input.profilePicture.path);
    } else {
      throw new AppError("Arquivo não encontrado", 400);
    }
    
    const fileExtension = input.profilePicture.originalname.split('.').pop();
    const fileName = `profile-pictures/${input.id}.${fileExtension}`;
    
    const fileUrl = await this.storageProvider.uploadFile(
      fileName,
      fileBuffer,
      input.profilePicture.mimetype
    );

    if (!fileUrl) {
      throw new AppError("Erro ao fazer upload da foto de perfil", 500);
    }
    
    if (input.profilePicture.path && !input.profilePicture.buffer) {
      try {
        fs.unlinkSync(input.profilePicture.path);
      } catch (error) {
        console.warn("⚠️ Não foi possível remover arquivo temporário:", error);
      }
    }
    
    const updatedUser = await this.userGateway.updateUserProfilePicture(
      input.id,
      fileUrl
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

  private async validateProfilePicture(profilePicture: Express.Multer.File) {
    if (!profilePicture) {
      throw new AppError("Foto de perfil é obrigatória", 400);
    }
    return profilePicture;
  }
}
