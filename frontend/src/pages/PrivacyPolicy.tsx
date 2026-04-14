import React from 'react';
import { useTranslation } from 'react-i18next';

const PrivacyPolicy: React.FC = () => {
	const { t } = useTranslation();

	return (
		<div className="min-h-screen bg-white py-24 dark:bg-gray-900">
			<div className="container mx-auto max-w-screen-md px-4">
				<h1 className="mb-8 text-4xl font-extrabold text-gray-900 dark:text-white">{t('pages.privacyPolicy')}</h1>
				<div className="prose prose-gray max-w-none space-y-6 text-gray-600 dark:prose-invert dark:text-gray-400">
					<p>{t('legal.privacy.lastUpdated')}</p>

					<section>
						<h2 className="mb-4 mt-8 text-2xl font-bold text-gray-900 dark:text-white">{t('legal.privacy.section1Title')}</h2>
						<p>{t('legal.privacy.section1Body')}</p>
					</section>

					<section>
						<h2 className="mb-4 mt-8 text-2xl font-bold text-gray-900 dark:text-white">{t('legal.privacy.section2Title')}</h2>
						<ul className="list-disc space-y-2 pl-5">
							<li>{t('legal.privacy.section2Item1')}</li>
							<li>{t('legal.privacy.section2Item2')}</li>
							<li>{t('legal.privacy.section2Item3')}</li>
						</ul>
					</section>

					<section>
						<h2 className="mb-4 mt-8 text-2xl font-bold text-gray-900 dark:text-white">{t('legal.privacy.section3Title')}</h2>
						<p>{t('legal.privacy.section3Body')}</p>
					</section>

					<section>
						<h2 className="mb-4 mt-8 text-2xl font-bold text-gray-900 dark:text-white">{t('legal.privacy.section4Title')}</h2>
						<p>{t('legal.privacy.section4Body')}</p>
					</section>
				</div>
			</div>
		</div>
	);
};

export default PrivacyPolicy;
