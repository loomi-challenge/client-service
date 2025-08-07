import { IAuthProvider } from "@/application/interfaces/auth-provider";
import { IUseCase } from "../IUsecase";

type AuthUserUseCaseInputDto = {
  username: string;
  password: string;
};
type AuthUserUseCaseOutputDto = {
  data: any;
  message: string;
  status: number;
};

export class AuthUserUseCase
  implements IUseCase<AuthUserUseCaseInputDto, AuthUserUseCaseOutputDto>
{
  constructor(private authProvider: IAuthProvider) {}

  async execute(
    input: AuthUserUseCaseInputDto
  ): Promise<AuthUserUseCaseOutputDto> {
    const data = await this.authProvider.signIn(input.username, input.password);
    return {
      data: data,
      message: "Usuário autenticado com sucesso!",
      status: 200,
    };
  }
}
