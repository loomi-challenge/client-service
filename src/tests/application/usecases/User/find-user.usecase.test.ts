import "reflect-metadata";
import { FindUserUsecase } from "@/application/usecases/User/find-user.usecase";
import { AppError } from "@/domain/errors/app-error";
import { createUserGatewayMock, createMockUserEntity, mockUser } from "./mocks/user.gateway.mock";
import { createUserCacheRepositoryMock } from "./mocks/user-cache.gateway.mock";

describe("FindUserUsecase", () => {
  let usecase: FindUserUsecase;
  let userGatewayMock: ReturnType<typeof createUserGatewayMock>;
  let userCacheRepositoryMock: ReturnType<typeof createUserCacheRepositoryMock>;

  beforeEach(() => {
    userGatewayMock = createUserGatewayMock();
    userCacheRepositoryMock = createUserCacheRepositoryMock();
    usecase = new FindUserUsecase(userGatewayMock, userCacheRepositoryMock);
  });

  describe("execute", () => {
    it("should return user from cache when available", async () => {
      const userId = "user-123";
      const cachedUser = mockUser;
      userCacheRepositoryMock.getUserFromCache.mockResolvedValue(createMockUserEntity());

      const result = await usecase.execute(userId);

      expect(userCacheRepositoryMock.getUserFromCache).toHaveBeenCalledWith(userId);
      expect(userGatewayMock.findUserById).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      });
    });

    it("should fetch user from database when not in cache", async () => {
      const userId = "user-123";
      const mockUserEntity = createMockUserEntity();
      
      userCacheRepositoryMock.getUserFromCache.mockResolvedValue(null);
      userGatewayMock.findUserById.mockResolvedValue(mockUserEntity);

      const result = await usecase.execute(userId);

      expect(userCacheRepositoryMock.getUserFromCache).toHaveBeenCalledWith(userId);
      expect(userGatewayMock.findUserById).toHaveBeenCalledWith(userId);
      expect(userCacheRepositoryMock.saveUserToCache).toHaveBeenCalledWith(userId, expect.any(Object));
      expect(result).toMatchObject({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      });
    });

    it("should throw AppError when user not found", async () => {
      const userId = "non-existent-user";
      
      userCacheRepositoryMock.getUserFromCache.mockResolvedValue(null);
      userGatewayMock.findUserById.mockResolvedValue(null);

      await expect(usecase.execute(userId)).rejects.toThrow(AppError);
      await expect(usecase.execute(userId)).rejects.toThrow("Usuário não encontrado");
      
      expect(userCacheRepositoryMock.getUserFromCache).toHaveBeenCalledWith(userId);
      expect(userGatewayMock.findUserById).toHaveBeenCalledWith(userId);
      expect(userCacheRepositoryMock.saveUserToCache).not.toHaveBeenCalled();
    });

    it("should handle gateway errors", async () => {
      const userId = "user-123";
      const error = new Error("Database connection failed");
      
      userCacheRepositoryMock.getUserFromCache.mockResolvedValue(null);
      userGatewayMock.findUserById.mockRejectedValue(error);

      await expect(usecase.execute(userId)).rejects.toThrow("Database connection failed");
      expect(userCacheRepositoryMock.getUserFromCache).toHaveBeenCalledWith(userId);
      expect(userGatewayMock.findUserById).toHaveBeenCalledWith(userId);
    });

    it("should handle cache errors by propagating them", async () => {
      const userId = "user-123";
      const cacheError = new Error("Cache error");
      
      userCacheRepositoryMock.getUserFromCache.mockRejectedValue(cacheError);

      await expect(usecase.execute(userId)).rejects.toThrow("Cache error");
      expect(userCacheRepositoryMock.getUserFromCache).toHaveBeenCalledWith(userId);
      expect(userGatewayMock.findUserById).not.toHaveBeenCalled();
    });
  });
}); 