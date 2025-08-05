import { User } from "@/domain/entities/User";
import { IUser } from "@/domain/entities/User/interfaces/user.interface";
import { IUserGateway } from "@/domain/gateways/user.gateway";
import { prisma } from "@/package/prisma";

export class UserRepository implements IUserGateway {
  async findUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }

  async updateUserPartial(id: string, updates: Partial<IUser>): Promise<User> {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: updates,
    });
    return user;
  }

  async updateUserProfilePicture(
    id: string,
    profilePicture: string
  ): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: { profilePicture },
    });
    return user;
  }
}
