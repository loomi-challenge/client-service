import "reflect-metadata";
import { UpdateUserUsecase } from "@/application/usecases/User/update-user.usecase";
import { AppError } from "@/domain/errors/app-error";
import { createUserGatewayMock, createMockUserEntity } from "./mocks/user.gateway.mock";
import { createUserCacheRepositoryMock } from "./mocks/user-cache.gateway.mock";

describe("UpdateUserUsecase", () => {
  let usecase: UpdateUserUsecase;
  let userGatewayMock: ReturnType<typeof createUserGatewayMock>;
  let userCacheRepositoryMock: ReturnType<typeof createUserCacheRepositoryMock>;

  beforeEach(() => {
    userGatewayMock = createUserGatewayMock();
    userCacheRepositoryMock = createUserCacheRepositoryMock();
    usecase = new UpdateUserUsecase(userGatewayMock, userCacheRepositoryMock);
  });

  describe("execute", () => {
    it("should update user successfully", async () => {
      const input = {
        id: "user-123",
        updates: {
          name: "João Silva Updated",
          address: "Nova Rua, 456",
        },
      };
      
      const existingUser = createMockUserEntity();
      const updatedUser = createMockUserEntity({
        name: "João Silva Updated",
        address: "Nova Rua, 456",
      });

      userGatewayMock.findUserById.mockResolvedValue(existingUser);
      userGatewayMock.updateUserPartial.mockResolvedValue(updatedUser);

      const result = await usecase.execute(input);

      expect(userGatewayMock.findUserById).toHaveBeenCalledWith(input.id);
      expect(userGatewayMock.updateUserPartial).toHaveBeenCalledWith(input.id, input.updates);
      expect(userCacheRepositoryMock.invalidateUserCache).toHaveBeenCalledWith(input.id);
      expect(result).toBe(updatedUser);
    });

    it("should throw AppError when user not found", async () => {
      const input = {
        id: "non-existent-user",
        updates: { name: "New Name" },
      };

      userGatewayMock.findUserById.mockResolvedValue(null);

      await expect(usecase.execute(input)).rejects.toThrow(AppError);
      await expect(usecase.execute(input)).rejects.toThrow("Usuário não encontrado");
      
      expect(userGatewayMock.findUserById).toHaveBeenCalledWith(input.id);
      expect(userGatewayMock.updateUserPartial).not.toHaveBeenCalled();
      expect(userCacheRepositoryMock.invalidateUserCache).not.toHaveBeenCalled();
    });

    it("should validate invalid name", async () => {
      const input = {
        id: "user-123",
        updates: { name: 123 as any },
      };

      const existingUser = createMockUserEntity();
      userGatewayMock.findUserById.mockResolvedValue(existingUser);

      await expect(usecase.execute(input)).rejects.toThrow(AppError);
      await expect(usecase.execute(input)).rejects.toThrow("Nome inválido");
    });

    it("should validate invalid email", async () => {
      const input = {
        id: "user-123",
        updates: { email: "invalid-email" },
      };

      const existingUser = createMockUserEntity();
      userGatewayMock.findUserById.mockResolvedValue(existingUser);

      await expect(usecase.execute(input)).rejects.toThrow(AppError);
      await expect(usecase.execute(input)).rejects.toThrow("Email inválido");
    });

    it("should validate email with no @ symbol", async () => {
      const input = {
        id: "user-123",
        updates: { email: "emailgmail.com" },
      };

      const existingUser = createMockUserEntity();
      userGatewayMock.findUserById.mockResolvedValue(existingUser);

      await expect(usecase.execute(input)).rejects.toThrow(AppError);
      await expect(usecase.execute(input)).rejects.toThrow("Email inválido");
    });

    it("should validate invalid address", async () => {
      const input = {
        id: "user-123",
        updates: { address: 123 as any },
      };

      const existingUser = createMockUserEntity();
      userGatewayMock.findUserById.mockResolvedValue(existingUser);

      await expect(usecase.execute(input)).rejects.toThrow(AppError);
      await expect(usecase.execute(input)).rejects.toThrow("Endereço inválido");
    });

    it("should validate invalid profile picture", async () => {
      const input = {
        id: "user-123",
        updates: { profilePicture: 123 as any },
      };

      const existingUser = createMockUserEntity();
      userGatewayMock.findUserById.mockResolvedValue(existingUser);

      await expect(usecase.execute(input)).rejects.toThrow(AppError);
      await expect(usecase.execute(input)).rejects.toThrow("Foto de perfil inválida");
    });

    it("should validate invalid banking details object", async () => {
      const input = {
        id: "user-123",
        updates: { bankingDetails: "invalid" as any },
      };

      const existingUser = createMockUserEntity();
      userGatewayMock.findUserById.mockResolvedValue(existingUser);

      await expect(usecase.execute(input)).rejects.toThrow(AppError);
      await expect(usecase.execute(input)).rejects.toThrow("Dados bancários inválidos");
    });

    it("should validate invalid agency in banking details", async () => {
      const input = {
        id: "user-123",
        updates: {
          bankingDetails: { agency: 123 as any, accountNumber: "567890" },
        },
      };

      const existingUser = createMockUserEntity();
      userGatewayMock.findUserById.mockResolvedValue(existingUser);

      await expect(usecase.execute(input)).rejects.toThrow(AppError);
      await expect(usecase.execute(input)).rejects.toThrow("Agência dos dados bancários inválida");
    });

    it("should validate invalid account number in banking details", async () => {
      const input = {
        id: "user-123",
        updates: {
          bankingDetails: { agency: "1234", accountNumber: 123 as any },
        },
      };

      const existingUser = createMockUserEntity();
      userGatewayMock.findUserById.mockResolvedValue(existingUser);

      await expect(usecase.execute(input)).rejects.toThrow(AppError);
      await expect(usecase.execute(input)).rejects.toThrow("Número da conta dos dados bancários inválido");
    });

    it("should not allow balance updates", async () => {
      const input = {
        id: "user-123",
        updates: {
          bankingDetails: { agency: "1234", accountNumber: "567890", balance: 2000 },
        },
      };

      const existingUser = createMockUserEntity();
      userGatewayMock.findUserById.mockResolvedValue(existingUser);

      await expect(usecase.execute(input)).rejects.toThrow(AppError);
      await expect(usecase.execute(input)).rejects.toThrow("Você não pode atualizar o saldo do usuário!");
    });

    it("should accept valid email with @", async () => {
      const input = {
        id: "user-123",
        updates: { email: "newemail@example.com" },
      };

      const existingUser = createMockUserEntity();
      const updatedUser = createMockUserEntity({ email: "newemail@example.com" });

      userGatewayMock.findUserById.mockResolvedValue(existingUser);
      userGatewayMock.updateUserPartial.mockResolvedValue(updatedUser);

      const result = await usecase.execute(input);

      expect(userGatewayMock.updateUserPartial).toHaveBeenCalledWith(input.id, input.updates);
      expect(result).toBe(updatedUser);
    });

    it("should accept valid banking details without balance", async () => {
      const input = {
        id: "user-123",
        updates: {
          bankingDetails: { agency: "5678", accountNumber: "123456" },
        },
      };

      const existingUser = createMockUserEntity();
      const updatedUser = createMockUserEntity();

      userGatewayMock.findUserById.mockResolvedValue(existingUser);
      userGatewayMock.updateUserPartial.mockResolvedValue(updatedUser);

      const result = await usecase.execute(input);

      expect(userGatewayMock.updateUserPartial).toHaveBeenCalledWith(input.id, input.updates);
      expect(result).toBe(updatedUser);
    });

    it("should handle gateway update errors", async () => {
      const input = {
        id: "user-123",
        updates: { name: "New Name" },
      };

      const existingUser = createMockUserEntity();
      const error = new Error("Update failed");

      userGatewayMock.findUserById.mockResolvedValue(existingUser);
      userGatewayMock.updateUserPartial.mockRejectedValue(error);

      await expect(usecase.execute(input)).rejects.toThrow("Update failed");
      expect(userGatewayMock.updateUserPartial).toHaveBeenCalledWith(input.id, input.updates);
    });
  });
}); 