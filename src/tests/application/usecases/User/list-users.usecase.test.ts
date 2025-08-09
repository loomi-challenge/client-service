import "reflect-metadata";
import { ListUsersUsecase } from "@/application/usecases/User/list-users.usecase";
import { createUserGatewayMock, createMockUserEntity } from "./mocks/user.gateway.mock";

describe("ListUsersUsecase", () => {
  let usecase: ListUsersUsecase;
  let userGatewayMock: ReturnType<typeof createUserGatewayMock>;

  beforeEach(() => {
    userGatewayMock = createUserGatewayMock();
    usecase = new ListUsersUsecase(userGatewayMock);
  });

  describe("execute", () => {
    it("should list users successfully", async () => {
      const limit = 10;
      const mockUsers = [
        createMockUserEntity({ id: "user-1", name: "João Silva" }),
        createMockUserEntity({ id: "user-2", name: "Maria Santos" }),
      ];

      userGatewayMock.listAllUsers.mockResolvedValue(mockUsers);

      const result = await usecase.execute(limit);

      expect(userGatewayMock.listAllUsers).toHaveBeenCalledWith(limit);
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: "user-1",
        name: "João Silva",
        email: "joao@email.com",
      });
      expect(result[1]).toMatchObject({
        id: "user-2",
        name: "Maria Santos",
        email: "joao@email.com",
      });
    });

    it("should return empty array when no users found", async () => {
      const limit = 10;
      userGatewayMock.listAllUsers.mockResolvedValue([]);

      const result = await usecase.execute(limit);

      expect(userGatewayMock.listAllUsers).toHaveBeenCalledWith(limit);
      expect(result).toEqual([]);
    });

    it("should handle gateway errors", async () => {
      const limit = 10;
      const error = new Error("Database connection failed");
      userGatewayMock.listAllUsers.mockRejectedValue(error);

      await expect(usecase.execute(limit)).rejects.toThrow("Database connection failed");
      expect(userGatewayMock.listAllUsers).toHaveBeenCalledWith(limit);
    });

    it("should respect the limit parameter", async () => {
      const limit = 5;
      const mockUsers = Array.from({ length: 3 }, (_, i) =>
        createMockUserEntity({ id: `user-${i + 1}`, name: `User ${i + 1}` })
      );

      userGatewayMock.listAllUsers.mockResolvedValue(mockUsers);

      const result = await usecase.execute(limit);

      expect(userGatewayMock.listAllUsers).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(3);
    });
  });
}); 