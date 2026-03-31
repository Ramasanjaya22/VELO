import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'fs';

const CACHE_DIR = join(process.cwd(), 'data', 'cache');

interface CacheEntry<T> {
	data: T;
	expiresAt: number;
}

if (!existsSync(CACHE_DIR)) {
	mkdirSync(CACHE_DIR, { recursive: true });
}

function getCachePath(key: string): string {
	const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
	return join(CACHE_DIR, `${safeKey}.json`);
}

export function getCache<T>(key: string): T | null {
	try {
		const cachePath = getCachePath(key);
		
		if (!existsSync(cachePath)) {
			return null;
		}
		
		const content = readFileSync(cachePath, 'utf-8');
		const entry: CacheEntry<T> = JSON.parse(content);
		
		if (Date.now() > entry.expiresAt) {
			return null;
		}
		
		return entry.data;
	} catch (e) {
		return null;
	}
}

export function setCache<T>(key: string, data: T, ttlSeconds = 3600): void {
	try {
		const cachePath = getCachePath(key);
		const entry: CacheEntry<T> = {
			data,
			expiresAt: Date.now() + (ttlSeconds * 1000)
		};
		
		writeFileSync(cachePath, JSON.stringify(entry), 'utf-8');
	} catch (e) {
		console.error('[Cache] Failed to set cache:', e);
	}
}

export function deleteCache(key: string): void {
	try {
		const cachePath = getCachePath(key);
		if (existsSync(cachePath)) {
			const { unlinkSync } = require('fs');
			unlinkSync(cachePath);
		}
	} catch (e) {
		console.error('[Cache] Failed to delete cache:', e);
	}
}

export function clearCache(): void {
	try {
		const { readdirSync, unlinkSync } = require('fs');
		const files = readdirSync(CACHE_DIR);
		for (const file of files) {
			if (file.endsWith('.json')) {
				unlinkSync(join(CACHE_DIR, file));
			}
		}
	} catch (e) {
		console.error('[Cache] Failed to clear cache:', e);
	}
}

export function getCacheStats(): { total: number; size: number } {
	try {
		const { readdirSync } = require('fs');
		const files = readdirSync(CACHE_DIR).filter((f: string) => f.endsWith('.json'));
		let totalSize = 0;
		
		for (const file of files) {
			const stats = statSync(join(CACHE_DIR, file));
			totalSize += stats.size;
		}
		
		return { total: files.length, size: totalSize };
	} catch (e) {
		return { total: 0, size: 0 };
	}
}

export async function withCache<T>(
	key: string,
	fetcher: () => Promise<T>,
	ttlSeconds = 3600
): Promise<T> {
	const cached = getCache<T>(key);
	if (cached !== null) {
		return cached;
	}
	
	const data = await fetcher();
	setCache(key, data, ttlSeconds);
	return data;
}
