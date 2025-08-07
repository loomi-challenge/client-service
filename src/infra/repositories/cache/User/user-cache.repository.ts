import { IUser } from "@/domain/entities/User/interfaces/user.interface";
import { IUserCacheRepository } from "@/domain/gateways/user-cache.gateway";
import { User } from "@/domain/entities/User";
import redis from "@/infra/redis/redis-client";

export class UserCacheRepository implements IUserCacheRepository {
  private readonly CACHE_KEY_PREFIX = "user:";
  private readonly ttl = 60 * 5; 

  async getUserFromCache(userId: string): Promise<User | null> {
    const user = await redis.get(`user:${userId}`);
    if (!user) return null;
    return JSON.parse(user);
  }

  async saveUserToCache(userId: string, user: IUser): Promise<void> {
    await redis.set(`${this.CACHE_KEY_PREFIX}${userId}`, JSON.stringify(user), "EX", this.ttl);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await redis.del(`${this.CACHE_KEY_PREFIX}${userId}`);
  }
}
