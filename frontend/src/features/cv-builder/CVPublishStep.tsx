import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Label, TextInput } from 'flowbite-react';
import Toggle from '../../components/Toggle';
import type { CVStepProps } from './CVWizard';
import { updateCVLinkPolicy } from '../../api/cvApi';

interface CVPublishStepProps extends Omit<CVStepProps, 'updateCVData' | 'onNext'> {}

export default function CVPublishStep({ cvData }: CVPublishStepProps) {
  const { t } = useTranslation();
  const [isPublic, setIsPublic] = useState(true);
  const [expiryMonths, setExpiryMonths] = useState(12);
  const [customSlug, setCustomSlug] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [cvUrl, setCvUrl] = useState('');

  const handlePublish = async () => {
    if (!cvData.cvId) {
      setPublishError(t('builder.publish.errorNoCvId', 'CV non trovato. Ricarica il file.'));
      return;
    }
    setIsPublishing(true);
    setPublishError(null);
    try {
      await updateCVLinkPolicy(
        cvData.cvId,
        isPublic ? 'public_with_expiry' : 'private_tokenized',
        expiryMonths,
      );
      const slug = (cvData.parsedData?.slug as string | undefined) ?? customSlug;
      setCvUrl(`${window.location.origin}/u/${slug}`);
      setPublished(true);
    } catch {
      setPublishError(t('errors.upload.generic'));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cvUrl);
  };

  if (published) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('builder.publish.success')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('builder.publish.successMessage')}
        </p>

        <Card className="max-w-md mx-auto mb-6">
          <Label value={t('builder.publish.linkLabel')} />
          <div className="flex gap-2 mt-2">
            <TextInput value={cvUrl} readOnly className="flex-1" />
            <Button color="light" onClick={handleCopyLink}>
              {t('builder.publish.copy')}
            </Button>
          </div>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button color="light" onClick={() => window.open(cvUrl, '_blank')}>
            {t('builder.publish.view')}
          </Button>
          <Button color="indigo">
            {t('builder.publish.share')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t('builder.steps.publish')}
      </h2>

      <div className="space-y-6 max-w-lg">
        {/* Visibility toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label value={t('builder.publish.visibility.label')} />
            <p className="text-sm text-gray-500">{t('builder.publish.visibility.hint')}</p>
          </div>
          <Toggle
            checked={isPublic}
            onChange={setIsPublic}
          />
        </div>

        {/* Expiry */}
        {isPublic && (
          <div>
            <Label htmlFor="expiry" value={t('builder.publish.expiry')} />
            <select
              id="expiry"
              value={expiryMonths}
              onChange={(e) => setExpiryMonths(Number(e.target.value))}
              className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value={3}>3 {t('settings.privacy.expiry.months')}</option>
              <option value={6}>6 {t('settings.privacy.expiry.months')}</option>
              <option value={12}>12 {t('settings.privacy.expiry.months')}</option>
              <option value={24}>24 {t('settings.privacy.expiry.months')}</option>
            </select>
          </div>
        )}

        {/* Custom slug */}
        <div>
          <Label htmlFor="slug" value={t('builder.publish.customUrl')} />
          <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-500 text-sm">{window.location.origin}/cv/</span>
            <TextInput
              id="slug"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder={t('cvBuilder.form.placeholders.slug')}
            />
          </div>
        </div>

        {/* Publish button */}
        <Button
          color="indigo"
          onClick={handlePublish}
          isProcessing={isPublishing}
          className="w-full"
        >
          {isPublishing ? t('builder.publish.publishing') : t('builder.publish.publishButton')}
        </Button>
      </div>
    </div>
  );
}
