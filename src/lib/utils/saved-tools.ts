import type { Tool } from '$lib/types';

export interface SavedTool extends Tool {
	savedAt: string;
}

const STORAGE_KEY = 'velo.saved-tools.v1';

function getToolKey(tool: Pick<Tool, 'slug' | 'name'>): string {
	return tool.slug ?? tool.name;
}

function isBrowser(): boolean {
	return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeSavedTool(tool: Tool, savedAt = new Date().toISOString()): SavedTool {
	return {
		...tool,
		savedAt
	};
}

export function loadSavedTools(): SavedTool[] {
	if (!isBrowser()) return [];

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];

		const parsed = JSON.parse(raw) as SavedTool[];
		if (!Array.isArray(parsed)) return [];

		return parsed
			.filter((tool) => tool && typeof tool.name === 'string')
			.map((tool) => normalizeSavedTool(tool, tool.savedAt ?? new Date().toISOString()));
	} catch {
		return [];
	}
}

function persistSavedTools(tools: SavedTool[]): void {
	if (!isBrowser()) return;
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
}

export function saveTool(tool: Tool): SavedTool[] {
	const current = loadSavedTools();
	const key = getToolKey(tool);
	const exists = current.some((item) => getToolKey(item) === key);
	if (exists) return current;

	const next = [normalizeSavedTool(tool), ...current];
	persistSavedTools(next);
	return next;
}

export function removeTool(tool: Pick<Tool, 'slug' | 'name'>): SavedTool[] {
	const current = loadSavedTools();
	const key = getToolKey(tool);
	const next = current.filter((item) => getToolKey(item) !== key);
	persistSavedTools(next);
	return next;
}

export function toggleTool(tool: Tool): SavedTool[] {
	const current = loadSavedTools();
	const key = getToolKey(tool);
	const exists = current.some((item) => getToolKey(item) === key);

	if (exists) {
		return removeTool(tool);
	}

	return saveTool(tool);
}

export function clearSavedTools(): void {
	if (!isBrowser()) return;
	window.localStorage.removeItem(STORAGE_KEY);
}

export function getSavedToolKey(tool: Pick<Tool, 'slug' | 'name'>): string {
	return getToolKey(tool);
}
