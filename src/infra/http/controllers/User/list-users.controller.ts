import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { ListUsersUsecase } from "@/application/usecases/User/list-users.usecase";
import { ControllerInput, ControllerOutput, IController } from "../IController";

type ListUsersControllerQuery = {
  limit: number;
};

type ListUsersControllerInput = ControllerInput<
  any,
  ListUsersControllerQuery
> & {
  headers: {
    "x-user-id": string;
  };
};

@injectable()
export class ListUsersController
  implements IController<ListUsersControllerInput, ControllerOutput>
{
  constructor(
    @inject("ListUsersUsecase")
    private readonly listUsersUsecase: ListUsersUsecase
  ) {}

  async handle(input: ListUsersControllerInput): Promise<ControllerOutput> {
    const { limit } = input.query as ListUsersControllerQuery;
    const users = await this.listUsersUsecase.execute(Number(limit));

    return {
      statusCode: 200,
      message: "Usuários listados com sucesso",
      data: users,
    };
  }
}
