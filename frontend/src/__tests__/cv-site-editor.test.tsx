import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";
import * as cvApi from "../api/cvApi";

vi.mock("../api/cvApi", async () => {
  const actual = await vi.importActual<typeof import("../api/cvApi")>("../api/cvApi");
  return {
    ...actual,
    getCvDetail: vi.fn(() =>
      Promise.resolve({
        id: 9,
        slug: "ada-cv",
        language: "it",
        template_slug: "default",
        is_published: true,
        original_filename: "cv.pdf",
        raw_json: {
          personal_info: { name: "Ada Lovelace", title: "Engineer" },
          summary: "Bio line",
          nordevit_editor: { accent: "violet", headline: "", tagline: "", summary: "" },
          work_experience_list: [{ period: "2020–2024", title: "Dev", subtitle: "ACME" }],
          education_list: [{ period: "2015", title: "MSc", subtitle: "Uni" }],
          skills: [{ name: "TypeScript", level: "N/A" }],
        },
        created_at: "",
        updated_at: "",
      }),
    ),
    updateCvData: vi.fn(() => Promise.resolve()),
  };
});

describe("CvSiteEditor", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("it");
    vi.clearAllMocks();
  });

  it("exposes preview region for accessibility after load", async () => {
    const { default: CvSiteEditor } = await import("../pages/CvSiteEditor");
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/it/cv/9/edit"]}>
          <Routes>
            <Route path="/:lang/cv/:cvId/edit" element={<CvSiteEditor />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>,
    );

    const previewRegion = await screen.findByRole("region", { name: /anteprima cv/i });
    expect(previewRegion).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /proprietà/i })).toBeInTheDocument();
    expect(await within(previewRegion).findByText("TypeScript")).toBeInTheDocument();
  });

  it("persists list edits via updateCvData", async () => {
    vi.mocked(cvApi.updateCvData).mockClear();
    const { default: CvSiteEditor } = await import("../pages/CvSiteEditor");
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/it/cv/9/edit"]}>
          <Routes>
            <Route path="/:lang/cv/:cvId/edit" element={<CvSiteEditor />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>,
    );

    const previewRegion = await screen.findByRole("region", { name: /anteprima cv/i });
    const titleInput = within(previewRegion).getByDisplayValue("Dev");
    fireEvent.change(titleInput, { target: { value: "Lead" } });

    await waitFor(
      () => {
        expect(cvApi.updateCvData).toHaveBeenCalled();
      },
      { timeout: 4000 },
    );

    const calls = vi.mocked(cvApi.updateCvData).mock.calls;
    const lastPayload = calls[calls.length - 1]?.[1] as Record<string, unknown>;
    expect(lastPayload?.work_experience_list).toEqual(
      expect.arrayContaining([expect.objectContaining({ title: "Lead", subtitle: "ACME" })]),
    );
    expect(Array.isArray(lastPayload?.skills)).toBe(true);
    expect(Array.isArray(lastPayload?.education_list)).toBe(true);
  });

  it("persists nordevit_editor density when changed from toolbar", async () => {
    vi.mocked(cvApi.updateCvData).mockClear();
    const { default: CvSiteEditor } = await import("../pages/CvSiteEditor");
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={["/it/cv/9/edit"]}>
          <Routes>
            <Route path="/:lang/cv/:cvId/edit" element={<CvSiteEditor />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>,
    );

    const densitySelect = await screen.findByLabelText(/densità scheda/i);
    fireEvent.change(densitySelect, { target: { value: "compact" } });

    await waitFor(
      () => {
        expect(cvApi.updateCvData).toHaveBeenCalled();
      },
      { timeout: 4000 },
    );

    const calls = vi.mocked(cvApi.updateCvData).mock.calls;
    const lastPayload = calls[calls.length - 1]?.[1] as Record<string, unknown>;
    const editor = lastPayload?.nordevit_editor as Record<string, unknown> | undefined;
    expect(editor?.density).toBe("compact");
  });
});
