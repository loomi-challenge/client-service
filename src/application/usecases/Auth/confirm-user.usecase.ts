import { IAuthProvider } from "@/application/interfaces/auth-provider";
import { IUseCase } from "../IUsecase";
import { inject, injectable } from "tsyringe";

type ConfirmUserUseCaseInput = {
  username: string;
  code: string;
};

type ConfirmUserUseCaseOutput = {
  data: any;
  message: string;
  status: number;
};

@injectable()
export class ConfirmUserUseCase
  implements IUseCase<ConfirmUserUseCaseInput, ConfirmUserUseCaseOutput>
{
  constructor(
    @inject("AuthProvider") private authProvider: IAuthProvider
  ) {}

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
