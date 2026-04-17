import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Carica `frontend/.env.e2e` in `process.env` (senza dipendenza dotenv).
 * Chiamare all’avvio di `playwright.config.ts`.
 */
export function loadE2eDotenv(frontendRoot: string) {
  const path = join(frontendRoot, ".env.e2e");
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key) process.env[key] = val;
  }
}
