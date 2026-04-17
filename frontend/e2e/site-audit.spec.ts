import { test, expect } from "@playwright/test";
import { seedAcceptedConsent } from "./consent";

test.beforeEach(async ({ page }) => {
  await seedAcceptedConsent(page);
});

test.describe("Pagine pubbliche (it)", () => {
  test("home: carica e apre modal Accedi", async ({ page }) => {
    await page.goto("/it");
    await expect(page.locator("main")).toBeVisible();
    await page.getByRole("button", { name: /^Accedi$/i }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await page.getByRole("button", { name: /^Chiudi$/i }).click();
  });

  test("footer: Privacy e Termini navigano", async ({ page }) => {
    await page.goto("/it");
    await page.getByRole("link", { name: /privacy/i }).first().click();
    await expect(page).toHaveURL(/\/it\/privacy/);
    await page.goto("/it");
    await page.getByRole("link", { name: /termini|terms/i }).first().click();
    await expect(page).toHaveURL(/\/it\/terms/);
  });

  test("footer / nav: Prezzi", async ({ page }) => {
    await page.goto("/it");
    await page.getByRole("link", { name: /prezzi|pricing/i }).first().click();
    await expect(page).toHaveURL(/\/it\/pricing/);
  });

  test("forgot-password: pagina e campo email", async ({ page }) => {
    await page.goto("/it/forgot-password");
    await expect(page.getByRole("textbox").first()).toBeVisible();
  });

  test("reset-password: pagina (senza token)", async ({ page }) => {
    await page.goto("/it/reset-password");
    await expect(page.locator("main")).toBeVisible();
  });

  test("verify-email: pagina", async ({ page }) => {
    await page.goto("/it/verify-email");
    await expect(page.locator("main")).toBeVisible();
  });

  test("payment success: pagina e CTA verso dashboard (poi redirect guest)", async ({
    page,
  }) => {
    await page.goto("/it/payment/success");
    await expect(
      page.getByRole("heading", { name: /pagamento confermato|payment|success/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /dashboard/i }).click();
    await expect(page).toHaveURL(/\/it\/dashboard/);
    await expect(page).toHaveURL(/\/it\/?$/);
  });

  test("builder: wizard step upload visibile", async ({ page }) => {
    await page.goto("/it/builder");
    await expect(page.locator("main")).toBeVisible();
  });

  test("builder: link torna alla dashboard", async ({ page }) => {
    await page.goto("/it/builder");
    await page.getByRole("link", { name: /torna alla dashboard/i }).click();
    await expect(page).toHaveURL(/\/it\/?$/);
  });

  test("dashboard senza login: redirect verso home", async ({ page }) => {
    await page.goto("/it/dashboard");
    await expect(page).toHaveURL(/\/it\/?$/);
  });

  test("slug pubblico inesistente: messaggio errore", async ({ page }) => {
    await page.goto("/u/questo-slug-non-esiste-zzzzzz/");
    await expect(page.getByText(/non trovat|not found|pagina non trovata/i).first()).toBeVisible({ timeout: 15_000 });
  });

  test("settings: tablist e cambio tab Privacy / Abbonamento", async ({ page }) => {
    await page.goto("/it/settings");
    await expect(page.getByRole("heading", { name: /^Impostazioni$/ })).toBeVisible();
    const tablist = page.getByRole("tablist", { name: /^Impostazioni$/ });
    await expect(tablist).toBeVisible();
    await tablist.getByRole("tab", { name: /privacy cv/i }).click();
    await expect(page.getByRole("heading", { name: /privacy e link cv/i })).toBeVisible();
    await tablist.getByRole("tab", { name: /^Abbonamento$/ }).click();
    await expect(page.getByRole("heading", { name: /abbonamento e pagamenti/i })).toBeVisible();
  });

  test("cv editor: id non numerico mostra errore validazione", async ({ page }) => {
    await page.goto("/it/cv/not-a-number/edit");
    await expect(page.getByText(/ID CV non valido/i)).toBeVisible({ timeout: 10_000 });
  });

  test("home: hash #home mostra la sezione hero", async ({ page }) => {
    await page.goto("/it/#home");
    await expect(page.locator("#home")).toBeVisible();
    await expect(page.locator("#home")).toBeInViewport();
  });
});

test.describe("EN", () => {
  test("home en carica", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("main")).toBeVisible();
  });
});
