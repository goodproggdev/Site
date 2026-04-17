import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import ContactForm from './ContactForm';
import { createCheckoutSession, isAuthenticated } from '../api/cvApi';

const Pricing = () => {
    const { t } = useTranslation();
    const { lang = 'it' } = useParams<{ lang?: string }>();
    const [searchParams] = useSearchParams();
    const checkoutCvId = (() => {
        const raw = searchParams.get('cv_id');
        if (!raw) return undefined;
        const n = Number.parseInt(raw, 10);
        return Number.isFinite(n) ? n : undefined;
    })();
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const priceOnetime = import.meta.env.VITE_STRIPE_PRICE_ONETIME as string | undefined;
    const priceMonthly = import.meta.env.VITE_STRIPE_PRICE_MONTHLY as string | undefined;
    const stripePricesConfigured = Boolean(
        typeof priceOnetime === 'string' &&
            priceOnetime.trim() &&
            typeof priceMonthly === 'string' &&
            priceMonthly.trim(),
    );

    const plans = useMemo(
        () =>
            [
                {
                    key: 'onetime' as const,
                    checkout_mode: 'payment' as const,
                    priceId: priceOnetime ?? '',
                    featured: true,
                },
                {
                    key: 'monthly' as const,
                    checkout_mode: 'subscription' as const,
                    priceId: priceMonthly ?? '',
                    featured: false,
                },
            ] as const,
        [priceOnetime, priceMonthly],
    );

    const handleCheckout = async (plan: (typeof plans)[number]) => {
        if (!isAuthenticated()) {
            window.dispatchEvent(new CustomEvent('open-signup'));
            return;
        }
        const priceId = plan.priceId?.trim();
        if (!priceId) {
            setCheckoutError(t('pricingPage.priceIdMissing'));
            return;
        }
        if (!stripePricesConfigured) {
            setCheckoutError(t('pricingPage.configIncomplete'));
            return;
        }
        setCheckoutError(null);
        setLoadingPlan(plan.key);
        try {
            const data = await createCheckoutSession(priceId, {
                feature: 'cv_publish',
                plan_type: plan.key,
                checkout_mode: plan.checkout_mode,
                lang,
                ...(checkoutCvId != null ? { cv_id: checkoutCvId } : {}),
            });
            window.location.href = data.url;
        } catch (error: unknown) {
            const msg =
                error instanceof Error ? error.message : t('pricingPage.checkoutNetwork');
            setCheckoutError(t('pricingPage.checkoutStartError', { detail: msg }));
        } finally {
            setLoadingPlan(null);
        }
    };

    const faqRaw = t('marketing.pricing.faq', { returnObjects: true });
    const firstFaq = Array.isArray(faqRaw) ? faqRaw[0] : null;
    const faqItems =
        Array.isArray(faqRaw) &&
        faqRaw.length > 0 &&
        firstFaq &&
        typeof firstFaq === 'object' &&
        'q' in firstFaq &&
        'a' in firstFaq
            ? (faqRaw as { q: string; a: string }[])
            : [];

    return (
        <>
            <section id="price" className="scroll-mt-24 section-y bg-white dark:bg-gray-900">
                <div className="mx-auto max-w-screen-xl container-padding">
                    {/* Header */}
                    <div className="mx-auto text-center mb-16 max-w-2xl">
                        {!stripePricesConfigured ? (
                            <div
                                className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
                                role="status"
                            >
                                {t('pricingPage.configIncomplete')}
                            </div>
                        ) : null}
                        <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                            {t('marketing.pricing.eyebrow')}
                        </span>
                        <h2 className="heading-lg mb-4 dark:text-white">
                            {t('marketing.pricing.title')}
                        </h2>
                        <p className="text-body mb-4 text-lg">
                            {t('marketing.pricing.subtitle')}
                        </p>
                        <p className="mx-auto max-w-2xl text-center text-sm text-gray-600 dark:text-gray-400">
                            {t('marketing.pricing.publishFraming')}
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
                        {plans.map((plan) => {
                            const raw = t(`marketing.pricing.plans.${plan.key}`, { returnObjects: true });
                            const planData =
                                raw &&
                                typeof raw === 'object' &&
                                !Array.isArray(raw) &&
                                'name' in raw
                                    ? (raw as {
                                          name: string;
                                          price: string;
                                          period: string;
                                          periodNote?: string;
                                          badge?: string;
                                          description: string;
                                          features?: unknown;
                                          cta: string;
                                      })
                                    : null;

                            const features = Array.isArray(planData?.features)
                                ? (planData.features as string[])
                                : [];

                            const cardClasses = plan.featured
                                ? 'card-elevated p-8 flex flex-col relative border-indigo-200 dark:border-indigo-800'
                                : 'card p-8 flex flex-col';

                            return (
                                <div key={plan.key} className={cardClasses}>
                                    {plan.featured && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                                            {t('marketing.pricing.plans.onetime.badge', 'Consigliato')}
                                        </span>
                                    )}

                                    <h3 className="mb-2 text-xl font-semibold dark:text-white">
                                        {planData?.name ?? plan.key}
                                    </h3>
                                    <p className="text-body-sm mb-6">
                                        {planData?.description ?? ''}
                                    </p>

                                    <div className="flex items-baseline mb-2">
                                        <span className={`text-5xl font-bold ${plan.featured ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                                            {planData?.price ?? '—'}
                                        </span>
                                        <span className="ml-2 text-gray-500 dark:text-gray-400">
                                            {planData?.period ?? ''}
                                        </span>
                                    </div>
                                    {planData?.periodNote && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                            ({planData.periodNote})
                                        </p>
                                    )}
                                    {!planData?.periodNote && <div className="mb-6" />}

                                    <ul className="mb-8 flex-1 space-y-4">
                                        {features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-3 text-body-sm">
                                                <svg className="h-5 w-5 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        type="button"
                                        onClick={() => void handleCheckout(plan)}
                                        disabled={
                                            !stripePricesConfigured ||
                                            !plan.priceId?.trim() ||
                                            loadingPlan === plan.key
                                        }
                                        className={plan.featured ? 'btn-primary w-full' : 'btn-secondary w-full'}
                                    >
                                        {loadingPlan === plan.key ? t('common.loading') : (planData?.cta ?? '')}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {checkoutError && (
                        <div className="mt-6 mx-auto max-w-md rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-center">
                            <p className="text-sm text-red-700 dark:text-red-300">{checkoutError}</p>
                        </div>
                    )}

                    {/* Trust Note */}
                    <div className="mt-12 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('common.trustNote')}
                        </p>
                    </div>

                    {faqItems.length > 0 ? (
                        <div className="mx-auto mt-16 max-w-3xl">
                            <h3 className="heading-sm mb-8 text-center dark:text-white">{t('marketing.pricing.faqTitle')}</h3>
                            <div className="space-y-3">
                                {faqItems.map((item, i) => (
                                    <details
                                        key={i}
                                        className="group rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50"
                                    >
                                        <summary className="cursor-pointer list-none font-medium text-gray-900 outline-none ring-indigo-500 focus-visible:ring-2 dark:text-white [&::-webkit-details-marker]:hidden">
                                            <span className="flex items-center justify-between gap-2">
                                                {item.q}
                                                <svg
                                                    className="h-5 w-5 shrink-0 text-gray-500 transition-transform group-open:rotate-180"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    aria-hidden
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </span>
                                        </summary>
                                        <p className="mt-3 border-t border-gray-200 pt-3 text-sm leading-relaxed text-gray-600 dark:border-gray-600 dark:text-gray-300">
                                            {item.a}
                                        </p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </section>
            <ContactForm planName={selectedPlan} onFormSubmit={() => setSelectedPlan('')} />
        </>
    );
};

export default Pricing;
