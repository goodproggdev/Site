import { test, expect } from "@playwright/test";
import { seedAcceptedConsent } from "./consent";

test.beforeEach(async ({ page }) => {
  await seedAcceptedConsent(page);
});

function apiBaseUrl(): string {
  const raw = (process.env.E2E_API_BASE_URL || "http://127.0.0.1:8000").trim();
  return raw.replace(/\/$/, "");
}

test.describe("Login account demo (API raggiungibile)", () => {
  test("JWT preflight → token in localStorage → dashboard", async ({ page, request }) => {
    test.skip(
      process.env.E2E_SKIP_AUTH_LOGIN === "1" || process.env.E2E_SKIP_AUTH_LOGIN === "true",
      "E2E_SKIP_AUTH_LOGIN: salta login (es. CI senza backend)",
    );

    const email = process.env.E2E_TEST_EMAIL?.trim();
    const password = process.env.E2E_TEST_PASSWORD;
    test.skip(!email || !password, "Imposta E2E_TEST_EMAIL e E2E_TEST_PASSWORD (o defaults in playwright.config)");

    const api = apiBaseUrl();
    let tokenStatus = 0;
    let tokenBody = "";
    try {
      const tokenRes = await request.post(`${api}/auth/token/`, {
        data: { email, password },
        headers: { "Content-Type": "application/json" },
      });
      tokenStatus = tokenRes.status();
      tokenBody = (await tokenRes.text()).slice(0, 500);
    } catch (err) {
      test.skip(
        true,
        `Backend non raggiungibile su ${api} (avvia Django). Dettaglio: ${String(err)}`,
      );
    }
    if (tokenStatus !== 200) {
      const soft = [400, 401, 403].includes(tokenStatus);
      test.skip(
        soft,
        `Login API su ${api} non OK (HTTP ${tokenStatus}). Controlla utente, password e email verificata. Risposta: ${tokenBody}`,
      );
      throw new Error(`Preflight login HTTP ${tokenStatus}: ${tokenBody}`);
    }

    const tokens = JSON.parse(tokenBody) as { access: string; refresh: string };
    await page.addInitScript(
      ([access, refresh]) => {
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
        localStorage.setItem("cookie-consent", "accepted");
      },
      [tokens.access, tokens.refresh],
    );

    await page.goto("/it/dashboard");
    await expect(page).toHaveURL(/\/it\/dashboard/);
    await expect(page.getByRole("heading", { name: /Bentornato/i })).toBeVisible({ timeout: 25_000 });
  });

  test("modale Accedi → Login (browser; richiede CORS per :4173)", async ({ page, request }) => {
    test.skip(
      process.env.E2E_UI_LOGIN !== "1" && process.env.E2E_UI_LOGIN !== "true",
      "Imposta E2E_UI_LOGIN=1 per questo test (axios dal browser; il backend deve consentire l’origine vite preview, es. http://127.0.0.1:4173).",
    );
    test.skip(
      process.env.E2E_SKIP_AUTH_LOGIN === "1" || process.env.E2E_SKIP_AUTH_LOGIN === "true",
      "E2E_SKIP_AUTH_LOGIN",
    );

    const email = process.env.E2E_TEST_EMAIL?.trim();
    const password = process.env.E2E_TEST_PASSWORD;
    test.skip(!email || !password, "E2E_TEST_EMAIL / E2E_TEST_PASSWORD");

    const api = apiBaseUrl();
    try {
      const tokenRes = await request.post(`${api}/auth/token/`, {
        data: { email, password },
        headers: { "Content-Type": "application/json" },
      });
      if (!tokenRes.ok()) {
        test.skip(true, `Preflight HTTP ${tokenRes.status()}`);
      }
    } catch (err) {
      test.skip(true, `Backend non raggiungibile: ${String(err)}`);
    }

    await page.goto("/it");
    await page.getByRole("button", { name: /^Accedi$/i }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.locator("#login-email").fill(email);
    await page.locator("#login-password").fill(password);
    await page.getByRole("button", { name: /^Login$/i }).click();
    await expect(page).toHaveURL(/\/it\/dashboard/, { timeout: 45_000 });
    await expect(page.getByRole("heading", { name: /Bentornato/i })).toBeVisible({ timeout: 20_000 });
  });
});
