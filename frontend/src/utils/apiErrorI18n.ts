import type { TFunction } from 'i18next';

/** Estrae testo da risposte DRF / dj-rest-auth. */
export function collectDrfErrorStrings(data: unknown): string[] {
	if (!data || typeof data !== 'object') return [];
	const d = data as Record<string, unknown>;
	const parts: string[] = [];
	if (typeof d.detail === 'string') parts.push(d.detail);
	for (const [k, v] of Object.entries(d)) {
		if (k === 'detail') continue;
		if (Array.isArray(v)) parts.push(...v.filter((x): x is string => typeof x === 'string'));
		else if (typeof v === 'string') parts.push(v);
	}
	return parts;
}

/**
 * Sostituisce messaggi noti del backend (IT/EN Django/allauth) con stringhe i18n.
 * Il testo unito viene analizzato per sottostringhe (ordine: più specifiche prima).
 */
export function localizeBackendErrors(merged: string, t: TFunction): string {
	if (!merged.trim()) return t('errors.generic');

	const replacements: [string, string][] = [
		// Rate limiting (DRF)
		['Request was throttled.', 'auth.rateLimited'],
		['Richiesta limitata.', 'auth.rateLimited'],
		// Username
		['Un utente con questo nome è già presente.', 'auth.apiErrors.usernameTaken'],
		['Un utente con questo nome è già registrato.', 'auth.apiErrors.usernameTaken'],
		['A user with that username already exists.', 'auth.apiErrors.usernameTaken'],
		// Email
		['Un utente con questa email è già registrato.', 'auth.apiErrors.emailTaken'],
		['Un utente con questa email è già registrato', 'auth.apiErrors.emailTaken'],
		['A user is already registered with this e-mail address.', 'auth.apiErrors.emailTaken'],
		['This e-mail address is already associated with another account.', 'auth.apiErrors.emailTaken'],
		// Password match
		["The two password fields didn't match.", 'auth.apiErrors.passwordMismatch'],
		['I due campi password non sono uguali.', 'auth.apiErrors.passwordMismatch'],
		['Le due password non coincidono.', 'auth.apiErrors.passwordMismatch'],
		// Login / verification
		['Unable to log in with provided credentials.', 'auth.apiErrors.invalidLogin'],
		['No active account found with the given credentials.', 'auth.apiErrors.invalidLogin'],
		['Impossibile eseguire il login con le credenziali fornite.', 'auth.apiErrors.invalidLogin'],
		['E-mail is not verified.', 'auth.apiErrors.emailNotVerified'],
		["L'indirizzo email non è verificato.", 'auth.apiErrors.emailNotVerified'],
		['Indirizzo email non verificato.', 'auth.apiErrors.emailNotVerified'],
		// Email format
		['Enter a valid email address.', 'auth.apiErrors.invalidEmail'],
		['Inserisci un indirizzo email valido.', 'auth.apiErrors.invalidEmail'],
		// Generic verification email sent (keep as info, still map if shown as error)
		['Verification e-mail sent.', 'auth.apiErrors.verificationSent'],
	];

	let out = merged;
	for (const [needle, key] of replacements) {
		if (out.includes(needle)) {
			out = out.split(needle).join(t(key));
		}
	}
	return out.trim() || t('errors.generic');
}

export function formatAndLocalizeDrfErrors(data: unknown, t: TFunction): string {
	const parts = collectDrfErrorStrings(data);
	const merged = parts.join(' ').trim();
	if (!merged) return t('errors.generic');
	return localizeBackendErrors(merged, t);
}
