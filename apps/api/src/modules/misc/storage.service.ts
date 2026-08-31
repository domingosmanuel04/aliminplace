import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";

export function normalizeFileName(fileName: string) {
  const base =
    (fileName || "upload")
      .trim()
      .split(/[\\/]+/)
      .pop() || "upload";
  const safe = base.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
  return safe || "upload";
}

export function buildStorageKey(folder: string, fileName: string) {
  const name = normalizeFileName(fileName);
  const suffix = new Date().toISOString().replace(/[:.]/g, "-");
  return `${folder.replace(/^\/+|\/+$/g, "")}/${suffix}-${name}`;
}

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || "trauner";
    this.publicBaseUrl = (
      process.env.S3_PUBLIC_URL ||
      `${process.env.S3_ENDPOINT || "http://localhost:9020"}/${this.bucket}`
    ).replace(/\/$/, "");
    this.client = new S3Client({
      region: process.env.S3_REGION || "us-east-1",
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle:
        (process.env.S3_FORCE_PATH_STYLE || "true").toLowerCase() === "true",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "trauner",
        secretAccessKey: process.env.S3_SECRET_KEY || "traunersecret",
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder = "uploads") {
    if (!file?.buffer?.length) {
      throw new Error("Arquivo inválido");
    }

    const key = buildStorageKey(folder, file.originalname || "upload");
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype || "application/octet-stream",
        ACL: "public-read",
      }),
    );

    return {
      key,
      url: `${this.publicBaseUrl}/${key}`,
      bucket: this.bucket,
      mimeType: file.mimetype || "application/octet-stream",
    };
  }
}
