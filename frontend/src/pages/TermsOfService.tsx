import React from 'react';
import { useTranslation } from 'react-i18next';

const TermsOfService: React.FC = () => {
	const { t } = useTranslation();

	return (
		<div className="min-h-screen bg-white py-24 dark:bg-gray-900">
			<div className="container mx-auto max-w-screen-md px-4">
				<h1 className="mb-8 text-4xl font-extrabold text-gray-900 dark:text-white">{t('pages.termsOfService')}</h1>
				<div className="prose prose-gray max-w-none space-y-6 text-gray-600 dark:prose-invert dark:text-gray-400">
					<p>{t('legal.terms.lastUpdated')}</p>

					<section>
						<h2 className="mb-4 mt-8 text-2xl font-bold text-gray-900 dark:text-white">{t('legal.terms.section1Title')}</h2>
						<p>{t('legal.terms.section1Body')}</p>
					</section>

					<section>
						<h2 className="mb-4 mt-8 text-2xl font-bold text-gray-900 dark:text-white">{t('legal.terms.section2Title')}</h2>
						<p>{t('legal.terms.section2Body')}</p>
					</section>

					<section>
						<h2 className="mb-4 mt-8 text-2xl font-bold text-gray-900 dark:text-white">{t('legal.terms.section3Title')}</h2>
						<p>{t('legal.terms.section3Body')}</p>
					</section>

					<section>
						<h2 className="mb-4 mt-8 text-2xl font-bold text-gray-900 dark:text-white">{t('legal.terms.section4Title')}</h2>
						<p>{t('legal.terms.section4Body')}</p>
					</section>
				</div>
			</div>
		</div>
	);
};

export default TermsOfService;
