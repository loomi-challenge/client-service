import { IUserGateway } from "@/domain/gateways/user.gateway";
import { User } from "@/domain/entities/User";
import { inject, injectable } from "tsyringe";

type UserObject = {
  id: string;
  name: string;
  email: string;
  address?: string;
  profilePicture?: string;
  bankingDetails?: { agency: string; accountNumber: string; balance?: number };
  createdAt: Date;
  updatedAt: Date;
};

@injectable()
export class ListUsersUsecase {
  constructor(
    @inject("UserGateway")
    private readonly userGateway: IUserGateway
  ) {}

  async execute(limit: number): Promise<UserObject[]> {
    const users = await this.userGateway.listAllUsers(limit);

    return users.map(
      (user) =>
        new User({
          id: user.id,
          name: user.name,
          email: user.email,
          address: user.address || undefined,
          profilePicture: user.profilePicture || undefined,
        }).toObject()
    );
  }
}
