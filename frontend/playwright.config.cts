import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

const root = resolve(process.cwd(), "..");
const python = resolve(
  root,
  ".venv",
  process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
);
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 12_000 },
  outputDir: resolve(root, ".local/react-e2e/artifacts"),
  reporter: [
    ["list"],
    ["json", { outputFile: resolve(root, ".local/react-e2e/results.json") }],
  ],
  use: {
    baseURL: "http://127.0.0.1:18087",
    browserName: "chromium",
    channel: "msedge",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `"${python}" "${resolve(root, "tests/e2e_server.py")}" --port 18087`,
    url: "http://127.0.0.1:18087/health",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
