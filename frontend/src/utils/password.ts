/** Stessa regola usata in registrazione (Unicode, simbolo, 8+ caratteri). */
export function isValidPassword(password: string): boolean {
	return /^(?=.*\p{Ll})(?=.*\p{Lu})(?=.*\p{Nd})(?=.*[^\p{L}\p{N}_]).{8,}$/u.test(password);
}
