import { ResendConfirmationCodeUseCase } from "@/application/usecases/Auth/resend-confirmation-code.usecase";
import { IController, ControllerInput, ControllerOutput } from "../IController";
import { injectable, inject } from "tsyringe";

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
@injectable()
export class ResendConfirmationCodeController
  implements
    IController<ResendConfirmationCodeControllerInput, ControllerOutput>
{
  constructor(
    @inject("ResendConfirmationCodeUseCase")
    private resendConfirmationCodeUseCase: ResendConfirmationCodeUseCase
  ) {}

  async handle(
    @inject("ResendConfirmationCodeUseCase")
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
