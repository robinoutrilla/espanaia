import { execFile as execFileCallback } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDirectory, "..");
const nativeRoot = path.join(repositoryRoot, "apps", "macos-native");
const sourcePath = path.join(nativeRoot, "src", "main.swift");
const plistPath = path.join(nativeRoot, "Info.plist");
const iconPath = path.join(repositoryRoot, "apps", "desktop", "assets", "espanaia.icns");
const runtimePath = path.join(repositoryRoot, "apps", "desktop", "runtime");
const buildRoot = path.join(nativeRoot, "build");
const releaseRoot = path.join(nativeRoot, "release");
const compiledBinaryPath = path.join(buildRoot, "EspanaIA");
const appRoot = path.join(releaseRoot, "EspanaIA.app");
const contentsRoot = path.join(appRoot, "Contents");
const macOSRoot = path.join(contentsRoot, "MacOS");
const resourcesRoot = path.join(contentsRoot, "Resources");
const embeddedNodePath = path.join(resourcesRoot, "bin", "node");
const swiftModuleCachePath = path.join(buildRoot, "swift-module-cache");

async function ensureExists(targetPath, label) {
  try {
    await fs.access(targetPath);
  } catch {
    throw new Error(label + " is missing at " + targetPath + ".");
  }
}

await ensureExists(sourcePath, "Native macOS source");
await ensureExists(plistPath, "Native macOS Info.plist");
await ensureExists(iconPath, "Desktop icon");
await ensureExists(runtimePath, "Prepared runtime");

await fs.rm(buildRoot, { force: true, recursive: true });
await fs.rm(appRoot, { force: true, recursive: true });
await fs.mkdir(buildRoot, { recursive: true });
await fs.mkdir(swiftModuleCachePath, { recursive: true });
await fs.mkdir(macOSRoot, { recursive: true });
await fs.mkdir(path.join(resourcesRoot, "bin"), { recursive: true });

await execFile("/usr/bin/swiftc", [
  "-O",
  "-module-cache-path",
  swiftModuleCachePath,
  "-framework",
  "Cocoa",
  "-framework",
  "WebKit",
  sourcePath,
  "-o",
  compiledBinaryPath,
]);

await fs.copyFile(compiledBinaryPath, path.join(macOSRoot, "EspanaIA"));
await fs.chmod(path.join(macOSRoot, "EspanaIA"), 0o755);
await fs.copyFile(plistPath, path.join(contentsRoot, "Info.plist"));
await fs.copyFile(iconPath, path.join(resourcesRoot, "espanaia.icns"));
await fs.cp(runtimePath, path.join(resourcesRoot, "runtime"), { recursive: true });
await fs.copyFile(process.execPath, embeddedNodePath);
await fs.chmod(embeddedNodePath, 0o755);

console.log("Native macOS app packaged at " + appRoot);
