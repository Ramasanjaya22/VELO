import type { TrendingData } from '$lib/types';
import { getAllTools, getTrendingTools, getCategories } from '$lib/server/db/tools';
import { initDb } from '$lib/server/db';

interface PageData {
	trending: TrendingData;
	categories: Array<{ slug: string; name: string; count: number }>;
}

export async function load(): Promise<PageData> {
	try {
		initDb();
		
		const [tools, trendingTools, categories] = await Promise.all([
			Promise.resolve(getAllTools(100, 0)),
			Promise.resolve(getTrendingTools(24, 10)),
			Promise.resolve(getCategories())
		]);
		
		return {
			trending: {
				lastUpdated: new Date().toISOString(),
				source: 'ai-tools-ranking',
				products: trendingTools.length > 0 ? trendingTools : tools
			},
			categories: categories.length > 0 ? categories : []
		};
	} catch (e) {
		console.error('Failed to load trending data:', e);
		return {
			trending: {
				lastUpdated: new Date().toISOString(),
				source: 'ai-tools-ranking',
				products: []
			},
			categories: []
		};
	}
}
