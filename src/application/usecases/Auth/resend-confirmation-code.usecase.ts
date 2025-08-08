import { IAuthProvider } from "@/domain/providers/auth-provider";
import { IUseCase } from "../IUsecase";
import { inject, injectable } from "tsyringe";

type ResendConfirmationCodeUseCaseInput = {
  username: string;
};

type ResendConfirmationCodeUseCaseOutput = {
  data: any;
  message: string;
  status: number;
};

@injectable()
export class ResendConfirmationCodeUseCase
  implements
    IUseCase<
      ResendConfirmationCodeUseCaseInput,
      ResendConfirmationCodeUseCaseOutput
    >
{
  constructor(
    @inject("AuthProvider") private authProvider: IAuthProvider
  ) {}

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
