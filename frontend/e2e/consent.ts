import type { Page } from "@playwright/test";

/** Evita che il banner cookie copra bottoni e link nei test. */
export async function seedAcceptedConsent(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("cookie-consent", "accepted");
  });
}
