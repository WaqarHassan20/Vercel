import { S3 } from "@aws-sdk/client-s3";
import express from "express";
import { Readable } from "stream";

const app = express();

const BUCKET_NAME = "vercel";

const mimeTypes: Record<string, string> = {
  html: "text/html",
  css: "text/css",
  js: "application/javascript",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  json: "application/json",
  ico: "image/x-icon",
};

const s3 = new S3({
  region: "auto",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
  endpoint: process.env.AWS_S3_ENDPOINT as string,
});

app.use(async (req, res) => {
  try {
    // Get the hostname from the incoming request (example: 9z8ni.vercel.com)
    const host = req.hostname;

    // Extract the subdomain (first part before the dot), which acts as the unique ID
    // Example: from 9z8ni.vercel.com → id = "9z8ni"
    const id = host.split(".")[0];

    // If the path is "/", serve index.html by default (like most websites)
    // Otherwise, use the requested path (e.g., /assets/logo.svg)
    let filePath = req.path === "/" ? "/index.html" : req.path;

    // Build the S3 key where the file is stored
    // Example: dist/9z8ni/index.html or dist/9z8ni/assets/logo.svg
    const Key = `dist/${id}${filePath}`;
    console.log(`Fetching: ${Key}`);

    // Fetch the file from the S3 bucket
    const contents = await s3.getObject({
      Bucket: BUCKET_NAME,
      Key,
    });

    // If the file does not exist or has no body (empty), return 404
    if (!contents || !contents.Body) {
      return res.status(404).send("File from bucket not found");
    }

    // Determine the file extension to set the correct Content-Type (MIME type)
    const extension = filePath.split(".").pop()?.toLowerCase() || "";
    const type = mimeTypes[extension] || "application/octet-stream"; // Default if unknown
    res.set("Content-Type", type);

    // Stream the file from S3 directly to the response without loading into memory
    const stream = contents.Body as Readable;
    stream.pipe(res);

    console.log("Response streamed successfully");
  } catch (err: any) {
    console.error("Error:", err.name, err.message);

    // If the S3 key doesn't exist, return 404
    if (err.name === "NoSuchKey") {
      res.status(404).send("File not found");
    } else {
      // For all other errors, return 500 (Internal Server Error)
      res.status(500).send("Internal Server Error");
    }
  }
});


app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
