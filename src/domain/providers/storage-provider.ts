export interface IStorageProvider {
    uploadFile(fileName: string, fileBuffer: Buffer, mimeType: string): Promise<string>;
  }
  