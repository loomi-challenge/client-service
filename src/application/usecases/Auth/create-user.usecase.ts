import { IUseCase } from "../IUsecase";
import { IAuthProvider } from "@/application/interfaces/auth-provider";
import { User } from "@/domain/entities/User";
import { IUserGateway } from "@/domain/gateways/user.gateway";
import { inject, injectable } from "tsyringe";
import { AppError } from "@/domain/errors/app-error";

export interface CreateUserUseCaseInputDto {
  email: string;
  password: string;
  name: string;
  address: string;
  profilePicture: string;
  bankingDetails: {
    agency: string;
    accountNumber: string;
  };
}

export interface CreateTranferUseCaseOutPutDto {
  data: any;
  message: string;
  status: number;
}

@injectable()
export class CreateUserUseCase
  implements IUseCase<CreateUserUseCaseInputDto, CreateTranferUseCaseOutPutDto>
{
  constructor(
    @inject("AuthProvider") private authProvider: IAuthProvider,
    @inject("UserGateway") private userRepository: IUserGateway
  ) {}

  public async execute(
    input: CreateUserUseCaseInputDto
  ): Promise<CreateTranferUseCaseOutPutDto> {
    await this.verifyUserExists(input.email);
    await this.verifyUserPassword(input.password);

    const response = await this.authProvider.signUp(
      input.email,
      input.password
    );

    if (response["$metadata"].httpStatusCode === 200) {
      const user = new User({
        id: response.UserSub,
        email: input.email,
        name: input.name,
        address: input.address,
        profilePicture: input.profilePicture,
        bankingDetails: input.bankingDetails,
      });

      await this.userRepository.create(user);
    }

    return {
      data: response,
      message: "Usuário criado com sucesso!",
      status: 200,
    };
  }

  private async verifyUserExists(email: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (user) {
      throw new AppError("Usuário já cadastrado!", 409);
    }
  }

  private async verifyUserPassword(password: string) {
    if (password.length < 8) {
      throw new AppError("A senha deve ter pelo menos 8 caracteres!", 400);
    }

    if (!password.match(/[A-Z]/)) {
      throw new AppError("A senha deve conter pelo menos uma letra maiúscula!", 400);
    }

    if (!password.match(/[a-z]/)) {
      throw new AppError("A senha deve conter pelo menos uma letra minúscula!", 400);
    }

    if (!password.match(/[0-9]/)) {
      throw new AppError("A senha deve conter pelo menos um número!", 400);
    }

    if (!password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)) {
      throw new AppError("A senha deve conter pelo menos um caractere especial!", 400);
    }
  }
}
