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
      throw new Error("User not found");
    }
    return user;
  }

  private validateUpdates(updates: Partial<IUser>) {
    if (updates.name !== undefined && typeof updates.name !== "string") {
      throw new Error("Invalid name");
    }

    if (updates.email !== undefined) {
      if (typeof updates.email !== "string" || !updates.email.includes("@")) {
        throw new Error("Invalid email");
      }
    }

    if (updates.address !== undefined && typeof updates.address !== "string") {
      throw new Error("Invalid address");
    }

    if (
      updates.profilePicture !== undefined &&
      typeof updates.profilePicture !== "string"
    ) {
      throw new Error("Invalid profilePicture");
    }

    if (updates.bankingDetails !== undefined) {
      const bd = updates.bankingDetails;
      if (typeof bd !== "object" || bd === null) {
        throw new Error("Invalid bankingDetails");
      }
      if ("agency" in bd && typeof bd.agency !== "string") {
        throw new Error("Invalid bankingDetails.agency");
      }
      if ("accountNumber" in bd && typeof bd.accountNumber !== "string") {
        throw new Error("Invalid bankingDetails.accountNumber");
      }
    }
  }
}
