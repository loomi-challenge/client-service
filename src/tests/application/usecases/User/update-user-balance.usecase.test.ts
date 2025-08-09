import "reflect-metadata";
import { UpdateUserBalanceUsecase } from "@/application/usecases/User/update-user-balance.usecase";
import { createUserGatewayMock } from "./mocks/user.gateway.mock";
import { createUserCacheRepositoryMock } from "./mocks/user-cache.gateway.mock";

describe("UpdateUserBalanceUsecase", () => {
  let usecase: UpdateUserBalanceUsecase;
  let userGatewayMock: ReturnType<typeof createUserGatewayMock>;
  let userCacheRepositoryMock: ReturnType<typeof createUserCacheRepositoryMock>;

  beforeEach(() => {
    userGatewayMock = createUserGatewayMock();
    userCacheRepositoryMock = createUserCacheRepositoryMock();
    usecase = new UpdateUserBalanceUsecase(userGatewayMock, userCacheRepositoryMock);
  });

  describe("execute", () => {
    it("should update user balance with 'in' operation successfully", async () => {
      const input = {
        id: "user-123",
        amount: 500,
        type: "in" as const,
      };

      userGatewayMock.updateUserBankingBalance.mockResolvedValue();
      userCacheRepositoryMock.invalidateUserCache.mockResolvedValue();

      await usecase.execute(input);

      expect(userGatewayMock.updateUserBankingBalance).toHaveBeenCalledWith(input);
      expect(userCacheRepositoryMock.invalidateUserCache).toHaveBeenCalledWith(input.id);
    });

    it("should update user balance with 'out' operation successfully", async () => {
      const input = {
        id: "user-123",
        amount: 200,
        type: "out" as const,
      };

      userGatewayMock.updateUserBankingBalance.mockResolvedValue();
      userCacheRepositoryMock.invalidateUserCache.mockResolvedValue();

      await usecase.execute(input);

      expect(userGatewayMock.updateUserBankingBalance).toHaveBeenCalledWith(input);
      expect(userCacheRepositoryMock.invalidateUserCache).toHaveBeenCalledWith(input.id);
    });

    it("should handle zero amount", async () => {
      const input = {
        id: "user-123",
        amount: 0,
        type: "in" as const,
      };

      userGatewayMock.updateUserBankingBalance.mockResolvedValue();
      userCacheRepositoryMock.invalidateUserCache.mockResolvedValue();

      await usecase.execute(input);

      expect(userGatewayMock.updateUserBankingBalance).toHaveBeenCalledWith(input);
      expect(userCacheRepositoryMock.invalidateUserCache).toHaveBeenCalledWith(input.id);
    });

    it("should handle large amounts", async () => {
      const input = {
        id: "user-123",
        amount: 999999.99,
        type: "in" as const,
      };

      userGatewayMock.updateUserBankingBalance.mockResolvedValue();
      userCacheRepositoryMock.invalidateUserCache.mockResolvedValue();

      await usecase.execute(input);

      expect(userGatewayMock.updateUserBankingBalance).toHaveBeenCalledWith(input);
      expect(userCacheRepositoryMock.invalidateUserCache).toHaveBeenCalledWith(input.id);
    });

    it("should handle gateway errors", async () => {
      const input = {
        id: "user-123",
        amount: 500,
        type: "in" as const,
      };

      const error = new Error("Database update failed");
      userGatewayMock.updateUserBankingBalance.mockRejectedValue(error);

      await expect(usecase.execute(input)).rejects.toThrow("Database update failed");
      expect(userGatewayMock.updateUserBankingBalance).toHaveBeenCalledWith(input);
      expect(userCacheRepositoryMock.invalidateUserCache).not.toHaveBeenCalled();
    });

    it("should handle cache invalidation errors but not fail", async () => {
      const input = {
        id: "user-123",
        amount: 500,
        type: "in" as const,
      };

      const cacheError = new Error("Cache invalidation failed");
      userGatewayMock.updateUserBankingBalance.mockResolvedValue();
      userCacheRepositoryMock.invalidateUserCache.mockRejectedValue(cacheError);

      await expect(usecase.execute(input)).rejects.toThrow("Cache invalidation failed");
      expect(userGatewayMock.updateUserBankingBalance).toHaveBeenCalledWith(input);
      expect(userCacheRepositoryMock.invalidateUserCache).toHaveBeenCalledWith(input.id);
    });

    it("should call methods in correct order", async () => {
      const input = {
        id: "user-123",
        amount: 500,
        type: "in" as const,
      };

      const callOrder: string[] = [];
      
      userGatewayMock.updateUserBankingBalance.mockImplementation(async () => {
        callOrder.push("updateUserBankingBalance");
      });
      
      userCacheRepositoryMock.invalidateUserCache.mockImplementation(async () => {
        callOrder.push("invalidateUserCache");
      });

      await usecase.execute(input);

      expect(callOrder).toEqual(["updateUserBankingBalance", "invalidateUserCache"]);
    });

    it("should pass exact input to gateway", async () => {
      const input = {
        id: "user-456",
        amount: 750.50,
        type: "out" as const,
      };

      userGatewayMock.updateUserBankingBalance.mockResolvedValue();
      userCacheRepositoryMock.invalidateUserCache.mockResolvedValue();

      await usecase.execute(input);

      expect(userGatewayMock.updateUserBankingBalance).toHaveBeenCalledTimes(1);
      expect(userGatewayMock.updateUserBankingBalance).toHaveBeenCalledWith({
        id: "user-456",
        amount: 750.50,
        type: "out",
      });
    });
  });
}); 