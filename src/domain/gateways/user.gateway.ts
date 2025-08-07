import { User } from "../entities/User";
import { IUser } from "../entities/User/interfaces/user.interface";

export interface IUserGateway {
  create(user: User): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  updateUserPartial(id: string, updates: Partial<IUser>): Promise<User>;
  updateUserProfilePicture(id: string, profilePicture: string): Promise<User>;
  updateUserBankingBalance({
    id,
    amount,
    type,
  }: {
    id: string;
    amount: number;
    type: "in" | "out";
  }): Promise<void>;
}
