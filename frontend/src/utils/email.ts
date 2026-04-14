/**
 * Validazione email lato client (pragmatica, non RFC5322 completa).
 * Usa sempre la trim prima del confronto con il backend.
 */
export function isValidEmail(email: string): boolean {
	const t = email.trim();
	if (t.length < 5 || t.length > 254) return false;
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}
