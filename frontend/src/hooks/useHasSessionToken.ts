import { useState, useEffect } from 'react';

/** True se è presente un access token (stesso criterio di Navbar / area autenticata). */
export function useHasSessionToken(): boolean {
	const [has, setHas] = useState(() =>
		typeof window !== 'undefined' ? !!localStorage.getItem('access_token') : false,
	);

	useEffect(() => {
		const sync = () => setHas(!!localStorage.getItem('access_token'));
		window.addEventListener('storage', sync);
		window.addEventListener('auth-token-changed', sync);
		return () => {
			window.removeEventListener('storage', sync);
			window.removeEventListener('auth-token-changed', sync);
		};
	}, []);

	return has;
}
