import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import type { CVStepProps } from './CVWizard';
import { uploadAndParseCV } from '../../api/cvApi';
import type { ParseCVResponse } from '../../api/types';

interface CVUploadStepProps extends CVStepProps {}

export default function CVUploadStep({ cvData, updateCVData, onNext }: CVUploadStepProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(t('errors.upload.tooLarge'));
      return;
    }
    setUploadError(null);
    setIsUploading(true);
    updateCVData({ uploadedFile: file });
    try {
      const result: ParseCVResponse = await uploadAndParseCV(file);
      updateCVData({
        uploadedFile: file,
        cvId: result.cv_id,
        parsedData: result as unknown as Record<string, unknown>,
      });
      onNext();
    } catch {
      setUploadError(t('errors.upload.generic'));
    } finally {
      setIsUploading(false);
    }
  }, [updateCVData, onNext, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  return (
    <div className="text-center max-w-xl mx-auto">
      <h2 className="heading-sm mb-4 dark:text-white">
        {t('builder.upload.title')}
      </h2>
      <p className="text-body mb-8">
        {t('builder.upload.description')}
      </p>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 transition-all cursor-pointer ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : cvData.uploadedFile
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
      >
        <input {...getInputProps()} />

        {cvData.uploadedFile ? (
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

      {isUploading && (
        <div className="mt-4 flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm font-medium">{t('common.loading')}</span>
        </div>
      )}

      {uploadError && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{uploadError}</p>
      )}

      {cvData.uploadedFile && !isUploading && (
        <button
          onClick={() => { updateCVData({ uploadedFile: null, cvId: null, parsedData: null }); setUploadError(null); }}
          className="btn-ghost mt-4 text-sm"
        >
          {t('builder.upload.remove', 'Rimuovi file')}
        </button>
      )}
    </div>
  );
}