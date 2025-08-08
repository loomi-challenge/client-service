import { inject, injectable } from "tsyringe";
import { IController, ControllerInput, ControllerOutput } from "../IController";
import { UpdateUserProfilePictureUsecase } from "@/application/usecases/User/update-user-profile-picture.usecase";


type UpdateUserProfilePictureBody = {
  profilePicture: string;
};

type UpdateUserProfilePictureControllerInput = ControllerInput<
  any,
  UpdateUserProfilePictureBody
> & {
  headers: {
    "x-user-id": string;
  };
  body: UpdateUserProfilePictureBody;
};

@injectable()
export class UpdateUserProfilePictureController
  implements
    IController<UpdateUserProfilePictureControllerInput, ControllerOutput>
{
  constructor(
    @inject("UpdateUserProfilePictureUsecase")
    private readonly updateUserProfilePictureUsecase: UpdateUserProfilePictureUsecase
  ) {}

  async handle(
    input: UpdateUserProfilePictureControllerInput
  ): Promise<ControllerOutput> {
    const id = input.headers["x-user-id"] as string;
    const { profilePicture } = input.body;

    await this.updateUserProfilePictureUsecase.execute({
      id,
      profilePicture,
    });

    return {
      statusCode: 200,
      message: "Foto de perfil atualizada com sucesso",
      data: undefined,
    };
  }
}
