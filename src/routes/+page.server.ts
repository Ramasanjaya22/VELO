import type { TrendingData } from '$lib/types';
import { getTrendingData } from '$lib/server/site';

interface PageData {
	trending: TrendingData;
}

export async function load(): Promise<PageData> {
	try {
		const trending = getTrendingData();
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
