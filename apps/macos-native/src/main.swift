import AppKit
import Foundation
import WebKit

final class EspanaIANativeApp: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
  private let appName = "EspañaIA"
  private let apiPort = 4310
  private let webPort = 3310
  private let windowBackground = NSColor(calibratedRed: 7.0 / 255.0, green: 17.0 / 255.0, blue: 31.0 / 255.0, alpha: 1.0)
  private var window: NSWindow?
  private var webView: WKWebView?
  private var managedProcesses: [Process] = []
  private var startupTask: Task<Void, Never>?
  private let fileManager = FileManager.default

  private var apiBaseURL: URL {
    URL(string: "http://127.0.0.1:\(apiPort)")!
  }

  private var webBaseURL: URL {
    URL(string: "http://127.0.0.1:\(webPort)")!
  }

  func applicationDidFinishLaunching(_ notification: Notification) {
    appendLog("[app] did finish launching\n")
    buildMenu()
    createWindow()
    loadSplash()

    startupTask = Task { [weak self] in
      guard let self else {
        return
      }

      do {
        self.appendLog("[startup] boot sequence started\n")
        try await self.ensureServersReady()
        self.appendLog("[startup] services ready\n")
        self.loadInternalPath("/")
      } catch {
        self.appendLog("[startup] \(error.localizedDescription)\n")
        self.showStartupError(error)
      }
    }

    NSApp.activate(ignoringOtherApps: true)
  }

  func applicationWillTerminate(_ notification: Notification) {
    startupTask?.cancel()
    stopManagedProcesses()
  }

  func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
    true
  }

  func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
    if !flag {
      window?.makeKeyAndOrderFront(nil)
    }
    return true
  }

  private func buildMenu() {
    let mainMenu = NSMenu()

    let appMenuItem = NSMenuItem()
    mainMenu.addItem(appMenuItem)

    let appMenu = NSMenu(title: appName)
    appMenuItem.submenu = appMenu
    appMenu.addItem(menuItem(title: "About \(appName)", action: #selector(showAboutPanel), keyEquivalent: ""))
    appMenu.addItem(.separator())
    appMenu.addItem(menuItem(title: "Quit \(appName)", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"))

    let navigateMenuItem = NSMenuItem()
    mainMenu.addItem(navigateMenuItem)

    let navigateMenu = NSMenu(title: "Navigate")
    navigateMenuItem.submenu = navigateMenu
    navigateMenu.addItem(menuItem(title: "Radar", action: #selector(openRadar), keyEquivalent: "1"))
    navigateMenu.addItem(menuItem(title: "Territories", action: #selector(openTerritories), keyEquivalent: "2"))
    navigateMenu.addItem(menuItem(title: "Parties", action: #selector(openParties), keyEquivalent: "3"))
    navigateMenu.addItem(menuItem(title: "Politicians", action: #selector(openPoliticians), keyEquivalent: "4"))

    NSApp.mainMenu = mainMenu
  }

  private func menuItem(title: String, action: Selector, keyEquivalent: String) -> NSMenuItem {
    let item = NSMenuItem(title: title, action: action, keyEquivalent: keyEquivalent)
    item.keyEquivalentModifierMask = keyEquivalent.isEmpty ? [] : [.command]
    item.target = self
    return item
  }

  private func createWindow() {
    appendLog("[window] creating native shell window\n")
    let configuration = WKWebViewConfiguration()
    configuration.preferences.javaScriptEnabled = false
    configuration.defaultWebpagePreferences.allowsContentJavaScript = false
    let userContentController = WKUserContentController()
    userContentController.add(self, name: "espanaiaClientLog")
    userContentController.addUserScript(WKUserScript(source: clientDiagnosticsScript(), injectionTime: .atDocumentStart, forMainFrameOnly: false))
    configuration.userContentController = userContentController
    let webView = WKWebView(frame: .zero, configuration: configuration)
    webView.navigationDelegate = self
    webView.uiDelegate = self
    webView.setValue(false, forKey: "drawsBackground")

    let window = NSWindow(
      contentRect: NSRect(x: 0, y: 0, width: 1460, height: 920),
      styleMask: [.titled, .closable, .miniaturizable, .resizable],
      backing: .buffered,
      defer: false
    )

    window.title = appName
    window.center()
    window.isReleasedWhenClosed = false
    window.backgroundColor = windowBackground
    window.titlebarAppearsTransparent = true
    window.toolbarStyle = .unifiedCompact
    window.contentView = webView
    window.makeKeyAndOrderFront(nil)

    self.window = window
    self.webView = webView
  }

  private func loadSplash() {
    webView?.loadHTMLString(splashMarkup(), baseURL: nil)
  }

  private func splashMarkup() -> String {
    """
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>\(appName)</title>
        <style>
          :root { color-scheme: dark; }
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
          <h1>EspañaIA Native</h1>
          <p>Arrancando radar político, BOE, Congreso y capa territorial para macOS.</p>
          <div class="status">
            <span class="dot"></span>
            <span>Preparing command center</span>
          </div>
        </section>
      </body>
    </html>
    """
  }

  private func errorMarkup(message: String) -> String {
    """
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>\(appName) Error</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: linear-gradient(180deg, #140b10 0%, #23121f 100%);
            color: #f8edf0;
            font-family: Avenir Next, Segoe UI, sans-serif;
          }
          article {
            width: min(680px, calc(100% - 48px));
            padding: 28px;
            border-radius: 28px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          h1 {
            margin: 0 0 12px;
            font-family: Iowan Old Style, Palatino Linotype, serif;
            font-size: 2.6rem;
          }
          p {
            margin: 0;
            white-space: pre-wrap;
            line-height: 1.6;
            color: rgba(248, 237, 240, 0.78);
          }
        </style>
      </head>
      <body>
        <article>
          <h1>Startup blocked</h1>
          <p>\(message)</p>
        </article>
      </body>
    </html>
    """
  }

  private func clientDiagnosticsScript() -> String {
    """
    (() => {
      const post = (level, payload) => {
        try {
          window.webkit?.messageHandlers?.espanaiaClientLog?.postMessage({ level, payload });
        } catch {}
      };

      const serialize = (value) => {
        if (value instanceof Error) {
          return { name: value.name, message: value.message, stack: value.stack };
        }

        if (typeof value === "object" && value !== null) {
          try {
            return JSON.parse(JSON.stringify(value));
          } catch {
            return String(value);
          }
        }

        return value;
      };

      window.addEventListener("error", (event) => {
        post("error", {
          type: "window.error",
          message: event.message,
          source: event.filename,
          line: event.lineno,
          column: event.colno,
          error: serialize(event.error)
        });
      });

      window.addEventListener("unhandledrejection", (event) => {
        post("error", {
          type: "unhandledrejection",
          reason: serialize(event.reason)
        });
      });

      const originalConsoleError = console.error.bind(console);
      console.error = (...args) => {
        post("error", {
          type: "console.error",
          args: args.map(serialize)
        });
        originalConsoleError(...args);
      };
    })();
    """
  }

  private func resourceURL(_ components: String...) -> URL {
    var url = Bundle.main.resourceURL!

    for component in components {
      url.appendPathComponent(component)
    }

    return url
  }

  private func appSupportRoot() -> URL {
    let base = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
    let target = base.appendingPathComponent("EspanaIA", isDirectory: true)
    try? fileManager.createDirectory(at: target, withIntermediateDirectories: true)
    return target
  }

  private func dataRoot() -> URL {
    let target = appSupportRoot().appendingPathComponent("data", isDirectory: true)
    try? fileManager.createDirectory(at: target, withIntermediateDirectories: true)
    return target
  }

  private func logFileURL() -> URL {
    let logsDirectory = appSupportRoot().appendingPathComponent("logs", isDirectory: true)
    try? fileManager.createDirectory(at: logsDirectory, withIntermediateDirectories: true)
    return logsDirectory.appendingPathComponent("native-shell.log")
  }

  private func appendLog(_ message: String) {
    let data = Data(message.utf8)
    let logURL = logFileURL()
    try? FileHandle.standardError.write(contentsOf: data)

    if !fileManager.fileExists(atPath: logURL.path) {
      try? data.write(to: logURL)
      return
    }

    guard let handle = try? FileHandle(forWritingTo: logURL) else {
      return
    }

    do {
      try handle.seekToEnd()
      try handle.write(contentsOf: data)
      try handle.close()
    } catch {
      try? handle.close()
    }
  }

  private func internalURL(path: String = "/") -> URL {
    let trimmed = path.hasPrefix("/") ? String(path.dropFirst()) : path
    return webBaseURL.appendingPathComponent(trimmed)
  }

  private func isAboutBlank(_ url: URL) -> Bool {
    url.absoluteString == "about:blank"
  }

  private func isInternal(_ url: URL) -> Bool {
    url.host == "127.0.0.1" && url.port == webPort
  }

  private func openExternalURL(_ url: URL) {
    appendLog("[webview] opening external \(url.absoluteString)\n")
    NSWorkspace.shared.open(url)
  }

  private func resolveNodeBinary() throws -> URL {
    let nodeURL = resourceURL("bin", "node")

    guard fileManager.isExecutableFile(atPath: nodeURL.path) else {
      throw NSError(domain: appName, code: 1, userInfo: [NSLocalizedDescriptionKey: "Embedded Node binary is missing at \(nodeURL.path)."])
    }

    return nodeURL
  }

  private func resolveAPIEntry() throws -> URL {
    let candidates = [
      resourceURL("runtime", "apps", "api", "server.cjs"),
      resourceURL("runtime", "apps", "api", "server.mjs")
    ]

    guard let apiURL = candidates.first(where: { fileManager.fileExists(atPath: $0.path) }) else {
      throw NSError(domain: appName, code: 2, userInfo: [NSLocalizedDescriptionKey: "Bundled API server is missing from the native app resources."])
    }

    return apiURL
  }

  private func resolveWebEntry() throws -> URL {
    let candidates = [
      resourceURL("runtime", "apps", "web", "standalone", "apps", "web", "server.js"),
      resourceURL("runtime", "apps", "web", "standalone", "server.js")
    ]

    guard let match = candidates.first(where: { fileManager.fileExists(atPath: $0.path) }) else {
      throw NSError(domain: appName, code: 3, userInfo: [NSLocalizedDescriptionKey: "Bundled web server is missing from the native app resources."])
    }

    return match
  }

  private func spawnNodeProcess(label: String, scriptURL: URL, environment extraEnvironment: [String: String]) throws {
    appendLog("[\(label)] preparing \(scriptURL.path)\n")
    let process = Process()
    process.executableURL = try resolveNodeBinary()
    process.arguments = [scriptURL.path]
    process.currentDirectoryURL = scriptURL.deletingLastPathComponent()

    var environment = ProcessInfo.processInfo.environment
    extraEnvironment.forEach { key, value in
      environment[key] = value
    }
    process.environment = environment

    let stdoutPipe = Pipe()
    let stderrPipe = Pipe()
    process.standardOutput = stdoutPipe
    process.standardError = stderrPipe

    stdoutPipe.fileHandleForReading.readabilityHandler = { [weak self] handle in
      let data = handle.availableData

      guard !data.isEmpty else {
        return
      }

      let output = String(decoding: data, as: UTF8.self)
      Task { @MainActor in
        self?.appendLog("[\(label)] \(output)")
      }
    }

    stderrPipe.fileHandleForReading.readabilityHandler = { [weak self] handle in
      let data = handle.availableData

      guard !data.isEmpty else {
        return
      }

      let output = String(decoding: data, as: UTF8.self)
      Task { @MainActor in
        self?.appendLog("[\(label):stderr] \(output)")
      }
    }

    process.terminationHandler = { [weak self] terminatedProcess in
      Task { @MainActor in
        self?.appendLog("[\(label)] exited with status \(terminatedProcess.terminationStatus)\n")
      }
    }

    try process.run()
    managedProcesses.append(process)
    appendLog("[\(label)] started with pid \(process.processIdentifier)\n")
  }

  private func isURLReady(_ url: URL) async -> Bool {
    var request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 2)
    request.httpMethod = "GET"

    do {
      let (_, response) = try await URLSession.shared.data(for: request)

      guard let httpResponse = response as? HTTPURLResponse else {
        return false
      }

      return (200 ..< 500).contains(httpResponse.statusCode)
    } catch {
      return false
    }
  }

  private func waitForURL(_ url: URL, timeoutSeconds: TimeInterval = 60) async throws {
    let startedAt = Date()

    while Date().timeIntervalSince(startedAt) < timeoutSeconds {
      if await isURLReady(url) {
        return
      }

      try await Task.sleep(nanoseconds: 500_000_000)
    }

    throw NSError(domain: appName, code: 4, userInfo: [NSLocalizedDescriptionKey: "Timed out while waiting for \(url.absoluteString)."])
  }

  private func startServersIfNeeded() async throws {
    let apiHealthURL = apiBaseURL.appendingPathComponent("health")

    if !(await isURLReady(apiHealthURL)) {
      try spawnNodeProcess(
        label: "api",
        scriptURL: try resolveAPIEntry(),
        environment: [
          "PORT": String(apiPort),
          "ESPANAIA_DATA_DIR": dataRoot().path
        ]
      )
    }

    if !(await isURLReady(webBaseURL)) {
      try spawnNodeProcess(
        label: "web",
        scriptURL: try resolveWebEntry(),
        environment: [
          "PORT": String(webPort),
          "HOSTNAME": "127.0.0.1",
          "ESPANAIA_API_URL": apiBaseURL.absoluteString,
          "NEXT_PUBLIC_ESPANAIA_API_URL": apiBaseURL.absoluteString,
          "NEXT_TELEMETRY_DISABLED": "1"
        ]
      )
    }
  }

  private func ensureServersReady() async throws {
    try await startServersIfNeeded()
    try await waitForURL(apiBaseURL.appendingPathComponent("health"))
    try await waitForURL(webBaseURL)
  }

  private func loadInternalPath(_ path: String) {
    let request = URLRequest(url: internalURL(path: path))
    webView?.load(request)
  }

  private func stopManagedProcesses() {
    managedProcesses.forEach { process in
      if process.isRunning {
        process.terminate()
      }
    }
    managedProcesses.removeAll()
  }

  private func showStartupError(_ error: Error) {
    let message = error.localizedDescription
    webView?.loadHTMLString(errorMarkup(message: message), baseURL: nil)

    let alert = NSAlert()
    alert.alertStyle = .warning
    alert.messageText = "\(appName) could not start"
    alert.informativeText = message
    alert.runModal()
  }

  @objc private func showAboutPanel() {
    let alert = NSAlert()
    alert.messageText = appName
    alert.informativeText = "Native macOS command center for Spain's political intelligence stack."
    alert.runModal()
  }

  @objc private func openRadar() {
    loadInternalPath("/")
  }

  @objc private func openTerritories() {
    loadInternalPath("/territories")
  }

  @objc private func openParties() {
    loadInternalPath("/parties")
  }

  @objc private func openPoliticians() {
    loadInternalPath("/politicians")
  }

  func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
    guard message.name == "espanaiaClientLog" else {
      return
    }

    appendLog("[client] \(String(describing: message.body))\n")
  }

  func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
    appendLog("[webview] started \(webView.url?.absoluteString ?? "unknown")\n")
  }

  func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
    appendLog("[webview] finished \(webView.url?.absoluteString ?? "unknown")\n")
  }

  func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
    appendLog("[webview] failed navigation \(error.localizedDescription)\n")
  }

  func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
    appendLog("[webview] failed provisional navigation \(error.localizedDescription)\n")
  }

  func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
    guard let url = navigationAction.request.url else {
      decisionHandler(.cancel)
      return
    }

    if isAboutBlank(url) {
      appendLog("[webview] ignored about:blank navigation\n")
      decisionHandler(.cancel)
      return
    }

    if navigationAction.targetFrame == nil {
      if isInternal(url) {
        appendLog("[webview] rerouted internal popup \(url.absoluteString)\n")
        webView.load(navigationAction.request)
        decisionHandler(.cancel)
        return
      }

      if let scheme = url.scheme?.lowercased(), scheme == "http" || scheme == "https" {
        openExternalURL(url)
      } else {
        appendLog("[webview] ignored popup \(url.absoluteString)\n")
      }

      decisionHandler(.cancel)
      return
    }

    if url.scheme == "data" || isInternal(url) {
      decisionHandler(.allow)
      return
    }

    if let scheme = url.scheme?.lowercased(), scheme == "http" || scheme == "https" {
      openExternalURL(url)
    } else {
      appendLog("[webview] ignored unsupported navigation \(url.absoluteString)\n")
    }

    decisionHandler(.cancel)
  }

  func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
    guard let url = navigationAction.request.url else {
      return nil
    }

    if isAboutBlank(url) {
      appendLog("[webview] ignored about:blank popup\n")
      return nil
    }

    if isInternal(url) {
      appendLog("[webview] rerouted internal popup \(url.absoluteString)\n")
      webView.load(URLRequest(url: url))
      return nil
    }

    if let scheme = url.scheme?.lowercased(), scheme == "http" || scheme == "https" {
      openExternalURL(url)
    } else {
      appendLog("[webview] ignored unsupported popup \(url.absoluteString)\n")
    }

    return nil
  }
}

let application = NSApplication.shared
let delegate = EspanaIANativeApp()
application.setActivationPolicy(.regular)
application.delegate = delegate
application.run()
