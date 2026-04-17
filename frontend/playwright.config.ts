import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
import { loadE2eDotenv } from "./e2e/load-e2e-env";

const repoFrontendRoot = dirname(fileURLToPath(import.meta.url));

loadE2eDotenv(repoFrontendRoot);

/**
 * Account demo (sovrascrivi con `.env.e2e` o variabili d’ambiente).
 * Deve esistere nel backend con email verificata (JWT).
 */
process.env.E2E_TEST_EMAIL ??= "demo.video@example.com";
process.env.E2E_TEST_PASSWORD ??= "DemoVideo2026!";
/** Stesso host del build Vite (`VITE_API_*`); usato dal preflight login nei test. */
process.env.E2E_API_BASE_URL ??= "http://127.0.0.1:8000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  timeout: 60_000,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:4173",
    locale: "it-IT",
  },
  webServer: {
    command: "npm run build && npx vite preview --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    cwd: repoFrontendRoot,
    timeout: 180_000,
  },
});
