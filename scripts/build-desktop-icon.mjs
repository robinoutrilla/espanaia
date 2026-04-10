import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "..");
const assetsDirectory = path.join(repositoryRoot, "apps", "desktop", "assets");
const svgSourcePath = path.join(assetsDirectory, "espanaia-icon.svg");
const iconsetPath = path.join(assetsDirectory, "espanaia.iconset");
const icnsOutputPath = path.join(assetsDirectory, "espanaia.icns");
const basePngPath = path.join(assetsDirectory, "espanaia-1024.png");

const iconEntries = [
  [16, "icon_16x16.png"],
  [32, "icon_16x16@2x.png"],
  [32, "icon_32x32.png"],
  [64, "icon_32x32@2x.png"],
  [128, "icon_128x128.png"],
  [256, "icon_128x128@2x.png"],
  [256, "icon_256x256.png"],
  [512, "icon_256x256@2x.png"],
  [512, "icon_512x512.png"],
  [1024, "icon_512x512@2x.png"],
];

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });

  if (result.status !== 0) {
    throw new Error(command + " exited with status " + String(result.status ?? 1));
  }
}

if (!existsSync(svgSourcePath)) {
  throw new Error("Desktop icon source was not found at " + svgSourcePath);
}

await fs.rm(iconsetPath, { recursive: true, force: true });
await fs.mkdir(iconsetPath, { recursive: true });

run("sips", ["-s", "format", "png", "-z", "1024", "1024", svgSourcePath, "--out", basePngPath]);

for (const [size, fileName] of iconEntries) {
  run("sips", ["-z", String(size), String(size), basePngPath, "--out", path.join(iconsetPath, fileName)]);
}

run("iconutil", ["-c", "icns", iconsetPath, "-o", icnsOutputPath]);

await fs.rm(iconsetPath, { recursive: true, force: true });
await fs.rm(basePngPath, { force: true });

console.log("Desktop icon generated at " + icnsOutputPath);
