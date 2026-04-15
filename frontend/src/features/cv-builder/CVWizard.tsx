import { useState, lazy, Suspense, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Progress } from 'flowbite-react';
import { getCvDetail, updateCvData } from '../../api/cvApi';
import { apiCvRecordToWizard, mergeWizardIntoRawJson } from '../../utils/cvRawJsonMap';

// Lazy load steps for better performance
const CVUploadStep = lazy(() => import('./CVUploadStep'));
const CVFormStep = lazy(() => import('./CVFormStep'));
const CVPreviewStep = lazy(() => import('./CVPreviewStep'));
const CVPublishStep = lazy(() => import('./CVPublishStep'));

// Common CV data interface shared across all steps
export interface CVData {
  personalInfo: Record<string, string>;
  experience: unknown[];
  education: unknown[];
  skills: string[];
  uploadedFile?: File | null;
  parsedData?: Record<string, unknown> | null;
  cvId?: number | null;
}

interface CVWizardProps {
  onComplete?: () => void;
  /** Se impostato, carica il CV dal server e apre il passo modifica (salvataggi automatici). */
  initialCvId?: number | null;
}

// Step props interface
export interface CVStepProps {
  cvData: CVData;
  updateCVData: (data: Partial<CVData>) => void;
  onNext: () => void;
}

export default function CVWizard({ onComplete, initialCvId = null }: CVWizardProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {},
    experience: [],
    education: [],
    skills: [],
    uploadedFile: null,
    parsedData: null,
    cvId: null,
  });
  const rawBaseRef = useRef<Record<string, unknown>>({});
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (!initialCvId) return;
    let cancelled = false;
    (async () => {
      try {
        const rec = await getCvDetail(initialCvId);
        if (cancelled) return;
        const base = { ...((rec.raw_json || {}) as Record<string, unknown>) };
        rawBaseRef.current = base;
        setCvData((prev) => apiCvRecordToWizard(rec, prev));
        setCurrentStep(1);
      } catch {
        if (!cancelled) setAutosaveStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialCvId]);

  const persistDraft = useCallback(async (draft: CVData) => {
    const id = draft.cvId;
    if (!id) return;
    const merged = mergeWizardIntoRawJson({ ...rawBaseRef.current }, draft);
    rawBaseRef.current = merged;
    setAutosaveStatus('saving');
    try {
      await updateCvData(id, merged);
      setAutosaveStatus('saved');
      window.setTimeout(() => setAutosaveStatus('idle'), 2000);
    } catch {
      setAutosaveStatus('error');
    }
  }, []);

  const steps = [
    { id: 'upload', label: t('builder.steps.upload'), component: CVUploadStep },
    { id: 'edit', label: t('builder.steps.edit'), component: CVFormStep },
    { id: 'preview', label: t('builder.steps.preview'), component: CVPreviewStep },
    { id: 'publish', label: t('builder.steps.publish'), component: CVPublishStep },
  ];

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete?.();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateCVData = (newData: Partial<CVData>) => {
    setCvData((prev) => {
      const next = { ...prev, ...newData };
      if (newData.parsedData && typeof newData.parsedData === 'object' && newData.cvId) {
        rawBaseRef.current = { ...(newData.parsedData as Record<string, unknown>) };
      }
      if (next.cvId) {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => void persistDraft(next), 900);
      }
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {cvData.cvId ? (
        <p className="mb-2 text-right text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
          {autosaveStatus === 'saving' ? t('builder.autosave.saving') : null}
          {autosaveStatus === 'saved' ? t('builder.autosave.saved') : null}
          {autosaveStatus === 'error' ? t('builder.autosave.error') : null}
        </p>
      ) : null}
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <span
              key={step.id}
              className={`text-sm font-medium ${
                index <= currentStep ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          ))}
        </div>
        <Progress progress={progress} size="sm" color="indigo" />
      </div>

      {/* Step content with lazy loading */}
      <div className="min-h-[400px]">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        }>
          <CurrentStepComponent
            cvData={cvData}
            updateCVData={updateCVData}
            onNext={handleNext}
          />
        </Suspense>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <Button
          color="light"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          {t('common.back')}
        </Button>
        <Button
          color="indigo"
          onClick={handleNext}
        >
          {currentStep === steps.length - 1 ? t('common.finish') : t('common.next')}
        </Button>
      </div>
    </div>
  );
}
