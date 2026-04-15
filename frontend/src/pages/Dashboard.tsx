import { useEffect, useState, useRef } from 'react';
import { Button, Label, TextInput, Textarea } from 'flowbite-react';
import { useAuth } from '../hooks/useAuth';
import cvApi, { sendContactForm } from '../api/cvApi';
import { Link, useParams } from 'react-router-dom';
import { trackEvent } from '../analytics/ga4';
import { useTranslation } from 'react-i18next';
import { publicCvAbsoluteUrl } from '../config/site';

interface CV {
  id: number;
  slug: string;
  created_at: string;
  visits_count: number;
  is_published: boolean;
  thumbnail: string;
}

interface Stats {
  total_cvs: number;
  total_visits: number;
  plan: string;
}

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  matchReasons: string[];
  url: string;
  postedAt: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { lang = 'it' } = useParams<{ lang?: string }>();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cvs' | 'jobs'>('cvs');

  const [supportEmail, setSupportEmail] = useState('');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportStatus, setSupportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [copyToast, setCopyToast] = useState<{ cvId: number; kind: 'url' | 'snippet' } | null>(null);
  const copyToastTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const flashCopyToast = (cvId: number, kind: 'url' | 'snippet') => {
    if (copyToastTimer.current) {
      window.clearTimeout(copyToastTimer.current);
    }
    setCopyToast({ cvId, kind });
    copyToastTimer.current = window.setTimeout(() => {
      setCopyToast(null);
      copyToastTimer.current = null;
    }, 2200);
  };

  useEffect(() => {
    return () => {
      if (copyToastTimer.current) {
        window.clearTimeout(copyToastTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const email = user?.email?.trim();
    if (email) {
      setSupportEmail((prev) => (prev.trim() ? prev : email));
    }
  }, [user?.email]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardRes, jobsRes] = await Promise.all([
          cvApi.get('/api/v1/dashboard/'),
          cvApi.get('/api/v1/jobs/matches/').catch(() => ({ data: { jobs: [] } })),
        ]);
        setCvs(dashboardRes.data.cvs);
        setStats(dashboardRes.data.stats);
        setJobs(jobsRes.data.jobs || []);
      } catch (error) {
        console.error("Errore fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCopyPublicUrl = (cv: CV) => {
    const url = publicCvAbsoluteUrl(cv.slug);
    void navigator.clipboard.writeText(url).then(() => flashCopyToast(cv.id, 'url'));
  };

  const handleCopyLinkedInSnippet = (cv: CV) => {
    const url = publicCvAbsoluteUrl(cv.slug);
    const text = t('dashboard.cvList.linkedInSnippet', { url });
    void navigator.clipboard.writeText(text).then(() => flashCopyToast(cv.id, 'snippet'));
  };

  useEffect(() => {
    if (!loading && window.location.hash === '#support') {
      requestAnimationFrame(() => {
        document.getElementById('support')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [loading]);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = supportEmail.trim();
    const subject = supportSubject.trim();
    const message = supportMessage.trim();
    if (!email || !subject || !message) return;
    setSupportStatus('loading');
    try {
      await sendContactForm({ email, subject, message });
      setSupportStatus('success');
      setSupportSubject('');
      setSupportMessage('');
    } catch {
      setSupportStatus('error');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="heading-md dark:text-white">
            {t('dashboard.welcome', { name: user?.name || 'Professionista' })}
          </h1>
          <p className="mt-2 text-body">
            Gestisci la tua identità digitale e monitora le tue performance.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('dashboard.stats.currentPlan')}</h3>
            <p className="mt-2 text-2xl font-bold text-indigo-600 capitalize">{stats?.plan || 'Free'}</p>
          </div>
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('dashboard.stats.totalViews')}</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_visits || 0}</p>
          </div>
          <div className="card p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t('dashboard.stats.cvCreated')}</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats?.total_cvs || 0}</p>
          </div>
        </div>

        <section id="support" className="scroll-mt-24 mb-10">
          <div className="card p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('dashboard.support.title')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t('dashboard.support.subtitle')}</p>
            {supportStatus === 'success' ? (
              <div className="space-y-3">
                <p className="text-sm text-green-700 dark:text-green-400" role="status">
                  {t('dashboard.support.success')}
                </p>
                <Button type="button" color="light" size="sm" onClick={() => setSupportStatus('idle')}>
                  {t('dashboard.support.again')}
                </Button>
              </div>
            ) : (
              <form onSubmit={(e) => void handleSupportSubmit(e)} className="space-y-4 max-w-xl">
                <div>
                  <Label htmlFor="support-email" value={t('dashboard.support.email')} />
                  <TextInput
                    id="support-email"
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder={t('contact.form.emailPlaceholder')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="support-subject" value={t('dashboard.support.subject')} />
                  <TextInput
                    id="support-subject"
                    type="text"
                    required
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    placeholder={t('dashboard.support.subjectPlaceholder')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="support-message" value={t('dashboard.support.message')} />
                  <Textarea
                    id="support-message"
                    required
                    rows={4}
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder={t('dashboard.support.messagePlaceholder')}
                    className="mt-1"
                  />
                </div>
                {supportStatus === 'error' ? (
                  <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                    {t('dashboard.support.error')}
                  </p>
                ) : null}
                <Button type="submit" color="indigo" disabled={supportStatus === 'loading'}>
                  {supportStatus === 'loading' ? t('contact.form.sending') : t('dashboard.support.submit')}
                </Button>
              </form>
            )}
          </div>
        </section>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('cvs')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'cvs'
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {t('dashboard.cvList.title')}
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'jobs'
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {t('dashboard.jobs.title')} {jobs.length > 0 && `(${jobs.length})`}
          </button>
        </div>

        {/* CV List */}
        {activeTab === 'cvs' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.cvList.title')}</h2>
              <Link
                to={`/${lang}/builder`}
                className="btn-primary"
                onClick={() => trackEvent('cv_builder_open', { entry: 'dashboard_create' })}
              >
                {t('dashboard.cvList.createNew')}
              </Link>
            </div>

            {cvs.length === 0 ? (
              <div className="card p-12 text-center border-2 border-dashed">
                <p className="text-gray-500 dark:text-gray-400">{t('dashboard.cvList.noCvs')}</p>
                <Link to={`/${lang}/builder`} className="mt-4 inline-block btn-link">
                  {t('dashboard.cvList.startNow')}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cvs.map((cv) => (
                  <div key={cv.id} className="card overflow-hidden group">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
                      <img src={cv.thumbnail || '/cv-placeholder.png'} alt={cv.slug} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${cv.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {cv.is_published ? t('dashboard.cvList.published') : t('dashboard.cvList.draft')}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">/{cv.slug}</h4>
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {t('dashboard.cvList.publicUrl')}
                        </p>
                        <p className="break-all font-mono text-xs text-indigo-700 dark:text-indigo-300">
                          {publicCvAbsoluteUrl(cv.slug)}
                        </p>
                        {!cv.is_published ? (
                          <p className="text-xs text-amber-800 dark:text-amber-200/90">{t('dashboard.cvList.draftUrlHint')}</p>
                        ) : null}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button type="button" size="xs" color="light" onClick={() => handleCopyPublicUrl(cv)}>
                            {t('dashboard.cvList.copyPublicUrl')}
                          </Button>
                          <Button type="button" size="xs" color="indigo" onClick={() => handleCopyLinkedInSnippet(cv)}>
                            {t('dashboard.cvList.copyForLinkedIn')}
                          </Button>
                        </div>
                        {copyToast?.cvId === cv.id ? (
                          <p className="text-xs text-green-700 dark:text-green-400" role="status" aria-live="polite">
                            {copyToast.kind === 'snippet'
                              ? t('dashboard.cvList.copiedSnippet')
                              : t('common.copiedToClipboard')}
                          </p>
                        ) : null}
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          <span className="font-semibold text-gray-900 dark:text-white">{cv.visits_count}</span> {t('dashboard.cvList.views')}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/u/${cv.slug}`}
                            className="btn-icon"
                            title={t('dashboard.cvList.viewPublic')}
                            aria-label={t('dashboard.cvList.viewPublic')}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          </Link>
                          <Link
                            to={`/${lang}/builder?cvId=${cv.id}`}
                            className="btn-icon"
                            title={t('dashboard.cvList.editContent')}
                            aria-label={t('dashboard.cvList.editContent')}
                            onClick={() => trackEvent('cv_builder_open', { entry: 'dashboard_wizard', cv_id: cv.id })}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                          </Link>
                          <Link
                            to={`/${lang}/cv/${cv.id}/edit`}
                            className="btn-icon"
                            title={t('dashboard.cvList.editSite')}
                            aria-label={t('dashboard.cvList.editSite')}
                            onClick={() => trackEvent('cv_customize_open', { cv_id: cv.id })}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          </Link>
                          <Link
                            to={`/${lang}/settings`}
                            className="btn-icon"
                            title={t('dashboard.cvList.cvSettings')}
                            aria-label={t('dashboard.cvList.cvSettings')}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Jobs Section */}
        {activeTab === 'jobs' && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.jobs.title')}</h2>
              <p className="text-body-sm mt-1">{t('dashboard.jobs.subtitle')}</p>
            </div>

            {jobs.length === 0 ? (
              <div className="card p-12 text-center border-2 border-dashed">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">{t('dashboard.jobs.noJobs')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="card p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                        <p className="text-body-sm">{job.company} • {job.location}</p>
                        {job.salary && <p className="text-green-600 font-medium mt-1 text-sm">{job.salary}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          job.matchScore >= 80 ? 'bg-green-100 text-green-700' :
                          job.matchScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {t('dashboard.jobs.matchScore', { score: job.matchScore })}
                        </div>
                        <span className="text-xs text-gray-500">{job.postedAt}</span>
                      </div>
                    </div>
                    
                    {job.matchReasons && job.matchReasons.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.matchReasons.map((reason, idx) => (
                          <span key={idx} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded">
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4 flex gap-3">
                      <button className="btn-primary btn-sm" onClick={() => window.open(job.url, '_blank')}>
                        {t('dashboard.jobs.apply')}
                      </button>
                      <button className="btn-secondary btn-sm">
                        {t('dashboard.jobs.save')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}