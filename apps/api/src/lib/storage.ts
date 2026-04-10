import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const configuredDataRoot = process.env.ESPANAIA_DATA_DIR;
const ingestionRoot = configuredDataRoot
  ? path.resolve(configuredDataRoot, "ingestion")
  : path.resolve(currentDirectory, "../../../../data/ingestion");

export async function writeSnapshot(namespace: string, fileName: string, payload: unknown) {
  const targetDirectory = path.join(ingestionRoot, namespace);
  const targetPath = path.join(targetDirectory, fileName);

  await fs.mkdir(targetDirectory, { recursive: true });
  await fs.writeFile(targetPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  return targetPath;
}

export async function listSnapshots() {
  const namespaces = await fs.readdir(ingestionRoot, { withFileTypes: true }).catch(() => []);
  const snapshotFiles: Array<{ namespace: string; filePath: string; fileName: string }> = [];

  for (const namespace of namespaces) {
    if (!namespace.isDirectory()) {
      continue;
    }

    const namespacePath = path.join(ingestionRoot, namespace.name);
    const entries = await fs.readdir(namespacePath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile()) {
        continue;
      }

      snapshotFiles.push({
        namespace: namespace.name,
        fileName: entry.name,
        filePath: path.join(namespacePath, entry.name),
      });
    }
  }

  return snapshotFiles.sort((left, right) => right.fileName.localeCompare(left.fileName));
}

export async function readLatestSnapshot<TPayload>(namespace: string) {
  const namespacePath = path.join(ingestionRoot, namespace);
  const entries = await fs.readdir(namespacePath, { withFileTypes: true }).catch(() => []);
  const latestEntry = entries
    .filter((entry) => entry.isFile())
    .sort((left, right) => right.name.localeCompare(left.name))[0];

  if (!latestEntry) {
    return null;
  }

  const filePath = path.join(namespacePath, latestEntry.name);
  const payload = JSON.parse(await fs.readFile(filePath, "utf8")) as TPayload;

  return {
    fileName: latestEntry.name,
    filePath,
    payload,
  };
}
