import React, { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Welcome from './Welcome';
import Preview from './Preview';
import About from './About';
import Feature from './Feature';
import Statistics from './Statistics';
import Testimonials from './Testimonials';
import Pricing from './Pricing';

function HowItWorks() {
  const { t } = useTranslation();
  const steps = t('howItWorks.steps', { returnObjects: true }) as Array<{ title: string; description: string }>;
  const icons = [
    // Upload icon
    <svg key="upload" className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
    // Link icon
    <svg key="link" className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
    // Share icon
    <svg key="share" className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>,
  ];
  if (!Array.isArray(steps)) return null;
  return (
    <section className="section-y bg-gray-50 dark:bg-gray-800/50">
      <div className="mx-auto max-w-screen-xl container-padding">
        <div className="text-center mb-12">
          <h2 className="heading-md dark:text-white">{t('howItWorks.title')}</h2>
          <p className="text-body mt-2">{t('howItWorks.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={i} className="card p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                {icons[i]}
              </div>
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-500">{`0${i + 1}`}</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{step.title}</h3>
              <p className="text-body-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface HomeProps {
  initialData?: any;
  isPublicView?: boolean;
}

const Home: React.FC<HomeProps> = ({ initialData, isPublicView = false }) => {
  const location = useLocation();

  useLayoutEffect(() => {
    const raw = location.hash.replace(/^#/, '');
    if (!raw) return;
    const id = raw === 'Home' ? 'home' : decodeURIComponent(raw);
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [location.pathname, location.hash]);

  return (
    <>
      <Welcome />
      {/* Se è una public view, passiamo initialData a Preview per mostrare il CV specifico */}
      <Preview initialData={initialData} isPublicView={isPublicView} />
      {!isPublicView && (
        <>
          <HowItWorks />
          <About />
          <Feature />
          <Statistics />
          <Testimonials />
          <Pricing />
          {/* ContactForm è già incluso dentro Pricing.tsx */}
        </>
      )}
    </>
  );
};

export default Home;
