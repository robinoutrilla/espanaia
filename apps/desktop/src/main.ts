import { app, BrowserWindow, Menu, dialog, shell } from "electron";
import { execFile, spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const WEB_PORT = 3310;
const API_PORT = 4310;
const WINDOW_BACKGROUND = "#07111f";
const APP_NAME = "EspañaIA";
const APP_COPYRIGHT = "2026 Robin + Codex";
const APP_WEBSITE = "https://www.boe.es/datosabiertos/api/home.htm";
const currentDirectory = __dirname;
const repositoryRoot = path.resolve(currentDirectory, "../../..");
const managedProcesses = new Set<ChildProcess>();
let mainWindow: BrowserWindow | null = null;
let serversStarted = false;

const apiUrl = "http://127.0.0.1:" + String(API_PORT);
const webUrl = "http://127.0.0.1:" + String(WEB_PORT);

app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-gpu-compositing");

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.on("second-instance", () => {
  if (!mainWindow) {
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.focus();
});

app.on("child-process-gone", (_event, details) => {
  process.stderr.write("[child-process-gone] " + JSON.stringify(details) + "\n");
});

app.on("render-process-gone", (_event, _webContents, details) => {
  process.stderr.write("[render-process-gone] " + JSON.stringify(details) + "\n");
});

function runtimeRoot() {
  return app.isPackaged ? path.join(app.getAppPath(), "runtime") : repositoryRoot;
}

function dataRoot() {
  return path.join(app.getPath("userData"), "data");
}

function releaseRoot() {
  return path.join(repositoryRoot, "apps", "desktop", "release");
}

function resolveDesktopIcon() {
  const candidates = app.isPackaged
    ? [path.join(app.getAppPath(), "assets", "espanaia.icns")]
    : [path.join(repositoryRoot, "apps", "desktop", "assets", "espanaia.icns")];

  return candidates.find((candidate) => existsSync(candidate));
}

function internalUrl(pathname = "") {
  return pathname ? webUrl + pathname : webUrl;
}

function isInternalUrl(targetUrl: string) {
  return targetUrl.startsWith(webUrl);
}

function resolveWebServerEntry() {
  const candidates = [
    path.join(runtimeRoot(), "apps", "web", "standalone", "apps", "web", "server.js"),
    path.join(runtimeRoot(), "apps", "web", "standalone", "server.js"),
    path.join(repositoryRoot, "apps", "web", ".next", "standalone", "apps", "web", "server.js"),
    path.join(repositoryRoot, "apps", "web", ".next", "standalone", "server.js"),
  ];

  const match = candidates.find((candidate) => existsSync(candidate));

  if (!match) {
    throw new Error("Unable to locate the Next.js standalone server for EspañaIA Desktop.");
  }

  return match;
}

function resolveApiServerEntry() {
  const candidates = [
    path.join(runtimeRoot(), "apps", "api", "server.cjs"),
    path.join(runtimeRoot(), "apps", "api", "server.mjs"),
    path.join(repositoryRoot, "apps", "api", "dist", "server.cjs"),
    path.join(repositoryRoot, "apps", "api", "dist", "server.mjs"),
  ];

  const match = candidates.find((candidate) => existsSync(candidate));

  if (!match) {
    throw new Error("Unable to locate the bundled API server for EspañaIA Desktop.");
  }

  return match;
}

function createSplashMarkup() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${APP_NAME}</title>
    <style>
      :root {
        color-scheme: dark;
      }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background:
          radial-gradient(circle at top left, rgba(15, 123, 255, 0.28), transparent 28%),
          radial-gradient(circle at 78% 18%, rgba(0, 191, 165, 0.22), transparent 24%),
          linear-gradient(180deg, #07111f 0%, #0d1f33 100%);
        color: #f6fbff;
        font-family: Avenir Next, Segoe UI, sans-serif;
      }
      .shell {
        width: min(560px, calc(100% - 48px));
        padding: 28px;
        border-radius: 28px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.28);
        backdrop-filter: blur(18px);
      }
      .mark {
        width: 56px;
        height: 56px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        background: linear-gradient(135deg, #0f7bff, #00bfa5);
        font-weight: 700;
        font-size: 1.5rem;
      }
      h1 {
        margin: 18px 0 10px;
        font-family: Iowan Old Style, Palatino Linotype, serif;
        font-size: 3rem;
      }
      p {
        margin: 0;
        color: rgba(236, 244, 255, 0.76);
        line-height: 1.6;
      }
      .status {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-top: 24px;
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: #00bfa5;
        box-shadow: 0 0 0 8px rgba(0, 191, 165, 0.14);
        animation: pulse 1.4s ease-in-out infinite;
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.15); opacity: 0.72; }
      }
    </style>
  </head>
  <body>
    <section class="shell">
      <div class="mark">E</div>
      <h1>EspañaIA Desktop</h1>
      <p>Arrancando web, API y capa oficial de inteligencia política para macOS.</p>
      <div class="status">
        <span class="dot"></span>
        <span>Preparing command center</span>
      </div>
    </section>
  </body>
