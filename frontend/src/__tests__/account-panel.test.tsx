import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";

vi.mock("../api/cvApi", async () => {
  const actual = await vi.importActual<typeof import("../api/cvApi")>("../api/cvApi");
  return {
    ...actual,
    getUserDetails: vi.fn(() =>
      Promise.resolve({
        pk: 1,
        email: "user@example.com",
        first_name: "Ada",
        last_name: "Lovelace",
      }),
    ),
    patchUserDetails: vi.fn(),
    changePassword: vi.fn(),
  };
});

describe("AccountPanel", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("it");
    vi.clearAllMocks();
  });

  it("loads profile and renders password fields with correct autocomplete", async () => {
    const { default: AccountPanel } = await import("../features/settings/AccountPanel");
    render(
      <I18nextProvider i18n={i18n}>
        <AccountPanel />
      </I18nextProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/password attuale/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("textbox", { name: /email/i })).toHaveValue("user@example.com");
    expect(screen.getByLabelText(/password attuale/i)).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByLabelText(/^nuova password$/i)).toHaveAttribute("autocomplete", "new-password");
    expect(screen.getByLabelText(/conferma nuova password/i)).toHaveAttribute("autocomplete", "new-password");
  });
});
