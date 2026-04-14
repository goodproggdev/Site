import { useState, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Progress } from 'flowbite-react';

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
}

// Step props interface
export interface CVStepProps {
  cvData: CVData;
  updateCVData: (data: Partial<CVData>) => void;
  onNext: () => void;
}

export default function CVWizard({ onComplete }: CVWizardProps) {
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
    setCvData(prev => ({ ...prev, ...newData }));
  };

  return (
    <div className="max-w-4xl mx-auto">
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
