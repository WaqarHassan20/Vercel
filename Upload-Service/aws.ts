import { S3, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

// Initialize S3 client with credentials and endpoint from environment variables
const s3 = new S3({
  region: "auto",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
  endpoint: process.env.AWS_S3_ENDPOINT as string,
});

// Uploads a file to the S3 bucket
// fileName: the key (path) in the bucket
// localFilePath: the local file path to upload from
export const uploadFile = async (fileName: string, localFilePath: string) => {
  // Read file content from local file system
  const fileContent = fs.readFileSync(localFilePath);

  // Create S3 PutObject command
  const command = new PutObjectCommand({
    Body: fileContent,
    Bucket: "vercel",
    Key: fileName,
  });

  // Upload file to S3
  await s3.send(command);
  // console.log(command);
};
