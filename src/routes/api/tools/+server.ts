import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllTools, searchTools, getToolById } from '$lib/server/db/tools';
import { initDb } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
	try {
		initDb();
		
		const search = url.searchParams.get('search');
		const limit = parseInt(url.searchParams.get('limit') || '50');
		const offset = parseInt(url.searchParams.get('offset') || '0');
		
		if (search) {
			const tools = searchTools(search, limit);
			return json({ tools, total: tools.length });
		}
		
		const tools = getAllTools(limit, offset);
		
		return json({
			tools,
			total: tools.length,
			pagination: {
				limit,
				offset,
				hasMore: tools.length === limit
			}
		});
	} catch (error) {
		console.error('[API/tools] Error:', error);
		return json(
			{ error: 'failed_to_fetch', message: 'Failed to fetch tools' },
			{ status: 500 }
		);
	}
};
