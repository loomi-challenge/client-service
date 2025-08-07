import { AuthUserUseCase } from "@/application/usecases/Auth/auth-user.usecase";
import { ControllerInput, ControllerOutput, IController } from "../IController";

type AuthUserBody = {
  email: string;
  password: string;
};

type AuthUserControllerInputDto = ControllerInput<any, any, AuthUserBody> & {
  body: AuthUserBody;
};

export class AuthUserController
  implements IController<AuthUserControllerInputDto, ControllerOutput>
{
  constructor(private authUserUseCase: AuthUserUseCase) {}

  async handle(input: AuthUserControllerInputDto): Promise<ControllerOutput> {
    const { email, password } = input.body;
    const data = await this.authUserUseCase.execute({
      username: email,
      password,
    });

    return {
      statusCode: 200,
      message: "Usuário autenticado com sucesso",
      data: data,
    };
  }
}
