import { writable } from 'svelte/store';

export interface Toast {
	id: number;
	message: string;
}

const TOAST_DURATION = 1500;

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);
	let nextId = 0;

	function add(message: string) {
		const id = nextId++;
		update((toasts) => [...toasts, { id, message }]);
		setTimeout(() => remove(id), TOAST_DURATION);
	}

	function remove(id: number) {
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	return {
		subscribe,
		add,
		remove
	};
}

export const toasts = createToastStore();
