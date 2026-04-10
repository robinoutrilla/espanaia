import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "..");
const runtimeRoot = path.join(repositoryRoot, "apps", "desktop", "runtime");
const apiBundlePath = path.join(repositoryRoot, "apps", "api", "dist", "server.mjs");
const webStandaloneRoot = path.join(repositoryRoot, "apps", "web", ".next", "standalone");
const webStaticRoot = path.join(repositoryRoot, "apps", "web", ".next", "static");
const webPublicRoot = path.join(repositoryRoot, "apps", "web", "public");

async function ensureExists(targetPath, label) {
  try {
    await fs.access(targetPath);
  } catch {
    throw new Error(label + " was not found at " + targetPath + ". Run npm run build first.");
  }
}

async function copyDirectory(sourcePath, destinationPath) {
  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.cp(sourcePath, destinationPath, { recursive: true });
}

await ensureExists(apiBundlePath, "Bundled API server");
await ensureExists(webStandaloneRoot, "Next standalone output");
await ensureExists(webStaticRoot, "Next static output");

await fs.rm(runtimeRoot, { recursive: true, force: true });
await fs.mkdir(path.join(runtimeRoot, "apps", "api"), { recursive: true });
await fs.copyFile(apiBundlePath, path.join(runtimeRoot, "apps", "api", "server.mjs"));

const desktopStandaloneRoot = path.join(runtimeRoot, "apps", "web", "standalone");
await copyDirectory(webStandaloneRoot, desktopStandaloneRoot);

const monorepoStaticTarget = path.join(desktopStandaloneRoot, "apps", "web", ".next", "static");
const flatStaticTarget = path.join(desktopStandaloneRoot, ".next", "static");
const staticTarget = await fs
  .access(path.join(desktopStandaloneRoot, "apps", "web"))
  .then(() => monorepoStaticTarget)
  .catch(() => flatStaticTarget);

await copyDirectory(webStaticRoot, staticTarget);

await fs
  .access(webPublicRoot)
  .then(async () => {
    const publicTarget = await fs
      .access(path.join(desktopStandaloneRoot, "apps", "web"))
      .then(() => path.join(desktopStandaloneRoot, "apps", "web", "public"))
      .catch(() => path.join(desktopStandaloneRoot, "public"));

    await copyDirectory(webPublicRoot, publicTarget);
  })
  .catch(() => undefined);

console.log("Desktop runtime prepared at " + runtimeRoot);
