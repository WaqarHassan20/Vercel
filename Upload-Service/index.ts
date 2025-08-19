import { getAllFiles } from "./file";
import { generate } from "./utils";
import simpleGit from "simple-git";
import { uploadFile } from "./aws";
import {createClient} from "redis"
import express from "express"
import cors from "cors";
import path from "path"

// Create Redis client for publishing build jobs
const publisher = createClient();
publisher.connect();

const app = express()
app.use(express.json());
app.use(cors());

// Endpoint to handle deployment requests
app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;
  // Generate a unique id for this deployment
  const id = generate();

  // Clone the repository to a unique output directory
  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

  // Get all files in the cloned repository
  const files = getAllFiles(path.join(__dirname, `output/${id}`));

  // Upload each file to S3
  files.forEach(async (file) => {
    // Remove the base directory from the file path for S3 key
    await uploadFile(file.slice(__dirname.length + 1), file);
  });
  console.log("Uploading Successfully Done!");

  // Add the deployment id to the build queue in Redis
  publisher.lPush("build-queue", id);

  // Respond with the deployment id
  res.json({ id });
});

// Start the Express server
app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});