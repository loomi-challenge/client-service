import { IUseCase } from "../IUsecase";
import { inject, injectable } from "tsyringe";
import { IUserGateway } from "@/domain/gateways/user.gateway";

export type CheckUserBalanceInput = {
  userId: string;
  amount: number;
};

export type CheckUserBalanceOutput = {
  hasSufficientBalance: boolean;
  currentBalance: number;
  requiredAmount: number;
  userId: string;
  userExists: boolean;
  errorMessage: string | null;
};

@injectable()
export class CheckUserBalanceUsecase
  implements IUseCase<CheckUserBalanceInput, CheckUserBalanceOutput>
{
  constructor(
    @inject("UserGateway")
    private readonly userGateway: IUserGateway
  ) {}

  async execute(input: CheckUserBalanceInput): Promise<CheckUserBalanceOutput> {
    try {
      const user = await this.userGateway.findUserById(input.userId);
      
      if (!user) {
        return {
          hasSufficientBalance: false,
          currentBalance: 0,
          requiredAmount: input.amount,
          userId: input.userId,
          userExists: false,
          errorMessage: "Usuário não encontrado",
        };
      }

      const currentBalance = user.bankingDetails?.balance || 0;
      const hasSufficientBalance = currentBalance >= input.amount;

      return {
        hasSufficientBalance,
        currentBalance,
        requiredAmount: input.amount,
        userId: input.userId,
        userExists: true,
        errorMessage: null,
      };
    } catch (error) {
      return {
        hasSufficientBalance: false,
        currentBalance: 0,
        requiredAmount: input.amount,
        userId: input.userId,
        userExists: false,
        errorMessage: `Erro ao buscar usuário: ${(error as Error).message}`,
      };
    }
  }
}
