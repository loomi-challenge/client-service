import multer from "multer";
import path from "path";
import crypto from "crypto";
import { Request } from "express";
import { fileURLToPath } from "url";
// import aws from "aws-sdk";
// import multerS3 from "multer-s3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CustomFile extends Express.Multer.File {
  key?: string;
  location?: string;
}

const storageTypes = {
  local: multer.diskStorage({
    // destination: (req, file, cb) => {
    //   cb(null, path.resolve(__dirname, "..", "..", "tmp", "uploads"));
    // },
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) return cb(err, '');

        const key = `${hash.toString("hex")}-${file.originalname}`;
        (file as any).key = key;

        cb(null, key);
      });
    }
  }),
  
};

export default {
  storage: storageTypes[(process.env.STORAGE_TYPE as keyof typeof storageTypes) || "local"],
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = [
      "image/jpeg",
      "image/pjpeg",
      "image/png",
      "image/gif"
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
};