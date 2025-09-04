// prefix => output/fd24j

import { PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import fs from "fs";
import path, { resolve } from "path";
import { exec } from "child_process";

const BUCKET_NAME = "vercel";

const s3 = new S3({
  region: "auto",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
  endpoint: process.env.AWS_S3_ENDPOINT as string,
});

export async function downloadS3Folder(prefix: string) {
  const allFiles = await s3.listObjectsV2({
    Bucket: "vercel",
    Prefix: prefix,
  });

  // console.log(allFiles.Contents);
  // console.log(allFiles.Contents?.length);

  const allPromises =
    allFiles.Contents?.map(({ Key }) => {
      if (!Key) return Promise.resolve("");

      return new Promise(async (resolve, reject) => {
        try {
          const finalOutputPath = path.join(__dirname, Key);
          const dirName = path.dirname(finalOutputPath);
          if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
          }

          const getObjectResult = await s3.getObject({
            Bucket: "vercel",
            Key,
          });

          // console.log(getObjectResult.Body);

          if (getObjectResult.Body) {
            const outputFile = fs.createWriteStream(finalOutputPath);
            (getObjectResult.Body as NodeJS.ReadableStream)
              .pipe(outputFile)
              .on("finish", () => resolve(""))
              .on("error", reject);
          } else {
            resolve("");
          }
        } catch (err) {
          reject(err);
        }
      });
    }) || [];

  console.log("awaiting...");
  await Promise.all(allPromises);
  console.log("done!");
}

export function copyFinalDist(id:string){

  const folderPath = path.join(__dirname, `/output/${id}/dist`);
  const allFiles = getAllFiles(folderPath);
  allFiles.forEach((file)=>{
    const res = uploadFile(
      `dist/${id}/` + file.slice(folderPath.length + 1),
      file
    );
    console.log(res);
  })

}


export const getAllFiles = (folderPath: string) => {

  let response: string[] = [];
    
    const allFileAndFolders = fs.readdirSync(folderPath);
    
    allFileAndFolders.forEach((file)=>{
        const fullFilePath = path.join(folderPath, file);
        
        if (fs.statSync(fullFilePath).isDirectory()) {
          response = response.concat(getAllFiles(fullFilePath));
        }
        else{
            response.push(fullFilePath);
        }
    })

    return response;
};


// localFilePath: the local file path to upload from
export const uploadFile = async (fileName: string, localFilePath: string) => {
  // Read file content from local file system
  const fileContent = fs.readFileSync(localFilePath);

  const command = new PutObjectCommand({
    Body: fileContent,
    Bucket: BUCKET_NAME,
    Key: fileName,
  });

  await s3.send(command);
};

export async function startNextServer(id: string) {
  const projectPath = path.join(__dirname, `output/${id}`);
  // Start the Next.js server (SSR/SSG)
  exec("npm run start", { cwd: projectPath });
  // You may want to manage ports and process lifecycles for multiple deployments
}