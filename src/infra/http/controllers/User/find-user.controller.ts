import { FindUserUsecase } from "@/application/usecases/User/find-user.usecase";
import { IController, ControllerInput, ControllerOutput } from "../IController";
import { User } from "@/domain/entities/User";
import { inject, injectable } from "tsyringe";

type FindUserParams = {
  id: string;
};

type FindUserControllerInput = ControllerInput<FindUserParams> & {
  params: FindUserParams;
};

@injectable()
export class FindUserController
  implements IController<FindUserControllerInput, ControllerOutput<User>>
{
  constructor(
    @inject("FindUserUsecase") private readonly findUserUsecase: FindUserUsecase
  ) {}

  async handle(
    input: FindUserControllerInput
  ): Promise<ControllerOutput<User>> {
    const user = await this.findUserUsecase.execute(input.params.id);

    return {
      statusCode: 200,
      message: "Usuário encontrado com sucesso",
      data: user,
    };
  }
}
