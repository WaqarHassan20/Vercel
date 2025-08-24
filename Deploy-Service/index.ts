import { copyFinalDist, downloadS3Folder } from "./aws";
import { createClient } from "redis";
import { buildProject } from "./utils";

const subscriber = createClient();
const publisher = createClient();

async function main() {

  await subscriber.connect();
  await publisher.connect();

  while (true) {
    const response = await subscriber.brPop("build-queue", 0);
    // console.log(response);
    const id = response?.element;

    console.log("Deploying id:", id);
    const prefix = `output/${id}`;

    console.log("Downloading from prefix:", prefix);
    await downloadS3Folder(prefix);

    console.log("Scripts running started");
    await buildProject(id || "");

    console.log("Scripts running done");
    console.log("Uploaing dist started");
    await copyFinalDist(id || "");
    console.log("Uploaing dist done");

    publisher.hSet("status", id as string, "Deployed");
  }

}

main();
console.log("Deploy file started");