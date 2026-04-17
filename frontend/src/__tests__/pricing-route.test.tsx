/**
 * Manuale — webhook Stripe in locale:
 * 1. stripe listen --forward-to localhost:8000/api/v1/stripe/webhook/
 * 2. Copiare il signing secret in STRIPE_WEBHOOK_SECRET (backend .env)
 * 3. In Stripe Dashboard → Webhook endpoint: abilitare checkout.session.completed,
 *    customer.subscription.updated e customer.subscription.deleted
 * 4. Completare un checkout di test e verificare entitlement / log Django
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Suspense } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";

describe("Pricing route (/it/pricing)", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("it");
  });

  it("renders pricing heading on dedicated page", async () => {
    const { default: PricingPage } = await import("../pages/PricingPage");
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/it/pricing"]}>
          <Routes>
            <Route
              path="/:lang/pricing"
              element={
                <Suspense fallback={null}>
                  <PricingPage />
                </Suspense>
              }
            />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>,
    );

    const heading = await screen.findByRole("heading", {
      name: /paghi quando pubblichi online/i,
      level: 2,
    });
    expect(heading).toBeInTheDocument();

    const dash = screen.getByRole("link", { name: /dashboard/i });
    expect(dash).toHaveAttribute("href", "/it/dashboard");
  });
});
