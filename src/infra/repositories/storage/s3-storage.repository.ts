import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../../aws/s3-client";
import { IStorageProvider } from "../../../domain/providers/storage-provider";

export class S3StorageRepository implements IStorageProvider {
  private bucketName = process.env.AWS_BUCKET_NAME!;

  async uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<string> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error("Buffer do arquivo está vazio");
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      await s3Client.send(command);

      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error("Erro no upload S3:", error);
      throw error;
    }
  }
}
