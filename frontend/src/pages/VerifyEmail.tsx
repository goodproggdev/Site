import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, Spinner, TextInput } from 'flowbite-react';
import axios from 'axios';
import { verifyEmail, sendVerificationEmail } from '../api/cvApi';
import { isValidEmail } from '../utils/email';
import { authErrorMessageFromAxios, formatAndLocalizeDrfErrors } from '../utils/apiErrorI18n';

export default function VerifyEmail() {
  const { t } = useTranslation();
  const { lang = 'it' } = useParams<{ lang?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? searchParams.get('key');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'resend'>('verifying');
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendEmail, setResendEmail] = useState('');

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setStatus('resend');
      setMessage(t('auth.verify.noToken'));
    }
  }, [token]);

  const verifyToken = async () => {
    const response = await verifyEmail(token!);
    if (response.verified) {
      setStatus('success');
      setMessage(t('auth.verify.success'));
      return;
    }
    setStatus('error');
    if (response.drfData != null && typeof response.drfData === 'object') {
      setMessage(formatAndLocalizeDrfErrors(response.drfData, t));
    } else {
      setMessage(t('auth.verify.errorNetwork'));
    }
  };

  const handleResend = async () => {
    const email = resendEmail.trim();
    if (!email) {
      setMessage(t('auth.verify.resendNeedEmail'));
      return;
    }
    if (!isValidEmail(email)) {
      setMessage(t('auth.login.emailInvalid'));
      return;
    }
    setResendLoading(true);
    try {
      await sendVerificationEmail(email);
      setMessage(t('auth.verify.emailSent'));
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setMessage(authErrorMessageFromAxios(e, t));
      } else {
        setMessage(t('auth.verify.resendError'));
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate(`/${lang}/`);
  };

  const handleGoToDashboard = () => {
    navigate(`/${lang}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="flex justify-center mb-4">
                <Spinner size="xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.verify.verifying')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('auth.verify.pleaseWait')}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.verify.successTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>
              <Button color="indigo" onClick={handleGoToDashboard} className="w-full">
                {t('auth.verify.goToDashboard')}
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.verify.errorTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>
              <TextInput
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder={t('auth.signup.email')}
                className="mb-4"
              />
              <div className="space-y-3">
                <Button color="indigo" onClick={handleResend} isProcessing={resendLoading} className="w-full">
                  {t('auth.verify.resendEmail')}
                </Button>
                <Button color="light" onClick={handleGoToLogin} className="w-full">
                  {t('auth.verify.backToLogin')}
                </Button>
              </div>
            </>
          )}

          {status === 'resend' && (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.verify.resendTitle')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message || t('auth.verify.resendDescription')}
              </p>
              <TextInput
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder={t('auth.signup.email')}
                className="mb-4"
              />
              <div className="space-y-3">
                <Button color="indigo" onClick={handleResend} isProcessing={resendLoading} className="w-full">
                  {t('auth.verify.resendEmail')}
                </Button>
                <Button color="light" onClick={handleGoToLogin} className="w-full">
                  {t('auth.verify.backToLogin')}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
