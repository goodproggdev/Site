import { useState, useEffect, useCallback } from "react";
import { Modal, FileInput, Label, Button } from "flowbite-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { uploadAndParseCV, isAuthenticated } from "../api/cvApi";
import { formatAndLocalizeDrfErrors } from "../utils/apiErrorI18n";

type GuestPhase = "idle" | "scanning" | "gate";

interface UploadButtonProps {
  buttonClassName?: string;
  buttonText?: string;
}

const GUEST_SCAN_MS = 2800;

const UploadButton: React.FC<UploadButtonProps> = ({
  buttonClassName = "btn-secondary",
  buttonText,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang = "it" } = useParams<{ lang?: string }>();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestPhase, setGuestPhase] = useState<GuestPhase>("idle");
  const [fakeProgress, setFakeProgress] = useState(0);

  const displayText = buttonText || t("welcome.cta.primary");

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  const resetGuestDemo = useCallback(() => {
    setGuestPhase("idle");
    setFakeProgress(0);
  }, []);

  const openModal = useCallback(() => {
    resetGuestDemo();
    setError(null);
    setFile(null);
    setIsOpen(true);
  }, [resetGuestDemo]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && (allowedTypes.includes(selectedFile.type) || selectedFile.name.match(/\.(pdf|docx?|txt)$/i))) {
      setFile(selectedFile);
      setError(null);
      resetGuestDemo();
    } else {
      setError(t("components.uploadButton.alerts.unsupportedFormat"));
      setFile(null);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError(t("components.uploadButton.alerts.selectFile"));
      return;
    }

    if (!isAuthenticated()) {
      setError(null);
      setGuestPhase("scanning");
      setFakeProgress(0);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const data = await uploadAndParseCV(file);
      if (data.error) {
        setError(typeof data.error === "string" ? data.error : t("components.uploadButton.alerts.error"));
        return;
      }
      const rawId = (data as { cv_id?: unknown }).cv_id;
      const cvId =
        typeof rawId === "number"
          ? rawId
          : typeof rawId === "string"
            ? Number.parseInt(rawId, 10)
            : NaN;
      setIsOpen(false);
      setFile(null);
      resetGuestDemo();
      if (Number.isFinite(cvId)) {
        navigate(`/${lang}/builder?cvId=${cvId}`, { replace: false });
      } else {
        navigate(`/${lang}/builder`, { replace: false });
      }
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.data) {
        setError(formatAndLocalizeDrfErrors(e.response.data, t));
      } else {
        setError(t("components.uploadButton.alerts.error"));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setFile(null);
    setError(null);
    resetGuestDemo();
  }, [resetGuestDemo]);

  /** Chiude il modale upload prima di aprire login/registrazione così la modale auth resta in primo piano. */
  const openAuthAndClose = useCallback(
    (eventName: "open-login" | "open-signup") => {
      handleClose();
      queueMicrotask(() => window.dispatchEvent(new CustomEvent(eventName)));
    },
    [handleClose],
  );

  useEffect(() => {
    if (guestPhase !== "scanning") return;

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / GUEST_SCAN_MS) * 100);
      setFakeProgress(pct);
      if (elapsed < GUEST_SCAN_MS) {
        raf = requestAnimationFrame(tick);
      } else {
        setFakeProgress(100);
        setGuestPhase("gate");
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [guestPhase]);

  useEffect(() => {
    const onOpen = () => openModal();
    window.addEventListener("open-landing-upload", onOpen);
    return () => window.removeEventListener("open-landing-upload", onOpen);
  }, [openModal]);

  const guestScanning = !isAuthenticated() && guestPhase === "scanning";
  const guestGate = !isAuthenticated() && guestPhase === "gate";

  const demoStepKey =
    fakeProgress < 34 ? "demoStep1" : fakeProgress < 67 ? "demoStep2" : "demoStep3";
  const demoStepLabel = t(`components.uploadButton.${demoStepKey}`);

  return (
    <>
      <button type="button" onClick={() => openModal()} className={buttonClassName}>
        {displayText}
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </button>

      <Modal show={isOpen} onClose={handleClose} size="md">
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("components.uploadButton.title")}
          </h3>
        </Modal.Header>

        <Modal.Body className="space-y-4">
          {!isAuthenticated() && guestPhase === "idle" ? (
            <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
              {t("components.uploadButton.demoHint")}
            </p>
          ) : null}

          {guestGate ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t("components.uploadButton.demoCompleteTitle")}
                </h4>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {t("components.uploadButton.demoCompleteBody")}
                </p>
                {file ? (
                  <p className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">{file.name}</p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button type="button" color="indigo" onClick={() => openAuthAndClose("open-login")}>
                  {t("auth.login.title")}
                </Button>
                <Button type="button" color="gray" onClick={() => openAuthAndClose("open-signup")}>
                  {t("auth.signup.title")}
                </Button>
              </div>
            </div>
          ) : guestScanning ? (
            <div className="space-y-4 py-2" aria-busy="true" aria-live="polite">
              <p className="text-center text-sm font-medium text-gray-900 dark:text-white">
                {t("components.uploadButton.demoScanning")}
              </p>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">{demoStepLabel}</p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-[width] duration-75 ease-out dark:bg-indigo-500"
                  style={{ width: `${fakeProgress}%` }}
                />
              </div>
              {file ? (
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">{file.name}</p>
              ) : null}
            </div>
          ) : (
            <>
              <div className="flex w-full items-center justify-center">
                <Label
                  htmlFor="dropzone-file"
                  className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 ${
                    file
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    {file ? (
                      <>
                        <svg
                          className="mb-3 h-10 w-10 text-indigo-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{file.name}</p>
                        <p className="mt-1 text-xs text-gray-500">{t("components.uploadButton.dropzone.change")}</p>
                      </>
                    ) : (
                      <>
                        <svg
                          className="mb-3 h-10 w-10 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-semibold">{t("components.uploadButton.dropzone.click")}</span>{" "}
                          {t("components.uploadButton.dropzone.drag")}
                        </p>
                        <p className="text-xs text-gray-500">{t("components.uploadButton.dropzone.hint")}</p>
                      </>
                    )}
                  </div>
                  <FileInput
                    id="dropzone-file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt"
                  />
                </Label>
              </div>

              {file ? (
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ) : null}
            </>
          )}

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
        </Modal.Body>

        <Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex w-full flex-wrap justify-end gap-3">
            <button type="button" onClick={handleClose} className="btn-ghost">
              {t("components.uploadButton.buttons.cancel")}
            </button>
            {guestGate ? (
              <button type="button" onClick={() => resetGuestDemo()} className="btn-secondary">
                {t("components.uploadButton.buttons.tryAnother")}
              </button>
            ) : null}
            {!guestGate ? (
              <button
                type="button"
                onClick={() => void handleFileUpload()}
                disabled={!file || isUploading || guestScanning}
                className="btn-primary"
              >
                {isUploading || guestScanning ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {guestScanning
                      ? t("components.uploadButton.buttons.scanningDemo")
                      : t("components.uploadButton.buttons.uploading")}
                  </>
                ) : (
                  t("components.uploadButton.buttons.analyze")
                )}
              </button>
            ) : null}
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UploadButton;
