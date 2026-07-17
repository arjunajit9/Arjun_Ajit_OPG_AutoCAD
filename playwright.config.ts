import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://127.0.0.1:3000", trace: "on-first-retry" },
  webServer: {
    command: '"C:\\Users\\ARJUN AJIT\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\bin\\node.exe" node_modules\\next\\dist\\bin\\next dev',
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
