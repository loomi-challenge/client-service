import { ConfirmUserUseCase } from "@/application/usecases/Auth/confirm-user.usecase";
import { IController, ControllerInput, ControllerOutput } from "../IController";

type ConfirmUserBody = {
  username: string;
  code: string;
};

type ConfirmUserControllerInput = ControllerInput<any, any, ConfirmUserBody> & {
  body: ConfirmUserBody;
};

export class ConfirmUserController
  implements IController<ConfirmUserControllerInput, ControllerOutput>
{
  constructor(private confirmUserUseCase: ConfirmUserUseCase) {}

  async handle(input: ConfirmUserControllerInput): Promise<ControllerOutput> {
    const { username, code } = input.body;
    const data = await this.confirmUserUseCase.execute({ username, code });
    return {
      statusCode: 200,
      message: "Usuário confirmado com sucesso",
      data: data,
    };
  }
}
