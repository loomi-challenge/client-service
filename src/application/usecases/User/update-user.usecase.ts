import { User } from "@/domain/entities/User";
import { IUseCase } from "../IUsecase";
import { IUserGateway } from "@/domain/gateways/user.gateway";
import { IUser } from "@/domain/entities/User/interfaces/user.interface";

export type UpdateUserInput = {
  id: string;
  updates: Partial<IUser>;
};

export class UpdateUserUsecase implements IUseCase<UpdateUserInput, User> {
  constructor(private readonly userGateway: IUserGateway) {}

  async execute(input: UpdateUserInput) {
    await this.validateUser(input.id);
    await this.validateUpdates(input.updates);
    return this.userGateway.updateUserPartial(input.id, input.updates);
  }

  private async validateUser(id: string) {
    const user = await this.userGateway.findUserById(id);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    return user;
  }

  private validateUpdates(updates: Partial<IUser>) {
    if (updates.name !== undefined && typeof updates.name !== "string") {
      throw new Error("Nome inválido");
    }

    if (updates.email !== undefined) {
      if (typeof updates.email !== "string" || !updates.email.includes("@")) {
        throw new Error("Email inválido");
      }
    }

    if (updates.address !== undefined && typeof updates.address !== "string") {
      throw new Error("Endereço inválido");
    }

    if (
      updates.profilePicture !== undefined &&
      typeof updates.profilePicture !== "string"
    ) {
      throw new Error("Foto de perfil inválida");
    }

    if (updates.bankingDetails !== undefined) {
      const bd = updates.bankingDetails;
      if (typeof bd !== "object" || bd === null) {
        throw new Error("Dados bancários inválidos");
      }
      if ("agency" in bd && typeof bd.agency !== "string") {
        throw new Error("Agência dos dados bancários inválida");
      }
      if ("accountNumber" in bd && typeof bd.accountNumber !== "string") {
        throw new Error("Número da conta dos dados bancários inválido");
      }
      if ("balance" in bd) {
        throw new Error("Você não pode atualizar o saldo do usuário!");
      }
    }
  }
}
