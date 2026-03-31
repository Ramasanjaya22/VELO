import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTrendingTools, getAllTools } from '$lib/server/db/tools';
import { initDb } from '$lib/server/db';
import { ingestTrending } from '$lib/server/ingestion/github';

export const GET: RequestHandler = async ({ url }) => {
	try {
		initDb();
		
		const type = url.searchParams.get('type') || 'recent';
		const hours = parseInt(url.searchParams.get('hours') || '24');
		const limit = parseInt(url.searchParams.get('limit') || '10');
		const refresh = url.searchParams.get('refresh') === 'true';
		
		if (refresh) {
			console.log('[API/trending] Refreshing trending data...');
			await ingestTrending(undefined, 'weekly', 25);
		}
		
		let tools;
		
		switch (type) {
			case 'recent':
				tools = getTrendingTools(hours, limit);
				break;
			case 'top':
				tools = getAllTools(limit, 0);
				break;
			default:
				tools = getTrendingTools(hours, limit);
		}
		
		return json({
			tools,
			type,
			total: tools.length,
			generatedAt: new Date().toISOString()
		});
	} catch (error) {
		console.error('[API/trending] Error:', error);
		return json(
			{ error: 'failed_to_fetch', message: 'Failed to fetch trending tools' },
			{ status: 500 }
		);
	}
};