</html>`;
}

async function openPathIfPresent(targetPath: string, missingLabel: string) {
  if (!existsSync(targetPath)) {
    await dialog.showMessageBox({
      type: "warning",
      title: APP_NAME,
      message: missingLabel,
      detail: targetPath,
    });
    return;
  }

  await shell.openPath(targetPath);
}

async function navigateToPath(pathname: string) {
  await ensureServersReady();

  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  await mainWindow.loadURL(internalUrl(pathname));
}

function buildDockMenu() {
  if (process.platform !== "darwin" || !app.dock) {
    return;
  }

  const dockMenu = Menu.buildFromTemplate([
    {
      label: "Open Radar",
      click: () => {
        void navigateToPath("/");
      },
    },
    {
      label: "Open Territories",
      click: () => {
        void navigateToPath("/territories");
      },
    },
    {
      label: "Open Parties",
      click: () => {
        void navigateToPath("/parties");
      },
    },
    {
      label: "Open Politicians",
      click: () => {
        void navigateToPath("/politicians");
      },
    },
  ]);

  app.dock.setMenu(dockMenu);
}

function buildApplicationMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: APP_NAME,
      submenu: [
        { role: "about" },
        { type: "separator" },
        {
          label: "Open Snapshot Folder",
          click: async () => {
            await openPathIfPresent(dataRoot(), "Snapshot folder is not available yet.");
          },
        },
        {
          label: "Open Release Folder",
          click: async () => {
            await openPathIfPresent(releaseRoot(), "The desktop release folder has not been generated yet.");
          },
        },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Navigate",
      submenu: [
        {
          label: "Radar",
          accelerator: "Command+1",
          click: () => {
            void navigateToPath("/");
          },
        },
        {
          label: "Territories",
          accelerator: "Command+2",
          click: () => {
            void navigateToPath("/territories");
          },
        },
        {
          label: "Parties",
          accelerator: "Command+3",
          click: () => {
            void navigateToPath("/parties");
          },
        },
        {
          label: "Politicians",
          accelerator: "Command+4",
          click: () => {
            void navigateToPath("/politicians");
          },
        },
      ],
    },
    {
      label: "Data",
      submenu: [
        {
          label: "Refresh BOE Snapshot",
          click: async () => {
            await runIngestion("boe");
          },
        },
        {
          label: "Refresh Congreso Snapshot",
          click: async () => {
            await runIngestion("congreso");
          },
        },
        {
          label: "Check API Health",
          click: async () => {
            await showApiHealth();
          },
        },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    { role: "windowMenu" },
    {
      label: "Help",
      submenu: [
        {
          label: "Open BOE Open Data",
          click: async () => {
            await shell.openExternal("https://www.boe.es/datosabiertos/api/home.htm");
          },
        },
        {
          label: "Open Congreso Open Data",
          click: async () => {
            await shell.openExternal("https://www.congreso.es/es/opendata");
          },
        },
        {
          label: "Open EspañaIA Web Home",
          click: async () => {
            await shell.openExternal(internalUrl("/"));
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function trackProcess(childProcess: ChildProcess, label: string) {
  managedProcesses.add(childProcess);

  childProcess.stdout?.on("data", (chunk) => {
    process.stdout.write(`[${label}] ${chunk}`);
  });

  childProcess.stderr?.on("data", (chunk) => {
    process.stderr.write(`[${label}] ${chunk}`);
  });

  childProcess.on("exit", () => {
    managedProcesses.delete(childProcess);
  });

  childProcess.on("error", (error) => {
    process.stderr.write(`[${label}] ${String(error)}\n`);
  });

  return childProcess;
}

function runCurl(args: string[], timeoutMs = 10000) {
  return new Promise<string>((resolve, reject) => {
    execFile("/usr/bin/curl", args, { encoding: "utf8", maxBuffer: 1024 * 1024, timeout: timeoutMs }, (error, stdout, stderr) => {
      if (error) {
        const detail = stderr.trim() || error.message;
        reject(new Error(detail));
        return;
      }

      resolve(stdout);
    });
  });
}

async function requestJsonWithCurl(targetUrl: string, options?: { body?: string; headers?: Record<string, string>; method?: string; timeoutMs?: number }) {
  const args = ["-fsS"];

  if (options?.method) {
    args.push("-X", options.method);
  }

  if (options?.headers) {
    for (const [name, value] of Object.entries(options.headers)) {
      args.push("-H", `${name}: ${value}`);
    }
  }

  if (options?.body) {
    args.push("--data", options.body);
  }

  args.push(targetUrl);

  const output = await runCurl(args, options?.timeoutMs ?? 10000);
  return { data: JSON.parse(output) };
}

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function spawnNodeProcess(scriptPath: string, label: string, extraEnv: NodeJS.ProcessEnv) {
  return trackProcess(
    spawn(process.execPath, [scriptPath], {
      cwd: path.dirname(scriptPath),
      env: {
        ...process.env,
        ...extraEnv,
        ELECTRON_RUN_AS_NODE: "1",
      },
      stdio: "pipe",
    }),
    label,
  );
}

async function isUrlReady(targetUrl: string) {
  try {
    await runCurl(["-fsS", "-o", "/dev/null", "--max-time", "2", targetUrl], 3000);
    return true;
  } catch {
    return false;
  }
}

async function waitForUrl(targetUrl: string, timeoutMs = 60000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await isUrlReady(targetUrl)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out while waiting for ${targetUrl}`);
}

