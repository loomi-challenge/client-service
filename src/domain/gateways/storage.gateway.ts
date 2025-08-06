export interface IStorageGateway {
  uploadProfilePicture(userId: string, fileBase64: string): Promise<string>;
}
