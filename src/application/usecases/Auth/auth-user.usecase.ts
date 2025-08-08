import { IAuthProvider } from "@/domain/providers/auth-provider";
import { IUseCase } from "../IUsecase";
import { inject, injectable } from "tsyringe";

type AuthUserUseCaseInputDto = {
  username: string;
  password: string;
};
type AuthUserUseCaseOutputDto = {
  data: any;
  message: string;
  status: number;
};

@injectable()
export class AuthUserUseCase
  implements IUseCase<AuthUserUseCaseInputDto, AuthUserUseCaseOutputDto>
{
  constructor(
    @inject("AuthProvider") private authProvider: IAuthProvider
  ) {}

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
