import { S3, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import type { Request, Response } from "express";
import fs from "fs";

const BUCKET_NAME = "vercel";

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
    Bucket: BUCKET_NAME,
    Key: fileName,
  });

  // Upload file to S3
  await s3.send(command);
  // console.log(command);
};


export const emptyR2Bucket = async (req: Request, res: Response) => {
  try {
    // Step 1: List all objects in the bucket
    const list = await s3.send(
      new ListObjectsV2Command({ Bucket: BUCKET_NAME })
    );

    // If bucket is empty, return message
    if (!list.Contents || list.Contents.length === 0) {
      return res.json({ message: "Bucket is already empty." });
    }

    // Step 2: Prepare delete parameters for all objects
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: list.Contents.map((item) => ({ Key: item.Key! })), // Ensure Key is not null
      },
    };

    // Step 3: Send delete command to remove all objects
    await s3.send(new DeleteObjectsCommand(deleteParams));

    // Success response
    res.json({ message: "All objects deleted from the bucket." });
  } catch (error) {
    console.error("Error emptying R2 bucket:", error);
    res.status(500).json({ error: "Failed to empty the bucket." });
  }
};
