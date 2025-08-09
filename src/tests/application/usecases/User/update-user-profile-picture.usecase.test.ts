import "reflect-metadata";
import { UpdateUserProfilePictureUsecase } from "@/application/usecases/User/update-user-profile-picture.usecase";
import { AppError } from "@/domain/errors/app-error";
import { createUserGatewayMock, createMockUserEntity } from "./mocks/user.gateway.mock";
import { createUserCacheRepositoryMock } from "./mocks/user-cache.gateway.mock";
import { createStorageProviderMock } from "./mocks/storage-provider.mock";
import * as fs from "fs";

jest.mock("fs");
const mockedFs = fs as jest.Mocked<typeof fs>;

describe("UpdateUserProfilePictureUsecase", () => {
  let usecase: UpdateUserProfilePictureUsecase;
  let userGatewayMock: ReturnType<typeof createUserGatewayMock>;
  let userCacheRepositoryMock: ReturnType<typeof createUserCacheRepositoryMock>;
  let storageProviderMock: ReturnType<typeof createStorageProviderMock>;

  beforeEach(() => {
    userGatewayMock = createUserGatewayMock();
    userCacheRepositoryMock = createUserCacheRepositoryMock();
    storageProviderMock = createStorageProviderMock();
    usecase = new UpdateUserProfilePictureUsecase(
      userGatewayMock,
      userCacheRepositoryMock,
      storageProviderMock
    );

    jest.clearAllMocks();
  });

  const createMockFile = (options: Partial<Express.Multer.File> = {}): Express.Multer.File => ({
    fieldname: "profilePicture",
    originalname: "profile.jpg",
    encoding: "7bit",
    mimetype: "image/jpeg",
    size: 1024,
    destination: "/tmp",
    filename: "profile.jpg",
    path: "/tmp/profile.jpg",
    buffer: Buffer.from("fake-image-data"),
    stream: {} as any,
    ...options,
  });

  describe("execute", () => {
    it("should update user profile picture successfully with buffer", async () => {
      const mockFile = createMockFile({
        buffer: Buffer.from("image-data"),
        originalname: "profile.jpg",
      });
      
      const input = {
        id: "user-123",
        profilePicture: mockFile,
      };

      const existingUser = createMockUserEntity();
      const updatedUser = createMockUserEntity({
        profilePicture: "https://example.com/profile-pictures/user-123.jpg",
      });

      userGatewayMock.findUserById.mockResolvedValue(existingUser);
      storageProviderMock.uploadFile.mockResolvedValue("https://example.com/profile-pictures/user-123.jpg");
      userGatewayMock.updateUserProfilePicture.mockResolvedValue(updatedUser);

      const result = await usecase.execute(input);

      expect(userGatewayMock.findUserById).toHaveBeenCalledWith(input.id);
      expect(storageProviderMock.uploadFile).toHaveBeenCalledWith(
        "profile-pictures/user-123.jpg",
        Buffer.from("image-data"),
        "image/jpeg"
      );
      expect(userGatewayMock.updateUserProfilePicture).toHaveBeenCalledWith(
        input.id,
        "https://example.com/profile-pictures/user-123.jpg"
      );
      expect(userCacheRepositoryMock.invalidateUserCache).toHaveBeenCalledWith(input.id);
      expect(result).toBe(updatedUser);
    });

    it("should update user profile picture successfully with file path", async () => {
      const mockFile = createMockFile({
        buffer: undefined,
        path: "/tmp/profile.png",
        originalname: "profile.png",
        mimetype: "image/png",
      });
      
      const input = {
        id: "user-123",
        profilePicture: mockFile,
      };

      const fileBuffer = Buffer.from("file-data");
      const existingUser = createMockUserEntity();
      const updatedUser = createMockUserEntity();

      mockedFs.readFileSync.mockReturnValue(fileBuffer);
      mockedFs.unlinkSync.mockImplementation(() => {});
      userGatewayMock.findUserById.mockResolvedValue(existingUser);
      storageProviderMock.uploadFile.mockResolvedValue("https://example.com/profile-pictures/user-123.png");
      userGatewayMock.updateUserProfilePicture.mockResolvedValue(updatedUser);

      const result = await usecase.execute(input);

      expect(mockedFs.readFileSync).toHaveBeenCalledWith("/tmp/profile.png");
      expect(storageProviderMock.uploadFile).toHaveBeenCalledWith(
        "profile-pictures/user-123.png",
        fileBuffer,
        "image/png"
      );
      expect(mockedFs.unlinkSync).toHaveBeenCalledWith("/tmp/profile.png");
      expect(result).toBe(updatedUser);
    });

    it("should throw AppError when user not found", async () => {
      const mockFile = createMockFile();
      const input = {
        id: "non-existent-user",
        profilePicture: mockFile,
      };

      userGatewayMock.findUserById.mockResolvedValue(null);

      await expect(usecase.execute(input)).rejects.toThrow(AppError);
      await expect(usecase.execute(input)).rejects.toThrow("Usuário não encontrado");
      
      expect(userGatewayMock.findUserById).toHaveBeenCalledWith(input.id);
      expect(storageProviderMock.uploadFile).not.toHaveBeenCalled();
    });

    it("should throw AppError when profile picture is missing", async () => {
      const input = {
        id: "user-123",
        profilePicture: null as any,
      };

      const existingUser = createMockUserEntity();
      userGatewayMock.findUserById.mockResolvedValue(existingUser);

      await expect(usecase.execute(input)).rejects.toThrow(AppError);
      await expect(usecase.execute(input)).rejects.toThrow("Foto de perfil é obrigatória");
    });

    it("should throw AppError when no buffer or path available", async () => {
      const mockFile = createMockFile({
        buffer: undefined,
        path: undefined,
      });
      
      const input = {
        id: "user-123",
        profilePicture: mockFile,
      };

      const existingUser = createMockUserEntity();
      userGatewayMock.findUserById.mockResolvedValue(existingUser);

      await expect(usecase.execute(input)).rejects.toThrow(AppError);
      await expect(usecase.execute(input)).rejects.toThrow("Arquivo não encontrado");
    });

    it("should throw AppError when upload fails", async () => {
      const mockFile = createMockFile();
      const input = {
        id: "user-123",
        profilePicture: mockFile,
      };

      const existingUser = createMockUserEntity();
      userGatewayMock.findUserById.mockResolvedValue(existingUser);
      storageProviderMock.uploadFile.mockResolvedValue("");

      await expect(usecase.execute(input)).rejects.toThrow(AppError);
      await expect(usecase.execute(input)).rejects.toThrow("Erro ao fazer upload da foto de perfil");
    });

    it("should handle different file extensions", async () => {
      const mockFile = createMockFile({
        originalname: "avatar.webp",
        mimetype: "image/webp",
      });
      
      const input = {
        id: "user-456",
        profilePicture: mockFile,
      };

      const existingUser = createMockUserEntity();
      const updatedUser = createMockUserEntity();

      userGatewayMock.findUserById.mockResolvedValue(existingUser);
      storageProviderMock.uploadFile.mockResolvedValue("https://example.com/profile-pictures/user-456.webp");
      userGatewayMock.updateUserProfilePicture.mockResolvedValue(updatedUser);

      await usecase.execute(input);

      expect(storageProviderMock.uploadFile).toHaveBeenCalledWith(
        "profile-pictures/user-456.webp",
        expect.any(Buffer),
        "image/webp"
      );
    });

    it("should handle file cleanup errors gracefully", async () => {
      const mockFile = createMockFile({
        buffer: undefined,
        path: "/tmp/profile.jpg",
      });
      
      const input = {
        id: "user-123",
        profilePicture: mockFile,
      };

      const existingUser = createMockUserEntity();
      const updatedUser = createMockUserEntity();
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      mockedFs.readFileSync.mockReturnValue(Buffer.from("data"));
      mockedFs.unlinkSync.mockImplementation(() => {
        throw new Error("Cannot delete file");
      });
      userGatewayMock.findUserById.mockResolvedValue(existingUser);
      storageProviderMock.uploadFile.mockResolvedValue("https://example.com/file.jpg");
      userGatewayMock.updateUserProfilePicture.mockResolvedValue(updatedUser);

      const result = await usecase.execute(input);

      expect(result).toBe(updatedUser);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "⚠️ Não foi possível remover arquivo temporário:",
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });

    it("should not try to delete file when using buffer", async () => {
      const mockFile = createMockFile({
        buffer: Buffer.from("data"),
        path: "/tmp/should-not-delete.jpg",
      });
      
      const input = {
        id: "user-123",
        profilePicture: mockFile,
      };

      const existingUser = createMockUserEntity();
      const updatedUser = createMockUserEntity();

      userGatewayMock.findUserById.mockResolvedValue(existingUser);
      storageProviderMock.uploadFile.mockResolvedValue("https://example.com/file.jpg");
      userGatewayMock.updateUserProfilePicture.mockResolvedValue(updatedUser);

      await usecase.execute(input);

      expect(mockedFs.unlinkSync).not.toHaveBeenCalled();
    });

    it("should handle storage provider errors", async () => {
      const mockFile = createMockFile();
      const input = {
        id: "user-123",
        profilePicture: mockFile,
      };

      const existingUser = createMockUserEntity();
      userGatewayMock.findUserById.mockResolvedValue(existingUser);
      storageProviderMock.uploadFile.mockRejectedValue(new Error("Storage error"));

      await expect(usecase.execute(input)).rejects.toThrow("Storage error");
    });

    it("should handle database update errors", async () => {
      const mockFile = createMockFile();
      const input = {
        id: "user-123",
        profilePicture: mockFile,
      };

      const existingUser = createMockUserEntity();
      userGatewayMock.findUserById.mockResolvedValue(existingUser);
      storageProviderMock.uploadFile.mockResolvedValue("https://example.com/file.jpg");
      userGatewayMock.updateUserProfilePicture.mockRejectedValue(new Error("Database error"));

      await expect(usecase.execute(input)).rejects.toThrow("Database error");
      expect(storageProviderMock.uploadFile).toHaveBeenCalled();
    });
  });
}); 