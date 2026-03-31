import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getToolBySlug, incrementToolViews } from '$lib/server/db/tools';
import { initDb } from '$lib/server/db';
import { refreshToolData } from '$lib/server/ingestion/github';

export const GET: RequestHandler = async ({ params }) => {
	try {
		initDb();
		
		const { id } = params;
		
		let tool = getToolBySlug(id);
		
		if (!tool) {
			tool = await refreshToolData(id);
		}
		
		if (!tool) {
			return json(
				{ error: 'not_found', message: 'Tool not found' },
				{ status: 404 }
			);
		}
		
		if (tool.id) {
			incrementToolViews(tool.id);
		}
		
		return json({ tool });
	} catch (error) {
		console.error('[API/tools/[id]] Error:', error);
		return json(
			{ error: 'failed_to_fetch', message: 'Failed to fetch tool' },
			{ status: 500 }
		);
	}
};