async function startDevelopmentServers() {
  if (!(await isUrlReady(apiUrl + "/health"))) {
    trackProcess(
      spawn(npmCommand(), ["run", "dev:api"], {
        cwd: repositoryRoot,
        env: {
          ...process.env,
          PORT: String(API_PORT),
          ESPANAIA_DATA_DIR: dataRoot(),
        },
        stdio: "pipe",
      }),
      "api",
    );
  }

  if (!(await isUrlReady(webUrl))) {
    trackProcess(
      spawn(npmCommand(), ["run", "dev:web"], {
        cwd: repositoryRoot,
        env: {
          ...process.env,
          PORT: String(WEB_PORT),
          NEXT_PUBLIC_ESPANAIA_API_URL: apiUrl,
        },
        stdio: "pipe",
      }),
      "web",
    );
  }
}

async function startPackagedServers() {
  if (!(await isUrlReady(apiUrl + "/health"))) {
    spawnNodeProcess(resolveApiServerEntry(), "api", {
      PORT: String(API_PORT),
      ESPANAIA_DATA_DIR: dataRoot(),
    });
  }

  if (!(await isUrlReady(webUrl))) {
    spawnNodeProcess(resolveWebServerEntry(), "web", {
      PORT: String(WEB_PORT),
      HOSTNAME: "127.0.0.1",
      NEXT_PUBLIC_ESPANAIA_API_URL: apiUrl,
      NEXT_TELEMETRY_DISABLED: "1",
    });
  }
}

