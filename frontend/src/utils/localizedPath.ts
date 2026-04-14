/** Lingue supportate dalle route `/:lang/...` (evita import circolari con i18n). */
const ROUTE_LANGS = ['it', 'en'] as const;
export type RouteLang = (typeof ROUTE_LANGS)[number];

const DEFAULT_LANG: RouteLang = 'it';

function isRouteLang(s: string): s is RouteLang {
	return (ROUTE_LANGS as readonly string[]).includes(s);
}

/**
 * Ricava `it` / `en` da pathname (`/it/dashboard`) o da `i18nextLng` in localStorage.
 */
export function getRouteLangFromBrowser(): RouteLang {
	if (typeof window === 'undefined') return DEFAULT_LANG;

	const fromPath = window.location.pathname.match(/^\/(en|it)(?:\/|$)/);
	if (fromPath?.[1] && isRouteLang(fromPath[1])) return fromPath[1];

	const stored = window.localStorage.getItem('i18nextLng');
	if (stored) {
		const base = stored.split('-')[0]?.toLowerCase();
		if (base && isRouteLang(base)) return base;
	}

	return DEFAULT_LANG;
}

/**
 * Dopo refresh JWT fallito o sessione non valida: home localizzata (il login è in modale sulla home).
 */
export function redirectToLocalizedHome(): void {
	const lang = getRouteLangFromBrowser();
	window.location.assign(`/${lang}/`);
}
