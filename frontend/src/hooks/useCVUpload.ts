/**
 * Custom hook per il caricamento e parsing di un CV.
 */
import { useState, useCallback } from "react";
import { uploadAndParseCV } from "../api/cvApi";
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
      setError("Tipo file non supportato. Usa PDF, DOCX o TXT.");
      setState("error");
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
      setError(`File troppo grande (${sizeMB.toFixed(1)}MB). Limite: ${MAX_SIZE_MB}MB.`);
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
        setError(data.error);
        setState("error");
      } else {
        setResult(data);
        setState("success");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Errore durante il caricamento.";
      setError(message);
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