async function ensureServersReady() {
  if (serversStarted) {
    return;
  }

  if (app.isPackaged) {
    await startPackagedServers();
  } else {
    await startDevelopmentServers();
  }

  await waitForUrl(apiUrl + "/health");
  await waitForUrl(webUrl);
  serversStarted = true;
}

function stopManagedProcesses() {
  for (const childProcess of managedProcesses) {
    if (!childProcess.killed) {
      childProcess.kill("SIGTERM");
    }
  }

  managedProcesses.clear();
}

async function showApiHealth() {
  try {
    const response = await requestJsonWithCurl(apiUrl + "/health");

    await dialog.showMessageBox({
      type: "info",
      title: APP_NAME + " API",
      message: "API health check completed.",
      detail: JSON.stringify(response.data, null, 2),
    });
  } catch (error) {
    await dialog.showMessageBox({
      type: "error",
      title: APP_NAME + " API",
      message: "The API health check failed.",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

async function runIngestion(kind: "boe" | "congreso") {
  try {
    const requestBody = kind === "boe" ? JSON.stringify({}) : undefined;
    const response = await requestJsonWithCurl(apiUrl + "/v1/ingest/" + kind + "/run", {
      body: requestBody,
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      timeoutMs: 20000,
    });

    await dialog.showMessageBox({
      type: "info",
      title: APP_NAME + " Data Refresh",
      message: kind.toUpperCase() + " ingestion completed successfully.",
      detail: JSON.stringify(response.data, null, 2),
    });

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.reload();
    }
  } catch (error) {
    await dialog.showMessageBox({
      type: "error",
      title: APP_NAME + " Data Refresh",
      message: "Unable to refresh " + kind.toUpperCase() + " right now.",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

function wireExternalNavigation(window: BrowserWindow) {
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isInternalUrl(url)) {
      return { action: "allow" };
    }

    void shell.openExternal(url);
    return { action: "deny" };
  });

  window.webContents.on("will-navigate", (event, url) => {
    if (url.startsWith("data:") || isInternalUrl(url)) {
      return;
    }

    event.preventDefault();
    void shell.openExternal(url);
  });
}

async function createMainWindow() {
  buildApplicationMenu();
  buildDockMenu();

  const iconPath = resolveDesktopIcon();

  mainWindow = new BrowserWindow({
    width: 1460,
    height: 920,
    minWidth: 1180,
    minHeight: 720,
    show: false,
    backgroundColor: WINDOW_BACKGROUND,
    title: APP_NAME,
    icon: iconPath,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    vibrancy: process.platform === "darwin" ? "under-window" : undefined,
    visualEffectState: process.platform === "darwin" ? "active" : undefined,
    trafficLightPosition: { x: 18, y: 18 },
    webPreferences: {
      preload: path.join(currentDirectory, "preload.js"),
      contextIsolation: true,
      sandbox: false,
      spellcheck: false,
      additionalArguments: ["--espanaia-api-url=" + apiUrl],
    },
  });

  wireExternalNavigation(mainWindow);

  await mainWindow.loadURL("data:text/html;charset=UTF-8," + encodeURIComponent(createSplashMarkup()));

  try {
    await ensureServersReady();
    await mainWindow.loadURL(webUrl);
  } catch (error) {
    await dialog.showMessageBox({
      type: "error",
      title: APP_NAME + " Startup",
      message: "EspañaIA Desktop could not start the local services.",
      detail: error instanceof Error ? error.message : String(error),
    });
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createMainWindow();
  }
});

app.on("before-quit", () => {
  stopManagedProcesses();
});

void app.whenReady().then(async () => {
  app.setName(APP_NAME);
  app.setAboutPanelOptions({
    applicationName: APP_NAME,
    applicationVersion: app.getVersion(),
    version: app.getVersion(),
    copyright: APP_COPYRIGHT,
    website: APP_WEBSITE,
    credits: "Signal intelligence cockpit for Spain powered by BOE and Congreso open data.",
  });

  const iconPath = resolveDesktopIcon();

  if (process.platform === "darwin" && app.dock && iconPath) {
    app.dock.setIcon(iconPath);
  }

  await createMainWindow();
});
