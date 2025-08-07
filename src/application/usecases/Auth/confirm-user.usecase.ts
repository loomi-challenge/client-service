import { IAuthProvider } from "@/application/interfaces/auth-provider";
import { IUseCase } from "../IUsecase";

type ConfirmUserUseCaseInput = {
  username: string;
  code: string;
};

type ConfirmUserUseCaseOutput = {
  data: any;
  message: string;
  status: number;
};

export class ConfirmUserUseCase
  implements IUseCase<ConfirmUserUseCaseInput, ConfirmUserUseCaseOutput>
{
  constructor(private authProvider: IAuthProvider) {}

  async execute(
    input: ConfirmUserUseCaseInput
  ): Promise<ConfirmUserUseCaseOutput> {
    const user = await this.authProvider.confirmSignUp(
      input.username,
      input.code
    );

    return {
      data: user,
      message: "Usuário confirmado com sucesso!",
      status: 200,
    };
  }
}
