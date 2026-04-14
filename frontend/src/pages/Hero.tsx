import { Button, Spinner } from 'flowbite-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCVUpload } from '../hooks/useCVUpload';

const HeroSection: React.FC = () => {
	const { t } = useTranslation();
	const { upload, state, error, progress } = useCVUpload();
	const [dragActive, setDragActive] = useState(false);

	const handleFile = (file: File) => {
		void upload(file);
	};

	const onDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragActive(false);
		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			handleFile(e.dataTransfer.files[0]);
		}
	};

	return (
		<section id="home" className="scroll-mt-24 relative overflow-hidden bg-white py-16 dark:bg-gray-900 lg:py-24">
			<div className="container mx-auto px-4">
				<div className="flex flex-col items-center gap-12 lg:flex-row">
					<div className="z-10 w-full text-center lg:w-1/2 lg:text-left">
						<div className="mb-4 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
							<span className="mr-2 h-2 w-2 rounded-full bg-indigo-600" />
							{t('hero.badge')}
						</div>
						<h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
							{t('hero.titleBefore')}
							<span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
								{t('hero.titleHighlight')}
							</span>
							{t('hero.titleAfter')}
						</h1>
						<p className="mb-8 text-lg font-light text-gray-500 dark:text-gray-400 lg:text-xl">{t('hero.description')}</p>

						<div
							className={`relative mb-8 rounded-2xl border-2 border-dashed p-8 transition-all ${
								dragActive ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700'
							}`}
							onDragOver={(e) => {
								e.preventDefault();
								setDragActive(true);
							}}
							onDragLeave={() => setDragActive(false)}
							onDrop={onDrop}
						>
							{state === 'uploading' ? (
								<div className="py-4 text-center">
									<Spinner size="xl" className="mb-4" />
									<p className="font-bold text-indigo-600">{t('hero.analyzing', { progress })}</p>
								</div>
							) : (
								<div className="text-center">
									<svg className="mx-auto mb-4 h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
										/>
									</svg>
									<p className="mb-2 font-semibold text-gray-900 dark:text-white">{t('hero.dropTitle')}</p>
									<p className="mb-4 text-sm text-gray-500">{t('hero.dropSubtitle')}</p>
									<input
										type="file"
										id="hero-upload"
										className="hidden"
										onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
									/>
									<label
										htmlFor="hero-upload"
										className="cursor-pointer rounded-lg bg-indigo-100 px-4 py-2 font-bold text-indigo-600 transition-colors hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-400"
									>
										{t('hero.selectFile')}
									</label>
								</div>
							)}
							{error && (
								<p className="mt-4 text-sm font-medium text-red-500">
									❌ {error}
								</p>
							)}
						</div>

						<div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 lg:justify-start">
							<Button gradientDuoTone="purpleToBlue" size="xl" className="px-8 font-bold shadow-lg shadow-indigo-200 dark:shadow-none">
								{t('hero.viewPlans')}
							</Button>
						</div>
					</div>

					<div className="relative hidden w-full lg:block lg:w-1/2">
						<div className="absolute -left-4 -top-4 h-72 w-72 animate-pulse rounded-full bg-purple-300 opacity-20 blur-3xl dark:bg-purple-900" />
						<div className="absolute -bottom-4 -right-4 h-72 w-72 animate-pulse rounded-full bg-indigo-300 opacity-20 blur-3xl dark:bg-indigo-900" />
						<img
							src="/logo-nordev.png"
							alt={t('hero.logoAlt')}
							className="relative z-10 mx-auto w-full max-w-md transform transition-all hover:scale-105 drop-shadow-2xl"
						/>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
