import { User } from "@/domain/entities/User";
import { IUseCase } from "../IUsecase";
import { IUserGateway } from "@/domain/gateways/user.gateway";
import { IUser } from "@/domain/entities/User/interfaces/user.interface";
import { inject, injectable } from "tsyringe";
import { IUserCacheRepository } from "@/domain/gateways/user-cache.gateway";
import { AppError } from "@/domain/errors/app-error";

export type UpdateUserInput = {
  id: string;
  updates: Partial<IUser>;
};

@injectable()
export class UpdateUserUsecase implements IUseCase<UpdateUserInput, User> {
  constructor(
    @inject("UserGateway") private readonly userGateway: IUserGateway,
    @inject("UserCacheRepository")
    private readonly userCacheRepository: IUserCacheRepository
  ) {}

  async execute(input: UpdateUserInput): Promise<User> {
    await this.validateUser(input.id);
    await this.validateUpdates(input.updates);
    
    const updatedUser = await this.userGateway.updateUserPartial(input.id, input.updates);
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

  private validateUpdates(updates: Partial<IUser>) {
    if (updates.name !== undefined && typeof updates.name !== "string") {
      throw new AppError("Nome inválido", 400);
    }

    if (updates.email !== undefined) {
      if (typeof updates.email !== "string" || !updates.email.includes("@")) {
        throw new AppError("Email inválido", 400);
      }
    }

    if (updates.address !== undefined && typeof updates.address !== "string") {
      throw new AppError("Endereço inválido", 400);
    }

    if (
      updates.profilePicture !== undefined &&
      typeof updates.profilePicture !== "string"
    ) {
      throw new AppError("Foto de perfil inválida", 400);
    }

    if (updates.bankingDetails !== undefined) {
      const bd = updates.bankingDetails;
      if (typeof bd !== "object" || bd === null) {
        throw new AppError("Dados bancários inválidos", 400);
      }
      if ("agency" in bd && typeof bd.agency !== "string") {
        throw new AppError("Agência dos dados bancários inválida", 400);
      }
      if ("accountNumber" in bd && typeof bd.accountNumber !== "string") {
        throw new AppError("Número da conta dos dados bancários inválido", 400);
      }
      if ("balance" in bd) {
        throw new AppError("Você não pode atualizar o saldo do usuário!", 403);
      }
    }
  }
}
