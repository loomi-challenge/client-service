import {
  CreateTranferUseCaseOutPutDto,
  CreateUserUseCase,
  CreateUserUseCaseInputDto,
} from "@/application/usecases/Auth/create-user.usecase";
import { ControllerInput, ControllerOutput, IController } from "../IController";

type CreateUserBody = CreateUserUseCaseInputDto;

type CreateUserControllerInput = ControllerInput<any, any, CreateUserBody> & {
  body: CreateUserBody;
};

export class CreateUserController
  implements IController<CreateUserControllerInput, ControllerOutput>
{
  constructor(private createUseCase: CreateUserUseCase) {}

  async handle(input: CreateUserControllerInput): Promise<ControllerOutput> {
    const data = await this.createUseCase.execute(input.body);

    return {
      statusCode: 200,
      message: "Usuário criado com sucesso",
      data: data,
    };
  }
}
