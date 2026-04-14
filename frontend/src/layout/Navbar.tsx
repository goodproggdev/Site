import { useState, useRef, useEffect, MouseEvent } from 'react';
import { Modal, TextInput, Button, DarkThemeToggle } from 'flowbite-react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../api/cvApi';
import { isValidPassword } from '../utils/password';
import { isValidEmail } from '../utils/email';
import { formatAndLocalizeDrfErrors } from '../utils/apiErrorI18n';
import axios from 'axios';

const Navbar: React.FC = () => {
	const { t } = useTranslation();
	const { lang = 'it' } = useParams<{ lang?: string }>();
	
	const [isLoginOpen, setIsLoginOpen] = useState(false);
	const [isSignupOpen, setIsSignupOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('access_token'));
	
	// Form states
	const [loginEmail, setLoginEmail] = useState('');
	const [loginPassword, setLoginPassword] = useState('');
	const [signupUsername, setSignupUsername] = useState('');
	const [signupEmail, setSignupEmail] = useState('');
	const [signupPassword, setSignupPassword] = useState('');
	const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
	const [signupError, setSignupError] = useState('');
	const [signupInfo, setSignupInfo] = useState('');
	const [loginError, setLoginError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [emailError, setEmailError] = useState('');
	const [signupSubmitting, setSignupSubmitting] = useState(false);
	const [loginSubmitting, setLoginSubmitting] = useState(false);

	const mobileMenuRef = useRef<HTMLDivElement>(null);
	const loginAbortRef = useRef<AbortController | null>(null);
	const signupAbortRef = useRef<AbortController | null>(null);

	const abortLoginRequest = () => {
		loginAbortRef.current?.abort();
		loginAbortRef.current = null;
	};
	const abortSignupRequest = () => {
		signupAbortRef.current?.abort();
		signupAbortRef.current = null;
	};

	const openLoginModal = (e?: MouseEvent) => {
		e?.preventDefault();
		abortSignupRequest();
		setSignupSubmitting(false);
		setIsSignupOpen(false);
		setLoginError('');
		setLoginSubmitting(false);
		setIsLoginOpen(true);
		setMobileMenuOpen(false);
	};
	const closeLoginModal = () => {
		abortLoginRequest();
		setLoginSubmitting(false);
		setLoginError('');
		setLoginEmail('');
		setLoginPassword('');
		setIsLoginOpen(false);
	};
	const openSignupModal = (e?: MouseEvent) => {
		e?.preventDefault();
		abortLoginRequest();
		setLoginSubmitting(false);
		setIsLoginOpen(false);
		setSignupError('');
		setSignupInfo('');
		setPasswordError('');
		setEmailError('');
		setSignupSubmitting(false);
		setIsSignupOpen(true);
		setMobileMenuOpen(false);
	};
	const closeSignupModal = () => {
		abortSignupRequest();
		setSignupSubmitting(false);
		setSignupError('');
		setSignupInfo('');
		setPasswordError('');
		setEmailError('');
		setSignupUsername('');
		setSignupEmail('');
		setSignupPassword('');
		setSignupPasswordConfirm('');
		setIsSignupOpen(false);
	};

	const switchToSignup = () => {
		abortLoginRequest();
		setLoginSubmitting(false);
		setLoginError('');
		setLoginEmail('');
		setLoginPassword('');
		setIsLoginOpen(false);
		setSignupError('');
		setSignupInfo('');
		setPasswordError('');
		setEmailError('');
		setSignupSubmitting(false);
		setIsSignupOpen(true);
	};

	const switchToLogin = () => {
		abortSignupRequest();
		setSignupSubmitting(false);
		setSignupUsername('');
		setSignupEmail('');
		setSignupPassword('');
		setSignupPasswordConfirm('');
		setSignupError('');
		setSignupInfo('');
		setPasswordError('');
		setEmailError('');
		setIsSignupOpen(false);
		setLoginError('');
		setLoginSubmitting(false);
		setIsLoginOpen(true);
	};
	const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

	const login = async () => {
		if (loginSubmitting) return;

		const emailTrim = loginEmail.trim();
		setLoginError('');

		if (!isValidEmail(emailTrim)) {
			setLoginError(t('auth.login.emailInvalid'));
			return;
		}
		if (!loginPassword) {
			setLoginError(t('auth.login.passwordRequired'));
			return;
		}

		abortLoginRequest();
		const ac = new AbortController();
		loginAbortRef.current = ac;
		setLoginSubmitting(true);
		try {
			await apiLogin({ email: emailTrim, password: loginPassword }, { signal: ac.signal });
			setIsLoggedIn(true);
			closeLoginModal();
		} catch (e) {
			if (axios.isCancel(e)) return;
			if (axios.isAxiosError(e) && e.response?.data) {
				setLoginError(formatAndLocalizeDrfErrors(e.response.data, t));
			} else if (axios.isAxiosError(e) && !e.response) {
				setLoginError(t('auth.networkError'));
			} else {
				setLoginError(t('auth.login.genericError'));
			}
		} finally {
			setLoginSubmitting(false);
			loginAbortRef.current = null;
		}
	};

	const signup = async () => {
		if (signupSubmitting) return;

		const emailTrim = signupEmail.trim();
		const pass1 = signupPassword.trim();
		const pass2 = signupPasswordConfirm.trim();

		setEmailError('');
		setPasswordError('');
		setSignupError('');
		setSignupInfo('');

		if (!isValidEmail(emailTrim)) {
			setEmailError(t('auth.signup.emailInvalid'));
			return;
		}
		if (pass1 !== pass2) {
			setPasswordError(t('auth.signup.passwordMismatch'));
			return;
		}
		if (!isValidPassword(pass1)) {
			setPasswordError(t('auth.signup.passwordRules'));
			return;
		}

		abortSignupRequest();
		const ac = new AbortController();
		signupAbortRef.current = ac;
		setSignupSubmitting(true);
		try {
			const result = await apiRegister(
				{
					username: (signupUsername.trim() || emailTrim.split('@')[0]).slice(0, 150),
					email: emailTrim,
					password1: pass1,
					password2: pass2,
				},
				{ signal: ac.signal },
			);
			if (!result.ok) {
				setSignupError(formatAndLocalizeDrfErrors(result.data, t));
				return;
			}
			if (result.authenticated) {
				setIsLoggedIn(true);
				closeSignupModal();
				return;
			}
			setSignupInfo(t('auth.signup.pendingVerification'));
		} catch (e) {
			if (axios.isCancel(e)) return;
			if (axios.isAxiosError(e) && !e.response) {
				setSignupError(t('auth.networkError'));
			} else {
				setSignupError(t('errors.generic'));
			}
		} finally {
			setSignupSubmitting(false);
			signupAbortRef.current = null;
		}
	};

	const logout = async () => {
		try {
			await apiLogout();
		} finally {
			setIsLoggedIn(false);
		}
	};

	// Click outside to close mobile menu
	useEffect(() => {
		const handleClickOutside = (e: Event) => {
			if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
				setMobileMenuOpen(false);
			}
		};
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	}, [mobileMenuOpen]);

	// Stato login allineato tra tab (logout / login in un’altra finestra)
	useEffect(() => {
		const onStorage = (e: StorageEvent) => {
			if (e.key === 'access_token' || e.key === 'refresh_token') {
				setIsLoggedIn(!!localStorage.getItem('access_token'));
			}
		};
		window.addEventListener('storage', onStorage);
		return () => window.removeEventListener('storage', onStorage);
	}, []);

	useEffect(() => {
		return () => {
			loginAbortRef.current?.abort();
			signupAbortRef.current?.abort();
		};
	}, []);

	// Apri modal di registrazione da qualsiasi parte dell'app
	useEffect(() => {
		const handler = () => openSignupModal();
		window.addEventListener('open-signup', handler);
		return () => window.removeEventListener('open-signup', handler);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const navLinks = [
		{ href: `/${lang}#home`, label: t('layout.navbar.menu.home') },
		{ href: `/${lang}#about`, label: t('layout.navbar.menu.about') },
		{ href: `/${lang}#services`, label: t('layout.navbar.menu.services') },
		{ href: `/${lang}#price`, label: t('layout.navbar.menu.pricing') },
		{ href: `/${lang}#contact`, label: t('layout.navbar.menu.contact') },
	];

	return (
		<>
			<nav className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 sticky top-0 z-50">
				<div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						{/* Logo */}
						<Link to={`/${lang}`} className="flex items-center gap-2">
							<img src="/logo-nordev.png" className="h-8 w-8" alt={t('layout.navbar.brand')} />
							<span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{t('layout.navbar.brand')}</span>
						</Link>

						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center gap-8">
							{navLinks.map((link) => (
								<a
									key={link.href}
									href={link.href}
									className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
								>
									{link.label}
								</a>
							))}
						{isLoggedIn && (
							<>
								<Link to={`/${lang}/dashboard`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
									{t('layout.navbar.auth.dashboard')}
								</Link>
								<button type="button" onClick={logout} className="btn-ghost text-sm">
									{t('layout.navbar.auth.logout')}
								</button>
							</>
						)}
							{!isLoggedIn && (
								<>
									<button
										type="button"
										onClick={(e) => openLoginModal(e)}
										className="btn-secondary text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-500 dark:hover:bg-gray-700"
									>
										{t('auth.login.title')}
									</button>
									<button type="button" onClick={(e) => openSignupModal(e)} className="btn-primary text-sm">
										{t('auth.signup.title')}
									</button>
								</>
							)}
							<LanguageSelector />
							<DarkThemeToggle />
						</div>

						{/* Mobile Menu Button */}
						<div className="flex items-center gap-2 md:hidden">
							<LanguageSelector />
							<button
								type="button"
								onClick={toggleMobileMenu}
								className="btn-icon"
								aria-label="Toggle menu"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									{mobileMenuOpen ? (
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									) : (
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
									)}
								</svg>
							</button>
						</div>
					</div>

					{/* Mobile Menu */}
					{mobileMenuOpen && (
						<div ref={mobileMenuRef} className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
							<div className="flex flex-col gap-2">
								{navLinks.map((link) => (
									<a
										key={link.href}
										href={link.href}
										onClick={() => setMobileMenuOpen(false)}
										className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
									>
										{link.label}
									</a>
								))}
								{isLoggedIn ? (
									<>
										<Link 
											to={`/${lang}/dashboard`} 
											onClick={() => setMobileMenuOpen(false)}
											className="px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg dark:text-indigo-400 dark:hover:bg-indigo-900/20"
										>
													{t('layout.navbar.auth.dashboard')}
												</Link>
												<button
													type="button"
													onClick={() => { logout(); setMobileMenuOpen(false); }}
													className="px-3 py-2 text-sm font-medium text-left text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg dark:text-gray-400 dark:hover:text-white"
												>
													{t('layout.navbar.auth.logout')}
												</button>
									</>
								) : (
									<div className="flex flex-col gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
										<button
											type="button"
											onClick={(e) => openLoginModal(e)}
											className="btn-secondary w-full justify-center dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-500 dark:hover:bg-gray-700"
										>
											{t('auth.login.title')}
										</button>
										<button
											type="button"
											onClick={(e) => openSignupModal(e)}
											className="btn-primary w-full justify-center"
										>
											{t('auth.signup.title')}
										</button>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</nav>

			{/* Login Modal */}
			<Modal show={isLoginOpen} onClose={closeLoginModal} size="md" dismissible>
				<form
					className="contents"
					onSubmit={(e) => {
						e.preventDefault();
						void login();
					}}
				>
					<Modal.Header className="border-b border-gray-200 dark:border-gray-700">
						{t('auth.login.title')}
					</Modal.Header>
					<Modal.Body className="space-y-4">
						<TextInput
							id="login-email"
							type="email"
							autoComplete="email"
							placeholder={t('auth.login.email')}
							value={loginEmail}
							onChange={(e) => {
								setLoginEmail(e.target.value);
								setLoginError('');
							}}
							sizing="md"
							color={loginError ? 'failure' : undefined}
							aria-invalid={!!loginError}
							aria-describedby={loginError ? 'login-error-msg' : undefined}
						/>
						<TextInput
							id="login-password"
							type="password"
							autoComplete="current-password"
							placeholder={t('auth.login.password')}
							value={loginPassword}
							onChange={(e) => {
								setLoginPassword(e.target.value);
								setLoginError('');
							}}
							sizing="md"
							color={loginError ? 'failure' : undefined}
							aria-invalid={!!loginError}
							aria-describedby={loginError ? 'login-error-msg' : undefined}
						/>
						{loginError ? (
							<p id="login-error-msg" className="text-sm text-red-600" role="alert" aria-live="polite">
								{loginError}
							</p>
						) : null}
						<Link
							to={`/${lang}/forgot-password`}
							className="inline-block text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
							onClick={() => {
								setLoginError('');
								closeLoginModal();
							}}
						>
							{t('auth.login.forgot')}
						</Link>
						<p className="text-center text-sm text-gray-600 dark:text-gray-400">
							{t('auth.login.noAccount')}{' '}
							<button type="button" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400" onClick={switchToSignup}>
								{t('auth.login.signup')}
							</button>
						</p>
					</Modal.Body>
					<Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
						<div className="flex w-full gap-3">
							<Button type="button" onClick={closeLoginModal} color="gray" className="btn-ghost flex-1">
								{t('common.close')}
							</Button>
							<Button type="submit" disabled={loginSubmitting} className="btn-primary flex-1">
								{loginSubmitting ? t('common.loading') : t('auth.login.submit')}
							</Button>
						</div>
					</Modal.Footer>
				</form>
			</Modal>

			{/* Signup Modal — form + preventDefault evita reload su Invio; trim e lock anti doppio submit */}
			<Modal show={isSignupOpen} onClose={closeSignupModal} size="md" dismissible>
				<form
					className="contents"
					onSubmit={(e) => {
						e.preventDefault();
						void signup();
					}}
				>
					<Modal.Header className="border-b border-gray-200 dark:border-gray-700">
						{t('auth.signup.title')}
					</Modal.Header>
					<Modal.Body className="space-y-4">
						<TextInput
							id="signup-username"
							type="text"
							autoComplete="name"
							placeholder={t('auth.signup.name')}
							value={signupUsername}
							onChange={(e) => {
								setSignupUsername(e.target.value);
								setSignupError('');
							}}
							sizing="md"
						/>
						<TextInput
							id="signup-email"
							type="email"
							autoComplete="email"
							placeholder={t('auth.signup.email')}
							value={signupEmail}
							onChange={(e) => {
								setSignupEmail(e.target.value);
								setEmailError('');
								setSignupError('');
							}}
							sizing="md"
							color={emailError ? 'failure' : undefined}
							aria-invalid={!!emailError}
							aria-describedby={emailError ? 'signup-email-error' : undefined}
						/>
						{emailError ? (
							<p id="signup-email-error" className="text-sm text-red-600" role="alert" aria-live="polite">
								{emailError}
							</p>
						) : null}
						<TextInput
							id="signup-password"
							type="password"
							autoComplete="new-password"
							placeholder={t('auth.signup.password')}
							value={signupPassword}
							onChange={(e) => {
								setSignupPassword(e.target.value);
								setPasswordError('');
								setSignupError('');
							}}
							sizing="md"
							color={passwordError ? 'failure' : undefined}
							aria-invalid={!!passwordError}
							aria-describedby={passwordError ? 'signup-password-error' : undefined}
						/>
						<TextInput
							id="signup-password-confirm"
							type="password"
							autoComplete="new-password"
							placeholder={t('auth.signup.confirmPassword')}
							value={signupPasswordConfirm}
							onChange={(e) => {
								setSignupPasswordConfirm(e.target.value);
								setPasswordError('');
								setSignupError('');
							}}
							sizing="md"
							color={passwordError ? 'failure' : undefined}
							aria-invalid={!!passwordError}
							aria-describedby={passwordError ? 'signup-password-error' : undefined}
						/>
						{passwordError ? (
							<p id="signup-password-error" className="text-sm text-red-600" role="alert" aria-live="polite">
								{passwordError}
							</p>
						) : null}
						{signupInfo ? (
							<p className="text-sm text-green-700 dark:text-green-400" role="status" aria-live="polite">
								{signupInfo}
							</p>
						) : null}
						{signupError ? (
							<p id="signup-api-error" className="text-sm text-red-600" role="alert" aria-live="polite">
								{signupError}
							</p>
						) : null}
						<p className="text-center text-sm text-gray-600 dark:text-gray-400">
							{t('auth.signup.hasAccount')}{' '}
							<button type="button" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400" onClick={switchToLogin}>
								{t('auth.signup.login')}
							</button>
						</p>
					</Modal.Body>
					<Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
						<div className="flex w-full gap-3">
							<Button type="button" onClick={closeSignupModal} color="gray" className="btn-ghost flex-1">
								{t('common.close')}
							</Button>
							<Button type="submit" disabled={signupSubmitting} className="btn-primary flex-1">
								{signupSubmitting ? t('common.loading') : t('auth.signup.submit')}
							</Button>
						</div>
					</Modal.Footer>
				</form>
			</Modal>
		</>
	);
};

export default Navbar;