import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import type { CVStepProps } from './CVWizard';
import { uploadAndParseCV } from '../../api/cvApi';
import { trackEvent } from '../../analytics/ga4';
import { rawJsonToWizardCvData } from '../../utils/cvRawJsonMap';
import { formatAndLocalizeDrfErrors, localizeBackendErrors } from '../../utils/apiErrorI18n';
import { shouldShowPdfNoTextLayerWarning } from './cvExtractionWarnings';

interface CVUploadStepProps extends CVStepProps {}

export default function CVUploadStep({ cvData, updateCVData, onNext }: CVUploadStepProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  /** File scelto in UI durante l’upload (non “successo” finché il server non risponde OK). */
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(t('errors.upload.tooLarge'));
      return;
    }
    setUploadError(null);
    setPendingFile(file);
    setIsUploading(true);
    try {
      const result = await uploadAndParseCV(file);
      if (result.error) {
        setUploadError(localizeBackendErrors(String(result.error), t));
        updateCVData({ uploadedFile: null, cvId: null, parsedData: null });
        return;
      }
      const rawId = result.cv_id;
      const cvId =
        typeof rawId === "number"
          ? rawId
          : typeof rawId === "string"
            ? Number.parseInt(rawId, 10)
            : undefined;
      const rawPayload = { ...(result as unknown as Record<string, unknown>) };
      delete rawPayload.cv_id;
      delete rawPayload.slug;
      const fromParse = rawJsonToWizardCvData(rawPayload);
      updateCVData({
        uploadedFile: file,
        cvId: Number.isFinite(cvId) ? cvId : undefined,
        parsedData: rawPayload,
        personalInfo: { ...(fromParse.personalInfo ?? {}) },
        experience: (fromParse.experience as unknown[]) ?? [],
        education: (fromParse.education as unknown[]) ?? [],
        skills: fromParse.skills ?? [],
      });
      setPendingFile(null);
      trackEvent('cv_upload_success', { has_cv_id: Number.isFinite(cvId) });
      onNext();
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.data) {
        setUploadError(formatAndLocalizeDrfErrors(e.response.data, t));
      } else {
        setUploadError(t('errors.upload.generic'));
      }
      updateCVData({ uploadedFile: null, cvId: null, parsedData: null });
    } finally {
      setIsUploading(false);
      setPendingFile(null);
    }
  }, [updateCVData, onNext, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  const showPdfTextWarning = shouldShowPdfNoTextLayerWarning(cvData);

  return (
    <div className="text-center max-w-xl mx-auto">
      {showPdfTextWarning && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
        >
          <p className="font-medium">{t('builder.upload.extractionWarningPdfNoText')}</p>
          <p className="mt-1 text-amber-900/90 dark:text-amber-200/90">{t('builder.upload.extractionWarningPdfNoTextHint')}</p>
        </div>
      )}
      <h2 className="heading-sm mb-4 dark:text-white">
        {t('builder.upload.title')}
      </h2>
      <p className="text-body mb-8">
        {t('builder.upload.description')}
      </p>
      <p className="text-body-sm mb-6 text-gray-600 dark:text-gray-400">{t('builder.upload.skipFileHint')}</p>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 transition-all cursor-pointer ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : isUploading && pendingFile
              ? 'border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/30'
              : cvData.uploadedFile && cvData.cvId
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
      >
        <input {...getInputProps()} />

        {isUploading && pendingFile ? (
          <div className="flex flex-col items-center gap-3 text-amber-800 dark:text-amber-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
              <svg className="h-6 w-6 animate-spin text-amber-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <span className="font-medium">{pendingFile.name}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{(pendingFile.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        ) : cvData.uploadedFile && cvData.cvId ? (
          <div className="flex flex-col items-center gap-3 text-green-600">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium">{cvData.uploadedFile.name}</span>
            <span className="text-sm text-gray-500">{(cvData.uploadedFile.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              {t('builder.upload.dropzone')}
            </p>
            <p className="text-sm text-gray-400">
              {t('builder.upload.formats')}
            </p>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{uploadError}</p>
      )}

      {cvData.uploadedFile && cvData.cvId && !isUploading && (
        <button
          onClick={() => {
            updateCVData({ uploadedFile: null, cvId: null, parsedData: null });
            setUploadError(null);
            setPendingFile(null);
          }}
          className="btn-ghost mt-4 text-sm"
        >
          {t('builder.upload.remove', 'Rimuovi file')}
        </button>
      )}
    </div>
  );
}