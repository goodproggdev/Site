/**
 * Custom hook per il caricamento e parsing di un CV.
 */
import { useState, useCallback } from "react";
import i18n from "../i18n";
import { uploadAndParseCV } from "../api/cvApi";
import { localizeBackendErrors } from "../utils/apiErrorI18n";
import type { ParseCVResponse } from "../api/types";

type UploadState = "idle" | "uploading" | "success" | "error";

interface UseCVUploadReturn {
  state: UploadState;
  result: ParseCVResponse | null;
  error: string | null;
  progress: number;
  upload: (file: File) => Promise<void>;
  reset: () => void;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
];
const MAX_SIZE_MB = 10;

export function useCVUpload(): UseCVUploadReturn {
  const [state, setState] = useState<UploadState>("idle");
  const [result, setResult] = useState<ParseCVResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(async (file: File) => {
    // Validazione client-side
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|docx?|txt)$/i)) {
      setError(i18n.t("errors.upload.invalidType"));
      setState("error");
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
      setError(
        i18n.t("errors.upload.fileTooLarge", {
          size: sizeMB.toFixed(1),
          max: MAX_SIZE_MB,
        }),
      );
      setState("error");
      return;
    }

    setState("uploading");
    setError(null);
    setProgress(10);

    try {
      setProgress(30);
      const data = await uploadAndParseCV(file);
      setProgress(100);

      if (data.error) {
        setError(localizeBackendErrors(String(data.error), i18n.t));
        setState("error");
      } else {
        setResult(data);
        setState("success");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : i18n.t("errors.upload.generic");
      setError(localizeBackendErrors(message, i18n.t));
      setState("error");
    } finally {
      setProgress(0);
    }
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  return { state, result, error, progress, upload, reset };
}
