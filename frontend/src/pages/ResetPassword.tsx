import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, TextInput } from 'flowbite-react';
import { confirmPasswordReset } from '../api/cvApi';
import { isValidPassword } from '../utils/password';
import { formatAndLocalizeDrfErrors } from '../utils/apiErrorI18n';
import axios from 'axios';

export default function ResetPassword() {
	const { t } = useTranslation();
	const { lang = 'it' } = useParams<{ lang: string }>();
	const [searchParams] = useSearchParams();
	const uid = searchParams.get('uid') ?? '';
	const token = searchParams.get('token') ?? '';

	const hasParams = useMemo(() => Boolean(uid && token), [uid, token]);

	const [p1, setP1] = useState('');
	const [p2, setP2] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);

	const submit = async () => {
		setError('');
		if (p1 !== p2) {
			setError(t('auth.reset.mismatch'));
			return;
		}
		if (!isValidPassword(p1)) {
			setError(t('auth.reset.policy'));
			return;
		}
		setLoading(true);
		try {
			await confirmPasswordReset({
				uid,
				token,
				new_password1: p1,
				new_password2: p2,
			});
			setSuccess(true);
		} catch (e) {
			if (axios.isAxiosError(e) && e.response?.data)
				setError(formatAndLocalizeDrfErrors(e.response.data, t) || t('auth.reset.error'));
			else setError(t('auth.reset.error'));
		} finally {
			setLoading(false);
		}
	};

	if (!hasParams) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
				<Card className="w-full max-w-md text-center">
					<p className="text-gray-700 dark:text-gray-300 mb-4">{t('auth.reset.invalidLink')}</p>
					<Link to={`/${lang}/forgot-password`} className="text-indigo-600 hover:underline">
						{t('auth.forgot.title')}
					</Link>
				</Card>
			</div>
		);
	}

	if (success) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
				<Card className="w-full max-w-md text-center">
					<p className="text-green-700 dark:text-green-400 mb-4">{t('auth.reset.done')}</p>
					<Link to={`/${lang}`} className="text-indigo-600 hover:underline font-medium">
						{t('auth.reset.goHome')}
					</Link>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
			<Card className="w-full max-w-md">
				<h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{t('auth.reset.title')}</h1>
				<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('auth.reset.subtitle')}</p>
				<div className="space-y-4">
					<TextInput type="password" value={p1} onChange={(e) => setP1(e.target.value)} placeholder={t('auth.signup.password')} />
					<TextInput type="password" value={p2} onChange={(e) => setP2(e.target.value)} placeholder={t('auth.signup.confirmPassword')} />
					{error && <p className="text-sm text-red-600">{error}</p>}
					<Button className="w-full btn-primary" onClick={() => void submit()} isProcessing={loading}>
						{t('auth.reset.submit')}
					</Button>
					<Link to={`/${lang}`} className="block text-center text-sm text-indigo-600 hover:underline">
						{t('auth.forgot.back')}
					</Link>
				</div>
			</Card>
		</div>
	);
}
