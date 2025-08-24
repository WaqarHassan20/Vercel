import { getAllFiles } from "./file";
import { generate } from "./utils";
import simpleGit from "simple-git";
import { emptyR2Bucket, uploadFile } from "./aws";
import {createClient} from "redis"
import express from "express"
import cors from "cors";
import path from "path"

// Create Redis client for publishing build jobs
const publisher = createClient();
publisher.connect();

const subscriber = createClient();
subscriber.connect();

// We cannot read and write the data by only one redis client
// So we have to create the publisher to write data and subscriber to read data

const app = express()
app.use(cors());

app.post("/deleteAll", async (req, res) => {
  await emptyR2Bucket(req, res);
});

app.use(express.json());

app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;

  const id = generate();

  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));
  
  const files = getAllFiles(path.join(__dirname, `output/${id}`));
  
  files.forEach(async (file) => {
    await uploadFile(file.slice(__dirname.length + 1), file);
  });
  console.log("Uploading Successfully Done!");

  publisher.lPush("build-queue", id);
  publisher.hSet("status", id, "uploaded");
  
  console.log(id);
  res.json({ id });
});


app.get("/status", async (req, res) => {
  const id = req.query.id;
  console.log(id);
  const status = await subscriber.hGet("status", id as string);
  res.json({
    status: status,
  });
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});



// Clone the repository to a unique output directory
// Get all files in the cloned repository
// Upload each file to S3
// Remove the base directory from the file path for S3 key
// Add the deployment id to the build queue in Redis
// Respond with the deployment id