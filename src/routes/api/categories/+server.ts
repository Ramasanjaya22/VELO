import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCategories, getToolsByCategory } from '$lib/server/db/tools';
import { initDb } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
	try {
		initDb();
		
		const slug = url.searchParams.get('slug');
		const withTools = url.searchParams.get('withTools') === 'true';
		const limit = parseInt(url.searchParams.get('limit') || '50');
		
		if (slug) {
			const tools = getToolsByCategory(slug, limit);
			return json({
				slug,
				tools,
				total: tools.length
			});
		}
		
		const categories = getCategories();
		
		if (withTools) {
			const categoriesWithTools = categories.map(cat => ({
				...cat,
				tools: getToolsByCategory(cat.slug, 5)
			}));
			return json({ categories: categoriesWithTools });
		}
		
		return json({ categories });
	} catch (error) {
		console.error('[API/categories] Error:', error);
		return json(
			{ error: 'failed_to_fetch', message: 'Failed to fetch categories' },
			{ status: 500 }
		);
	}
};
