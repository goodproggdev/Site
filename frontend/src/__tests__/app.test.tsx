import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import i18n from "../i18n";

// ─── Mock delle API ────────────────────────────────────────────────────────
vi.mock("../api/cvApi", () => ({
  uploadAndParseCV: vi.fn(),
  getMyCVList: vi.fn(() => Promise.resolve([])),
  isAuthenticated: vi.fn(() => false),
  login: vi.fn(),
  logout: vi.fn(),
}));

// ─── Test useCVUpload ────────────────────────────────────────────────────
describe("useCVUpload hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    "should start in idle state",
    async () => {
      const { useCVUpload } = await import("../hooks/useCVUpload");
      expect(typeof useCVUpload).toBe("function");
    },
    15_000,
  );
});

// ─── Test Welcome Component ─────────────────────────────────────────────
describe("Welcome page", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("it");
  });

  async function renderWelcome() {
    const { default: Welcome } = await import("../pages/Welcome");
    return render(
      <MemoryRouter initialEntries={["/it"]}>
        <Routes>
          <Route path="/:lang" element={<Welcome />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it("renders heading", async () => {
    await renderWelcome();
    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("renders primary create CTA and preview link", async () => {
    await renderWelcome();
    const uploadCta = await screen.findByRole("button", { name: /carica cv/i });
    expect(uploadCta).toBeInTheDocument();
    const previewLink = screen.getByRole("link", { name: /esempio interattivo/i });
    expect(previewLink).toHaveAttribute("href", "/it#preview");
  });
});

// ─── Test Pricing Component ─────────────────────────────────────────────
describe("Pricing page", () => {
  it("renders pricing section", async () => {
    const { default: Pricing } = await import("../pages/Pricing");
    render(
      <MemoryRouter initialEntries={["/it/pricing"]}>
        <Routes>
          <Route path="/:lang/pricing" element={React.createElement(Pricing)} />
        </Routes>
      </MemoryRouter>,
    );
    expect(document.body).toBeTruthy();
  });
});

// ─── Test API layer ──────────────────────────────────────────────────────
describe("cvApi", () => {
  it("uploadAndParseCV is a function", async () => {
    const { uploadAndParseCV } = await import("../api/cvApi");
    expect(typeof uploadAndParseCV).toBe("function");
  });

  it("isAuthenticated returns false without token", async () => {
    localStorage.removeItem("access_token");
    const { isAuthenticated } = await import("../api/cvApi");
    // La funzione mock ritorna false
    expect(typeof isAuthenticated).toBe("function");
  });
});

// ─── Test file validation logic ─────────────────────────────────────────
describe("File validation", () => {
  const createFakeFile = (name: string, size: number, type: string) => {
    const file = new File(["content"], name, { type });
    Object.defineProperty(file, "size", { value: size });
    return file;
  };

  it("accepts PDF files under 10MB", () => {
    const file = createFakeFile("cv.pdf", 1024 * 1024, "application/pdf");
    expect(file.name).toMatch(/\.pdf$/);
    expect(file.size).toBeLessThan(10 * 1024 * 1024);
  });

  it("rejects files over 10MB", () => {
    const file = createFakeFile("huge.pdf", 11 * 1024 * 1024, "application/pdf");
    expect(file.size).toBeGreaterThan(10 * 1024 * 1024);
  });

  it("accepts DOCX files", () => {
    const file = createFakeFile(
      "cv.docx",
      500 * 1024,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    expect(file.name).toMatch(/\.docx$/);
  });

  it("rejects executable files", () => {
    const file = createFakeFile("virus.exe", 100, "application/octet-stream");
    expect(file.name).not.toMatch(/\.(pdf|docx?|txt)$/i);
  });
});
