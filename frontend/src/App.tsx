import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import ErrorBoundary from "./components/ErrorBoundary";
// Vercel Web Analytics + Speed Insights: RUM (Real User Monitoring) in produzione.
// Componenti no-op se il progetto Vercel non ha il toggle Analytics/Speed Insights
// attivato nelle impostazioni — sicuri da montare sempre, nessuna chiave richiesta.
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import CookieConsent from "./components/CookieConsent";
import GaRouteListener from "./components/GaRouteListener";
import { Navbar, Footer } from "./layout";
import { supportedLanguages, type Language } from './i18n';
import './i18n';

// Lazy loading per pagine
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PublicCV = lazy(() => import('./pages/PublicCV'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const Settings = lazy(() => import('./pages/Settings'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const BuilderPage = lazy(() => import('./pages/BuilderPage'));
const CvSiteEditor = lazy(() => import('./pages/CvSiteEditor'));

function LoadingSpinner() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  );
}

// Componente wrapper che gestisce il cambio lingua dalle route
function LocalizedRoute({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const { lang } = useParams<{ lang?: string }>();

  useEffect(() => {
    if (lang && supportedLanguages.includes(lang as Language)) {
      if (i18n.language !== lang) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        i18n.changeLanguage(lang);
      }
    }
    // i18n is stable reference from useTranslation, but needed in deps for exhaustive check
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return <>{children}</>;
}

// Route configuration
function AppRoutes() {
  return (
    <Routes>
      {/* Redirect from root to default language */}
      <Route path="/" element={<Navigate to="/it" replace />} />

      {/* Language-prefixed routes */}
      <Route path="/:lang/*" element={<LocalizedRoute><LocalizedRoutes /></LocalizedRoute>} />

      {/* Legacy public CV routes (keep for backward compatibility) */}
      <Route path="/u/:slug" element={<PublicCV />} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/it" replace />} />
    </Routes>
  );
}

// Localized routes component
function LocalizedRoutes() {
  const { lang } = useParams<{ lang: string }>();

  // Validate language, fallback to it
  const currentLang = supportedLanguages.includes(lang as Language) ? lang : 'it';

  useEffect(() => {
    document.documentElement.lang = currentLang ?? 'it';
  }, [currentLang]);

  return (
    <Routes>
      <Route path="" element={<Home />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="builder" element={<BuilderPage />} />
      <Route path="cv/:cvId/edit" element={<CvSiteEditor />} />
      <Route path="settings" element={<Settings />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="verify-email" element={<VerifyEmail />} />
      <Route path="payment/success" element={<PaymentSuccess />} />
      <Route path="cv/:slug" element={<PublicCV />} />
      <Route path="privacy" element={<PrivacyPolicy />} />
      <Route path="terms" element={<TermsOfService />} />
      <Route path="pricing" element={<PricingPage />} />
      <Route path="*" element={<Navigate to={`/${currentLang}`} replace />} />
    </Routes>
  );
}

// La pagina CV pubblica (/u/:slug oppure /:lang/cv/:slug) è il sito "vetrina"
// della singola persona: non deve avere la navbar/footer della piattaforma,
// altrimenti sembra un errore invece di un sito a sé stante.
function isPublicCvRoute(pathname: string): boolean {
  if (/^\/u\/[^/]+\/?$/.test(pathname)) return true;
  if (/^\/[a-z]{2}\/cv\/[^/]+\/?$/.test(pathname)) return true;
  return false;
}

function AppShell() {
  const location = useLocation();
  const hideChrome = isPublicCvRoute(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      {!hideChrome ? <Navbar /> : null}
      <main className="flex-grow">
        <Suspense fallback={<LoadingSpinner />}>
          <AppRoutes />
        </Suspense>
      </main>
      {!hideChrome ? <Footer /> : null}
      <CookieConsent />
    </div>
  );
}

function App() {
  return (
    <Router>
      <GaRouteListener />
      <ErrorBoundary>
        <AppShell />
      </ErrorBoundary>
      <Analytics />
      <SpeedInsights />
    </Router>
  );
}

export default App;
