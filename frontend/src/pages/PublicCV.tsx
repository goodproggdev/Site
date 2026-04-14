import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import cvApi from '../api/cvApi';
import Home from './Home';

const PublicCV: React.FC = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [cvData, setCvData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const response = await cvApi.get(`/api/v1/cv/public/${slug}/`);
        setCvData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || t('publicCV.notFound'));
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCV();
    }
  }, [slug, t]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">{t('common.loading')}...</div>;
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center">
    <h1 className="text-2xl font-bold text-gray-800">404 - {t('errors.notFound')}</h1>
    <p className="text-gray-600 mt-2">{error}</p>
    <a href="/" className="mt-4 text-primary hover:underline">{t('publicCV.backHome')}</a>
  </div>;

  return (
    <div className="public-cv-container">
      <Suspense fallback={<div>{t('common.loading')}...</div>}>
         <Home initialData={cvData} isPublicView={true} />
      </Suspense>
    </div>
  );
};

export default PublicCV;
