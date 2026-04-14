import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, TextInput } from 'flowbite-react';
import { requestPasswordReset } from '../api/cvApi';
import { formatAndLocalizeDrfErrors } from '../utils/apiErrorI18n';
import { isValidEmail } from '../utils/email';
import axios from 'axios';

export default function ForgotPassword() {
	const { t } = useTranslation();
	const { lang = 'it' } = useParams<{ lang: string }>();
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [info, setInfo] = useState('');
	const [error, setError] = useState('');

	const submit = async () => {
		setError('');
		setInfo('');
		const trimmed = email.trim();
		if (!trimmed) {
			setError(t('auth.forgot.needEmail'));
			return;
		}
		if (!isValidEmail(trimmed)) {
			setError(t('auth.login.emailInvalid'));
			return;
		}
		setLoading(true);
		try {
			await requestPasswordReset(trimmed);
			setInfo(t('auth.forgot.sent'));
		} catch (e) {
			if (axios.isAxiosError(e) && e.response?.data)
				setError(formatAndLocalizeDrfErrors(e.response.data, t) || t('auth.forgot.error'));
			else setError(t('auth.forgot.error'));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
			<Card className="w-full max-w-md">
				<h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{t('auth.forgot.title')}</h1>
				<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('auth.forgot.subtitle')}</p>
				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						void submit();
					}}
				>
					<TextInput
						type="email"
						autoComplete="email"
						value={email}
						onChange={(e) => {
							setEmail(e.target.value);
							setError('');
						}}
						placeholder={t('auth.login.email')}
						color={error ? 'failure' : undefined}
						aria-invalid={!!error}
						aria-describedby={error ? 'forgot-email-error' : undefined}
					/>
					{error ? (
						<p id="forgot-email-error" className="text-sm text-red-600" role="alert" aria-live="polite">
							{error}
						</p>
					) : null}
					{info ? (
						<p className="text-sm text-green-700 dark:text-green-400" role="status" aria-live="polite">
							{info}
						</p>
					) : null}
					<Button type="submit" className="w-full btn-primary" disabled={loading} isProcessing={loading}>
						{t('auth.forgot.submit')}
					</Button>
					<Link to={`/${lang}`} className="block text-center text-sm text-indigo-600 hover:underline">
						{t('auth.forgot.back')}
					</Link>
				</form>
			</Card>
		</div>
	);
}
