import { spawn, exec } from "child_process";
import path from "path"
import fs from "fs";

// ...existing code...


export async function buildProject(id: string) {
  const projectPath = path.join(__dirname, `output/${id}`);
  const pkgPath = path.join(projectPath, "package.json");
  let isNext = false;

  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    if (pkg.dependencies?.next || pkg.devDependencies?.next) {
      isNext = true;
    }
  }

  if (isNext) {
    // Install and build Next.js project
    await new Promise((resolve, reject) => {
      exec("npm install", { cwd: projectPath }, (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve(true);
      });
    });
    await new Promise((resolve, reject) => {
      exec("npm run build", { cwd: projectPath }, (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve(true);
      });
    });
    // Optionally, run `next export` for static export
    // await new Promise((resolve, reject) => {
    //   exec("npx next export", { cwd: projectPath }, (err, stdout, stderr) => {
    //     if (err) return reject(err);
    //     resolve(true);
    //   });
    // });
  } else {
    // ...existing static/react build logic...
  }
}