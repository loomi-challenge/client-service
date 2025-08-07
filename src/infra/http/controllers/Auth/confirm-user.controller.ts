import { ConfirmUserUseCase } from "@/application/usecases/Auth/confirm-user.usecase";
import { IController, ControllerInput, ControllerOutput } from "../IController";
import { inject, injectable } from "tsyringe";

type ConfirmUserBody = {
  email: string;
  code: string;
};

type ConfirmUserControllerInput = ControllerInput<any, any, ConfirmUserBody> & {
  body: ConfirmUserBody;
};

@injectable()
export class ConfirmUserController
  implements IController<ConfirmUserControllerInput, ControllerOutput>
{
  constructor(
    @inject("ConfirmUserUseCase")
    private confirmUserUseCase: ConfirmUserUseCase
  ) {}

  async handle(input: ConfirmUserControllerInput): Promise<ControllerOutput> {
    const { email, code } = input.body;
    const data = await this.confirmUserUseCase.execute({
      username: email,
      code,
    });
    return {
      statusCode: 200,
      message: "Usuário confirmado com sucesso",
      data: data,
    };
  }
}
