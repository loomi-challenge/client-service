import { IUser } from "@/domain/entities/User/interfaces/user.interface";
import { IUserCacheRepository } from "@/domain/gateways/user-cache.gateway";
import { User } from "@/domain/entities/User";
import redis from "@/infra/redis/redis-client";
import { injectable } from "tsyringe";

@injectable()
export class UserCacheRepository implements IUserCacheRepository {
  private readonly CACHE_KEY_PREFIX = "user:";
  private readonly ttl = 60 * 5; 

  async getUserFromCache(userId: string): Promise<User | null> {
    console.log(`🔍 Buscando usuário no cache: ${userId}`);
    const user = await redis.get(`user:${userId}`);
    if (!user) {
      console.log(`❌ Usuário ${userId} não encontrado no cache`);
      return null;
    }
    console.log(`✅ Usuário ${userId} encontrado no cache`);
    return JSON.parse(user);
  }

  async saveUserToCache(userId: string, user: IUser): Promise<void> {
    console.log(`💾 Salvando usuário ${userId} no cache (TTL: ${this.ttl}s)`);
    await redis.set(`${this.CACHE_KEY_PREFIX}${userId}`, JSON.stringify(user), "EX", this.ttl);
    console.log(`✅ Usuário ${userId} salvo no cache com sucesso`);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    console.log(`🗑️ Invalidando cache do usuário: ${userId}`);
    await redis.del(`${this.CACHE_KEY_PREFIX}${userId}`);
    console.log(`✅ Cache do usuário ${userId} invalidado com sucesso`);
  }
}
