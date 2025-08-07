import { UpdateUserUsecase } from "@/application/usecases/User/update-user.usecase";
import { IController, ControllerInput, ControllerOutput } from "../IController";
import { IUser } from "@/domain/entities/User/interfaces/user.interface";
import { inject, injectable } from "tsyringe";

type UpdateUserParams = {
  id: string;
};

type UpdateUserBody =  Partial<IUser>;

type UpdateUserControllerInput = ControllerInput<
  UpdateUserParams,
  any,
  UpdateUserBody
> & {
  params: UpdateUserParams;
  body: UpdateUserBody;
};

@injectable()
export class UpdateUserController
  implements IController<UpdateUserControllerInput, ControllerOutput>
{
  constructor(
    @inject("UpdateUserUsecase")
    private readonly updateUserUsecase: UpdateUserUsecase
  ) {}

  async handle(input: UpdateUserControllerInput): Promise<ControllerOutput> {
    const { id } = input.params;
    const updates = input.body;
    await this.updateUserUsecase.execute({ id, updates });

    return {
      statusCode: 200,
      message: "Usuário atualizado com sucesso",
      data: undefined,
    };
  }
}
