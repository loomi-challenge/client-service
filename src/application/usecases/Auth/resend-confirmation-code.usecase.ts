import { IAuthProvider } from "@/application/interfaces/auth-provider";
import { IUseCase } from "../IUsecase";

type ResendConfirmationCodeUseCaseInput = {
  username: string;
};

type ResendConfirmationCodeUseCaseOutput = {
  data: any;
  message: string;
  status: number;
};

export class ResendConfirmationCodeUseCase
  implements
    IUseCase<
      ResendConfirmationCodeUseCaseInput,
      ResendConfirmationCodeUseCaseOutput
    >
{
  constructor(private authProvider: IAuthProvider) {}

  async execute(
    input: ResendConfirmationCodeUseCaseInput
  ): Promise<ResendConfirmationCodeUseCaseOutput> {
    const data = await this.authProvider.resendConfirmationCode(input.username);
    return {
      data: data,
      message: "Código de confirmação reenviado com sucesso!",
      status: 200,
    };
  }
}
