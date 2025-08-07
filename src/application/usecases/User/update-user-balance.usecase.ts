import { IUserGateway } from "@/domain/gateways/user.gateway";
import { IUseCase } from "../IUsecase";
import { IUserCacheRepository } from "@/domain/gateways/user-cache.gateway";

export type UpdateUserBalanceInput = {
  id: string;
  amount: number;
  type: "in" | "out";
};

export class UpdateUserBalanceUsecase
  implements IUseCase<UpdateUserBalanceInput, void>
{
  constructor(
    private readonly userGateway: IUserGateway,
    private readonly userCacheRepository: IUserCacheRepository
  ) {}

  async execute(input: UpdateUserBalanceInput) {
    await this.userGateway.updateUserBankingBalance(input);
    await this.userCacheRepository.invalidateUserCache(input.id);
  }
}
