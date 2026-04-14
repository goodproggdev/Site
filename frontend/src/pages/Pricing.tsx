import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContactForm from './ContactForm';
import { createCheckoutSession, isAuthenticated } from '../api/cvApi';

const Pricing = () => {
    const { t } = useTranslation();
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleCheckout = async (priceId: string, planKey: string) => {
        if (!isAuthenticated()) {
            window.dispatchEvent(new CustomEvent('open-signup'));
            return;
        }
        setCheckoutError(null);
        setLoadingPlan(planKey);
        try {
            const data = await createCheckoutSession(priceId);
            window.location.href = data.url;
        } catch (error: unknown) {
            const msg =
                error instanceof Error ? error.message : t('pricingPage.checkoutNetwork');
            setCheckoutError(msg);
        } finally {
            setLoadingPlan(null);
        }
    };

    const plans = [
        {
            key: 'onetime',
            priceId: import.meta.env.VITE_STRIPE_PRICE_ONETIME as string,
            featured: true,
        },
        {
            key: 'monthly',
            priceId: import.meta.env.VITE_STRIPE_PRICE_MONTHLY as string,
            featured: false,
        },
    ] as const;

    return (
        <>
            <section id="price" className="scroll-mt-24 section-y bg-white dark:bg-gray-900">
                <div className="mx-auto max-w-screen-xl container-padding">
                    {/* Header */}
                    <div className="mx-auto text-center mb-16 max-w-2xl">
                        <span className="inline-block mb-4 text-sm font-semibold text-indigo-600 uppercase tracking-wide">
                            Pricing
                        </span>
                        <h2 className="heading-lg mb-4 dark:text-white">
                            {t('marketing.pricing.title')}
                        </h2>
                        <p className="text-body text-lg">
                            {t('marketing.pricing.subtitle')}
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
                                        onClick={() => handleCheckout(plan.priceId, plan.key)}
                                        disabled={loadingPlan === plan.key}
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
                </div>
            </section>
            <ContactForm planName={selectedPlan} onFormSubmit={() => setSelectedPlan('')} />
        </>
    );
};

export default Pricing;
