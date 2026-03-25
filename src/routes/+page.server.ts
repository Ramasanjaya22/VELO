import type { TrendingData } from '$lib/types';
import fs from 'fs';
import path from 'path';

interface PageData {
	trending: TrendingData;
}

export async function load(): Promise<PageData> {
	try {
		const historyDir = path.resolve('data', 'history');
		const files = fs.readdirSync(historyDir).filter(f => f.endsWith('.json')).sort().reverse();
		if (files.length === 0) {
			throw new Error('No history files found');
		}
		const filePath = path.join(historyDir, files[0]);
		const fileContent = fs.readFileSync(filePath, 'utf-8');
		const trending: TrendingData = JSON.parse(fileContent);
		return { trending };
	} catch (e) {
		console.error('Failed to load trending data:', e);
		return {
			trending: {
				lastUpdated: new Date().toISOString(),
				source: 'ai-tools-ranking',
				products: []
			}
		};
	}
}
