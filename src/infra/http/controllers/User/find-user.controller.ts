import { FindUserUsecase } from "@/application/usecases/User/find-user.usecase";
import { IController, ControllerInput, ControllerOutput } from "../IController";
import { inject, injectable } from "tsyringe";



type FindUserControllerInput = ControllerInput<any, any, any> & {
  headers: {
    "x-user-id": string;
  };
};

@injectable()
export class FindUserController
  implements IController<FindUserControllerInput, ControllerOutput>
{
  constructor(
    @inject("FindUserUsecase") private readonly findUserUsecase: FindUserUsecase
  ) {}

  async handle(
    input: FindUserControllerInput
  ): Promise<ControllerOutput> {
    const id = input.headers["x-user-id"] as string;
    const user = await this.findUserUsecase.execute(id);

    return {
      statusCode: 200,
      message: "Usuário encontrado com sucesso",
      data: user,
    };
  }
}
