import { User } from "@/domain/entities/User";
import { IUser } from "@/domain/entities/User/interfaces/user.interface";
import { IUserGateway } from "@/domain/gateways/user.gateway";
import { prisma } from "@/package/prisma";
import { injectable } from "tsyringe";

@injectable()
export class UserRepository implements IUserGateway {
  async findUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        bankingDetails: true,
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
      bankingDetails: user.bankingDetails ? {
        agency: user.bankingDetails.agency,
        accountNumber: user.bankingDetails.account,
        balance: user.bankingDetails.balance,
      } : undefined,
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
      select: { bankingDetails: true },
    });

    if (!user?.bankingDetails) {
      throw new Error("User has no banking details");
    }

    await prisma.bankingDetails.update({
      where: { id: user.bankingDetails.id },
      data: {
        balance: {
          [type === "in" ? "increment" : "decrement"]: amount,
        },
      },
    });
  }

  async create(userData: User): Promise<User> {
    const user = await prisma.user.create({
      data: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        address: userData.address,
        profilePicture: userData.profilePicture,
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

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user ? new User({ id: user.id, name: user.name, email: user.email }) : null;
  }
}
