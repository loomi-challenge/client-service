import { IUserGateway } from "@/domain/gateways/user.gateway";
import { IUseCase } from "../IUsecase";

export type UpdateUserBalanceInput = {
  id: string;
  amount: number;
  type: "in" | "out";
};

export class UpdateUserBalanceUsecase
  implements IUseCase<UpdateUserBalanceInput, void>
{
  constructor(private readonly userGateway: IUserGateway) {}

  async execute(input: UpdateUserBalanceInput) {
    await this.userGateway.updateUserBankingBalance(input);
  }
}
