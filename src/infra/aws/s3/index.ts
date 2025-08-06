import { IStorageGateway } from "@/domain/gateways/storage.gateway";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

export class S3StorageGateway implements IStorageGateway {
  private s3: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.AWS_BUCKET_NAME!;
    this.s3 = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadProfilePicture(
    userId: string,
    fileBase64: string
  ): Promise<string> {
    console.log(`📸 Iniciando upload de foto de perfil para usuário: ${userId}`);
    
    try {
      const buffer = Buffer.from(fileBase64, "base64");
      const key = `profile-pictures/${userId}/${uuid()}.jpg`;
      console.log(`🔗 Chave S3 gerada: ${key}`);

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentEncoding: "base64",
        ContentType: "image/jpeg",
        ACL: "public-read",
      });

      console.log(`📤 Enviando arquivo para S3 (bucket: ${this.bucket})...`);
      await this.s3.send(command);

      const imageUrl = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      console.log(`✅ Upload concluído com sucesso!`);
      console.log(`🌐 URL da imagem: ${imageUrl}`);
      console.log("─".repeat(50));

      return imageUrl;
    } catch (error) {
      console.log(`❌ Erro no upload de foto de perfil para usuário ${userId}: ${(error as Error).message}`);
      console.log("─".repeat(50));
      throw error;
    }
  }
}
