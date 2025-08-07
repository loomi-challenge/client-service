import { ResendConfirmationCodeUseCase } from "@/application/usecases/Auth/resend-confirmation-code.usecase";
import { IController, ControllerInput, ControllerOutput } from "../IController";

type ResendConfirmationCodeBody = {
  email: string;
};

type ResendConfirmationCodeControllerInput = ControllerInput<
  any,
  any,
  ResendConfirmationCodeBody
> & {
  body: ResendConfirmationCodeBody;
};

export class ResendConfirmationCodeController
  implements
    IController<ResendConfirmationCodeControllerInput, ControllerOutput>
{
  constructor(
    private resendConfirmationCodeUseCase: ResendConfirmationCodeUseCase
  ) {}

  async handle(
    input: ResendConfirmationCodeControllerInput
  ): Promise<ControllerOutput> {
    const { email } = input.body;
    const data = await this.resendConfirmationCodeUseCase.execute({
      username: email,
    });
    return {
      statusCode: 200,
      message: "Código de confirmação reenviado com sucesso",
      data: data,
    };
  }
}
