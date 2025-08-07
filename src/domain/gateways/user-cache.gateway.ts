import { User } from "../entities/User";
import { IUser } from "../entities/User/interfaces/user.interface";

export interface IUserCacheRepository {
  getUserFromCache(userId: string): Promise<User | null>;
  saveUserToCache(userId: string, user: IUser): Promise<void>;
  invalidateUserCache(userId: string): Promise<void>;
}
