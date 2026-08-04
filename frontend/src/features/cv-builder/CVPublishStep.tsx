import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, Label, TextInput } from 'flowbite-react';
import Toggle from '../../components/Toggle';
import type { CVStepProps } from './CVWizard';
import { updateCVLinkPolicy } from '../../api/cvApi';
import { LINKEDIN_PROFILE_CONTACT_EDIT } from '../../config/site';

interface CVPublishStepProps extends Omit<CVStepProps, 'updateCVData' | 'onNext'> {}

export default function CVPublishStep({ cvData }: CVPublishStepProps) {
  const { t } = useTranslation();
  const { lang = 'it' } = useParams<{ lang?: string }>();
  const [isPublic, setIsPublic] = useState(true);
  const [expiryMonths, setExpiryMonths] = useState(12);
  const [customSlug, setCustomSlug] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [cvUrl, setCvUrl] = useState('');
  const [copyHint, setCopyHint] = useState<'link' | 'share' | null>(null);

  const handlePublish = async () => {
    if (!cvData.cvId) {
      setPublishError(t('builder.publish.errorNoCvId'));
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
      // Lo slug reale del CV vive in `cvData.slug` (assegnato dal backend all'upload/creazione,
      // vedi CVUploadStep.tsx) — NON dentro `parsedData`, che contiene solo i dati del template
      // e non ha mai avuto una chiave "slug". Usarlo da li' produceva un link rotto (/u/ senza
      // slug -> 404).
      const slug = cvData.slug || customSlug;
      if (!slug) {
        setPublishError(t('builder.publish.errorNoSlug'));
        return;
      }
      setCvUrl(`${window.location.origin}/u/${slug}`);
      setPublished(true);
    } catch {
      setPublishError(t('errors.upload.generic'));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = () => {
    void navigator.clipboard.writeText(cvUrl).then(() => {
      setCopyHint('link');
      window.setTimeout(() => setCopyHint(null), 2500);
    });
  };

  const handleCopyLinkedInUrl = () => {
    void navigator.clipboard.writeText(cvUrl).then(() => {
      setCopyHint('link');
      window.setTimeout(() => setCopyHint(null), 2500);
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('builder.publish.shareTitle'),
          text: cvUrl,
          url: cvUrl,
        });
        setCopyHint('share');
        window.setTimeout(() => setCopyHint(null), 2500);
        return;
      } catch (e) {
        const err = e as { name?: string };
        if (err?.name === 'AbortError') {
          return;
        }
      }
    }
    handleCopyLink();
  };

  if (published) {
    return (
      <div className="text-center max-w-lg mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('builder.publish.success')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {t('builder.publish.successMessage')}
        </p>
        <p className="text-xs text-gray-500 mb-6 text-left rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-200">
          {t('builder.publish.linkedInEditHint')}
        </p>

        <Card className="max-w-md mx-auto mb-6">
          <Label value={t('builder.publish.linkLabel')} />
          <div className="flex gap-2 mt-2">
            <TextInput value={cvUrl} readOnly className="flex-1" />
            <Button type="button" color="light" onClick={handleCopyLink}>
              {t('builder.publish.copy')}
            </Button>
          </div>
        </Card>

        <p className="mb-3 text-center text-xs text-gray-500 dark:text-gray-400">{t('dashboard.cvList.linkedInPasteHint')}</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center mb-3">
          <Button type="button" color="light" onClick={() => window.open(cvUrl, '_blank', 'noopener,noreferrer')}>
            {t('builder.publish.view')}
          </Button>
          <Button type="button" color="light" onClick={handleCopyLinkedInUrl}>
            {t('builder.publish.copyLinkedInSnippet')}
          </Button>
          <Button type="button" color="indigo" onClick={() => window.open(LINKEDIN_PROFILE_CONTACT_EDIT, '_blank', 'noopener,noreferrer')}>
            {t('builder.publish.openLinkedInProfile')}
          </Button>
        </div>
        <div className="flex justify-center mb-2">
          <Button type="button" color="gray" onClick={() => void handleShare()}>
            {t('builder.publish.share')}
          </Button>
        </div>
        {copyHint ? (
          <p className="text-sm text-green-700 dark:text-green-400" role="status" aria-live="polite">
            {copyHint === 'share' ? t('builder.publish.shareDone') : t('common.copiedToClipboard')}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t('builder.steps.publish')}
      </h2>

      <p className="mb-4 max-w-lg text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {t('builder.publish.intro')}{' '}
        <Link
          to={
            cvData.cvId
              ? `/${lang ?? 'it'}/pricing?cv_id=${encodeURIComponent(String(cvData.cvId))}`
              : `/${lang ?? 'it'}/pricing`
          }
          className="font-medium text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
        >
          {t('builder.publish.introLink')}
        </Link>
      </p>

      <div className="mb-6 max-w-lg space-y-2 rounded-lg border border-indigo-200 bg-indigo-50/90 p-4 text-xs leading-relaxed text-gray-800 dark:border-slate-600 dark:bg-slate-900/90 dark:text-slate-100">
        <p>{t('builder.publish.linkedInLanding')}</p>
        <p>{t('builder.publish.publicPageNote')}</p>
      </div>

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
            <span className="text-gray-500 text-sm">{window.location.origin}/u/</span>
            <TextInput
              id="slug"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder={t('cvBuilder.form.placeholders.slug')}
            />
          </div>
        </div>

        {/* Publish button */}
        {publishError ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {publishError}
          </p>
        ) : null}

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
