import { useState } from "react";
import { Modal, FileInput, Label } from "flowbite-react";
import { useTranslation } from "react-i18next";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

interface UploadButtonProps {
  buttonClassName?: string;
  buttonText?: string;
}

const UploadButton: React.FC<UploadButtonProps> = ({
  buttonClassName = "btn-secondary",
  buttonText,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const displayText = buttonText || t('welcome.cta.secondary');

  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      alert(t('components.uploadButton.alerts.unsupportedFormat'));
      setFile(null);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert(t('components.uploadButton.alerts.selectFile'));
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/api/v1/upload/`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || t('components.uploadButton.alerts.success'));
        setIsOpen(false);
        setFile(null);
      } else {
        alert(t('components.uploadButton.alerts.error'));
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(t('components.uploadButton.alerts.error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFile(null);
  };

  return (
    <>
      {/* Trigger Button - Using Design System */}
      <button onClick={() => setIsOpen(true)} className={buttonClassName}>
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

      {/* Upload Modal */}
      <Modal show={isOpen} onClose={handleClose} size="md">
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('components.uploadButton.title')}
          </h3>
        </Modal.Header>

        <Modal.Body className="space-y-4">
          {/* Dropzone */}
          <div className="flex w-full items-center justify-center">
            <Label
              htmlFor="dropzone-file"
              className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 ${
                file
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
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
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {file.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('components.uploadButton.dropzone.change')}
                    </p>
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
                      <span className="font-semibold">{t('components.uploadButton.dropzone.click')}</span>{" "}
                      {t('components.uploadButton.dropzone.drag')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t('components.uploadButton.dropzone.hint')}
                    </p>
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

          {/* File Info */}
          {file && (
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
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
          )}
        </Modal.Body>

        <Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex w-full justify-end gap-3">
            <button onClick={handleClose} className="btn-ghost">
              {t('components.uploadButton.buttons.cancel')}
            </button>
            <button
              onClick={handleFileUpload}
              disabled={!file || isUploading}
              className="btn-primary"
            >
              {isUploading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t('components.uploadButton.buttons.uploading')}
                </>
              ) : (
                t('components.uploadButton.buttons.analyze')
              )}
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UploadButton;
