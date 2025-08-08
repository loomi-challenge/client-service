import { IUserGateway } from "@/domain/gateways/user.gateway";
import { IUseCase } from "../IUsecase";
import { User } from "@/domain/entities/User";
import { inject, injectable } from "tsyringe";
import { IUserCacheRepository } from "@/domain/gateways/user-cache.gateway";
import { IUser } from "@/domain/entities/User/interfaces/user.interface";


@injectable()
export class FindUserUsecase implements IUseCase<string, IUser | null> {
  constructor(
    @inject("UserGateway") private readonly userGateway: IUserGateway,
    @inject("UserCacheRepository")
    private readonly userCacheRepository: IUserCacheRepository
  ) {}

  async execute(id: string): Promise<IUser | null> {
    const cachedUser = await this.userCacheRepository.getUserFromCache(id);
    if (cachedUser) {
      
      const normalizedUserData = this.normalizeCachedUser(cachedUser);
      
      const user = new User(normalizedUserData);
      return user.toObject();
    }

    const foundUser = await this.userGateway.findUserById(id);
    if (!foundUser) throw new Error("User not found");

    const user = new User({
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      address: foundUser.address,
      profilePicture: foundUser.profilePicture,
      bankingDetails: foundUser.bankingDetails,
    });

    await this.userCacheRepository.saveUserToCache(id, user.toObject());

    return user.toObject();
  }

  private normalizeCachedUser(cachedUser: any): IUser {
    if (cachedUser._id !== undefined) {
      return {
        id: cachedUser._id,
        name: cachedUser._name,
        email: cachedUser._email,
        address: cachedUser._address,
        profilePicture: cachedUser._profilePicture,
        bankingDetails: cachedUser._bankingDetails,
      };
    }
    
    return {
      id: cachedUser.id,
      name: cachedUser.name,
      email: cachedUser.email,
      address: cachedUser.address,
      profilePicture: cachedUser.profilePicture,
      bankingDetails: cachedUser.bankingDetails,
    };
  }
}
