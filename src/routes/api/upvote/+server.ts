import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addUpvote, removeUpvote, hasUpvoted, getUpvoteCount } from '$lib/server/db/tools';
import { initDb } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	try {
		initDb();
		
		const body = await request.json();
		const { toolId, fingerprint, action = 'add' } = body;
		
		if (!toolId || !fingerprint) {
			return json(
				{ error: 'missing_params', message: 'toolId and fingerprint are required' },
				{ status: 400 }
			);
		}
		
		const ipHash = await hashString(getClientAddress());
		const userAgent = request.headers.get('user-agent') || undefined;
		
		if (action === 'remove') {
			const success = removeUpvote(toolId, fingerprint);
			return json({
				success,
				upvotes: getUpvoteCount(toolId),
				hasUpvoted: false
			});
		}
		
		if (hasUpvoted(toolId, fingerprint)) {
			return json(
				{ error: 'already_upvoted', message: 'You have already upvoted this tool' },
				{ status: 409 }
			);
		}
		
		const success = addUpvote(toolId, fingerprint, ipHash, userAgent);
		
		if (!success) {
			return json(
				{ error: 'upvote_failed', message: 'Failed to add upvote' },
				{ status: 500 }
			);
		}
		
		return json({
			success: true,
			upvotes: getUpvoteCount(toolId),
			hasUpvoted: true
		});
	} catch (error) {
		console.error('[API/upvote] Error:', error);
		return json(
			{ error: 'server_error', message: 'Failed to process upvote' },
			{ status: 500 }
		);
	}
};

export const GET: RequestHandler = async ({ url }) => {
	try {
		initDb();
		
		const toolId = url.searchParams.get('toolId');
		const fingerprint = url.searchParams.get('fingerprint');
		
		if (!toolId) {
			return json(
				{ error: 'missing_params', message: 'toolId is required' },
				{ status: 400 }
			);
		}
		
		const upvotes = getUpvoteCount(toolId);
		const userHasUpvoted = fingerprint ? hasUpvoted(toolId, fingerprint) : false;
		
		return json({
			upvotes,
			hasUpvoted: userHasUpvoted
		});
	} catch (error) {
		console.error('[API/upvote] Error:', error);
		return json(
			{ error: 'server_error', message: 'Failed to fetch upvote status' },
			{ status: 500 }
		);
	}
};

async function hashString(str: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(str);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
