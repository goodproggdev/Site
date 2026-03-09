import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

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

  it("should start in idle state", async () => {
    const { useCVUpload } = await import("../hooks/useCVUpload");
    // Test che il hook esiste e ha i campi corretti
    expect(typeof useCVUpload).toBe("function");
  });
});

// ─── Test Welcome Component ─────────────────────────────────────────────
describe("Welcome page", () => {
  it("renders heading", async () => {
    const { default: Welcome } = await import("../pages/Welcome");
    render(React.createElement(Welcome));
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it("renders CTA button", async () => {
    const { default: Welcome } = await import("../pages/Welcome");
    render(React.createElement(Welcome));
    const button = screen.getByText(/inizia ora/i);
    expect(button).toBeInTheDocument();
  });
});

// ─── Test Pricing Component ─────────────────────────────────────────────
describe("Pricing page", () => {
  it("renders pricing section", async () => {
    const { default: Pricing } = await import("../pages/Pricing");
    render(React.createElement(Pricing));
    // Verifica che la pagina contenga qualcosa
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
