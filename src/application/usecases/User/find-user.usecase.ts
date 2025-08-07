import { IUserGateway } from "@/domain/gateways/user.gateway";
import { IUseCase } from "../IUsecase";
import { User } from "@/domain/entities/User";
import { inject, injectable } from "tsyringe";
import { IUserCacheRepository } from "@/domain/gateways/user-cache.gateway";

@injectable()
export class FindUserUsecase implements IUseCase<string, User | null> {
  constructor(
    @inject("UserGateway") private readonly userGateway: IUserGateway,
    @inject("UserCacheRepository")
    private readonly userCacheRepository: IUserCacheRepository
  ) {}

  async execute(id: string): Promise<User | null> {
    const cachedUser = await this.userCacheRepository.getUserFromCache(id);
    if (cachedUser) return cachedUser;

    const user = await this.userGateway.findUserById(id);
    if (!user) throw new Error("User not found");

    await this.userCacheRepository.saveUserToCache(id, user);

    return user;
  }
}
