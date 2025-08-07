import { IUserGateway } from "@/domain/gateways/user.gateway";
import { IUseCase } from "../IUsecase";
import { User } from "@/domain/entities/User";
import { inject, injectable } from "tsyringe";

@injectable()
export class FindUserUsecase implements IUseCase<string, User | null> {
  constructor(
    @inject("UserGateway") private readonly userGateway: IUserGateway
  ) {}

  async execute(id: string) {
    const user = await this.userGateway.findUserById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}
