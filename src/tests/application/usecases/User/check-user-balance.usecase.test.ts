import "reflect-metadata";
import { CheckUserBalanceUsecase } from "@/application/usecases/User/check-user-balance.usecase";
import { createUserGatewayMock, createMockUserEntity } from "./mocks/user.gateway.mock";

describe("CheckUserBalanceUsecase", () => {
  let usecase: CheckUserBalanceUsecase;
  let userGatewayMock: ReturnType<typeof createUserGatewayMock>;

  beforeEach(() => {
    userGatewayMock = createUserGatewayMock();
    usecase = new CheckUserBalanceUsecase(userGatewayMock);
  });

  describe("execute", () => {
    it("should return success when user has sufficient balance", async () => {
      const input = { userId: "user-123", amount: 500 };
      const mockUserEntity = createMockUserEntity({
        bankingDetails: { agency: "1234", accountNumber: "567890", balance: 1000 }
      });
      
      userGatewayMock.findUserById.mockResolvedValue(mockUserEntity);

      const result = await usecase.execute(input);

      expect(userGatewayMock.findUserById).toHaveBeenCalledWith(input.userId);
      expect(result).toEqual({
        hasSufficientBalance: true,
        currentBalance: 1000,
        requiredAmount: 500,
        userId: "user-123",
        userExists: true,
        errorMessage: null,
      });
    });

    it("should return failure when user has insufficient balance", async () => {
      const input = { userId: "user-123", amount: 1500 };
      const mockUserEntity = createMockUserEntity({
        bankingDetails: { agency: "1234", accountNumber: "567890", balance: 1000 }
      });
      
      userGatewayMock.findUserById.mockResolvedValue(mockUserEntity);

      const result = await usecase.execute(input);

      expect(userGatewayMock.findUserById).toHaveBeenCalledWith(input.userId);
      expect(result).toEqual({
        hasSufficientBalance: false,
        currentBalance: 1000,
        requiredAmount: 1500,
        userId: "user-123",
        userExists: true,
        errorMessage: null,
      });
    });

    it("should return error when user does not exist", async () => {
      const input = { userId: "non-existent-user", amount: 500 };
      
      userGatewayMock.findUserById.mockResolvedValue(null);

      const result = await usecase.execute(input);

      expect(userGatewayMock.findUserById).toHaveBeenCalledWith(input.userId);
      expect(result).toEqual({
        hasSufficientBalance: false,
        currentBalance: 0,
        requiredAmount: 500,
        userId: "non-existent-user",
        userExists: false,
        errorMessage: "Usuário não encontrado",
      });
    });

    it("should handle user without banking details", async () => {
      const input = { userId: "user-123", amount: 100 };
      const mockUserEntity = createMockUserEntity({
        bankingDetails: undefined
      });
      
      userGatewayMock.findUserById.mockResolvedValue(mockUserEntity);

      const result = await usecase.execute(input);

      expect(userGatewayMock.findUserById).toHaveBeenCalledWith(input.userId);
      expect(result).toEqual({
        hasSufficientBalance: false,
        currentBalance: 0,
        requiredAmount: 100,
        userId: "user-123",
        userExists: true,
        errorMessage: null,
      });
    });

    it("should handle user with banking details but no balance", async () => {
      const input = { userId: "user-123", amount: 100 };
      const mockUserEntity = createMockUserEntity({
        bankingDetails: { agency: "1234", accountNumber: "567890" }
      });
      
      userGatewayMock.findUserById.mockResolvedValue(mockUserEntity);

      const result = await usecase.execute(input);

      expect(userGatewayMock.findUserById).toHaveBeenCalledWith(input.userId);
      expect(result).toEqual({
        hasSufficientBalance: false,
        currentBalance: 0,
        requiredAmount: 100,
        userId: "user-123",
        userExists: true,
        errorMessage: null,
      });
    });

    it("should handle exact balance match", async () => {
      const input = { userId: "user-123", amount: 1000 };
      const mockUserEntity = createMockUserEntity({
        bankingDetails: { agency: "1234", accountNumber: "567890", balance: 1000 }
      });
      
      userGatewayMock.findUserById.mockResolvedValue(mockUserEntity);

      const result = await usecase.execute(input);

      expect(result.hasSufficientBalance).toBe(true);
      expect(result.currentBalance).toBe(1000);
      expect(result.requiredAmount).toBe(1000);
    });

    it("should handle gateway errors gracefully", async () => {
      const input = { userId: "user-123", amount: 500 };
      const error = new Error("Database connection failed");
      
      userGatewayMock.findUserById.mockRejectedValue(error);

      const result = await usecase.execute(input);

      expect(userGatewayMock.findUserById).toHaveBeenCalledWith(input.userId);
      expect(result).toEqual({
        hasSufficientBalance: false,
        currentBalance: 0,
        requiredAmount: 500,
        userId: "user-123",
        userExists: false,
        errorMessage: "Erro ao buscar usuário: Database connection failed",
      });
    });

    it("should handle zero amount", async () => {
      const input = { userId: "user-123", amount: 0 };
      const mockUserEntity = createMockUserEntity({
        bankingDetails: { agency: "1234", accountNumber: "567890", balance: 1000 }
      });
      
      userGatewayMock.findUserById.mockResolvedValue(mockUserEntity);

      const result = await usecase.execute(input);

      expect(result.hasSufficientBalance).toBe(true);
      expect(result.currentBalance).toBe(1000);
      expect(result.requiredAmount).toBe(0);
    });
  });
}); 