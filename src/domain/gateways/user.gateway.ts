import { User } from "../entities/User";
import { IUser } from "../entities/User/interfaces/user.interface";

export interface IUserGateway {
  findUserById(id: string): Promise<User | null>;
  updateUserPartial(id: string, updates: Partial<IUser>): Promise<User>;
  updateUserProfilePicture(id: string, profilePicture: string): Promise<User>;
}
