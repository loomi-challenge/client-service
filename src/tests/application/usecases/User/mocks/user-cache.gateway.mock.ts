import { IUserCacheRepository } from "@/domain/gateways/user-cache.gateway";

export const createUserCacheRepositoryMock = (): jest.Mocked<IUserCacheRepository> => ({
  getUserFromCache: jest.fn(),
  saveUserToCache: jest.fn(),
  invalidateUserCache: jest.fn(),
}); 