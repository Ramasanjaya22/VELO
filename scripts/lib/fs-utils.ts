import {
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
	readdirSync,
	unlinkSync,
	statSync
} from 'fs';
import { join, dirname } from 'path';

export function ensureDir(dir: string): void {
	mkdirSync(dir, { recursive: true });
}

export function readJSON<T>(path: string): T | null {
	if (!existsSync(path)) return null;
	return JSON.parse(readFileSync(path, 'utf-8')) as T;
}

export function writeJSON(path: string, data: unknown): void {
	ensureDir(dirname(path));
	writeFileSync(path, JSON.stringify(data, null, 2));
}

export function getDatePrefix(): string {
	return new Date().toISOString().split('T')[0];
}

export function getWeekPrefix(): string {
	const now = new Date();
	const startOfYear = new Date(now.getFullYear(), 0, 1);
	const days = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
	const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
	return `${now.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

export function cleanupOldFiles(dir: string, maxAgeMs: number, pattern: RegExp): void {
	if (!existsSync(dir)) return;

	const files = readdirSync(dir);
	const cutoff = Date.now() - maxAgeMs;

	for (const file of files) {
		if (!pattern.test(file)) continue;
		const filePath = join(dir, file);
		try {
			const mtime = statSync(filePath).mtime.getTime();
			if (mtime < cutoff) {
				unlinkSync(filePath);
			}
		} catch {
			// Skip files that can't be stat'd
		}
	}
}
