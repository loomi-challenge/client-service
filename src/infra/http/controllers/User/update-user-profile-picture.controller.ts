import { IController, ControllerInput, ControllerOutput } from "../IController";
import { UpdateUserProfilePictureUsecase } from "@/application/usecases/User/update-user-profile-picture.usecase";
import { File } from "@/shared/types/file.types";

type UpdateUserProfilePictureParams = {
  id: string;
};

type UpdateUserProfilePictureBody = {
  profilePicture: File;
};

type UpdateUserProfilePictureControllerInput = ControllerInput<
  UpdateUserProfilePictureParams,
  any,
  UpdateUserProfilePictureBody
> & {
  params: UpdateUserProfilePictureParams;
  body: UpdateUserProfilePictureBody;
};

export class UpdateUserProfilePictureController
  implements
    IController<UpdateUserProfilePictureControllerInput, ControllerOutput>
{
  constructor(
    private readonly updateUserProfilePictureUsecase: UpdateUserProfilePictureUsecase
  ) {}

  async handle(
    input: UpdateUserProfilePictureControllerInput
  ): Promise<ControllerOutput> {
    const { id } = input.params;
    const { profilePicture } = input.body;
    console.log("profilePicture", input);
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
