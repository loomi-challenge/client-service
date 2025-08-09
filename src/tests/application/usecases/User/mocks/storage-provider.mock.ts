import { IStorageProvider } from "@/domain/providers/storage-provider";

export const createStorageProviderMock = (): jest.Mocked<IStorageProvider> => ({
  uploadFile: jest.fn(),
}); 