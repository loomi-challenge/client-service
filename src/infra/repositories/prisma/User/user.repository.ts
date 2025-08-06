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

    if (!user) {
      return null;
    }

    return new User({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address || undefined,
      profilePicture: user.profilePicture || undefined,
    });
  }

  async updateUserPartial(id: string, updates: Partial<IUser>): Promise<User> {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name: updates.name,
        email: updates.email,
        address: updates.address,
        profilePicture: updates.profilePicture,
      },
    });

    return new User({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address || undefined,
      profilePicture: user.profilePicture || undefined,
    });
  }

  async updateUserProfilePicture(
    id: string,
    profilePicture: string
  ): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: { profilePicture },
    });

    return new User({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address || undefined,
      profilePicture: user.profilePicture || undefined,
    });
  }

  async updateUserBankingBalance({
    id,
    amount,
    type,
  }: {
    id: string;
    amount: number;
    type: "in" | "out";
  }): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { bankingDetailsId: true },
    });

    if (!user?.bankingDetailsId) {
      throw new Error("User has no banking details");
    }

    await prisma.bankingDetails.update({
      where: { id: user.bankingDetailsId },
      data: {
        balance: {
          [type]: amount,
        },
      },
    });
  }
}
