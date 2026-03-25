import { writable } from 'svelte/store';

function createThemeStore() {
	const { subscribe, set } = writable<'light' | 'dark'>('light');

	return {
		subscribe,
		toggle: () => {
			const current =
				typeof document !== 'undefined'
					? document.documentElement.getAttribute('data-theme')
					: 'light';
			const next: 'light' | 'dark' = current === 'dark' ? 'light' : 'dark';
			if (typeof document !== 'undefined') {
				document.documentElement.setAttribute('data-theme', next);
				localStorage.setItem('theme', next);
			}
			set(next);
		},
		init: () => {
			if (typeof document === 'undefined') return;

			const saved = localStorage.getItem('theme');
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			const initialTheme: 'light' | 'dark' =
				saved === 'dark' || saved === 'light' ? saved : prefersDark ? 'dark' : 'light';

			document.documentElement.setAttribute('data-theme', initialTheme);
			set(initialTheme);
		}
	};
}

export const theme = createThemeStore();
