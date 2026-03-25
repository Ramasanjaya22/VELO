import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const githubUrl = url.searchParams.get('url');

	if (!githubUrl) {
		return json({ error: 'missing_url', message: 'No URL provided' }, { status: 400 });
	}

	const apiKey = process.env.FIRECRAWL_API_KEY;
	if (!apiKey) {
		return json(
			{ error: 'not_configured', message: 'README fetch is not available' },
			{ status: 500 }
		);
	}

	try {
		const firecrawlUrl = 'https://api.firecrawl.dev/v0/scrape';

		const response = await fetch(firecrawlUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				url: githubUrl,
				formats: ['markdown'],
				onlyMainContent: true
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('[API/readme] Firecrawl error:', errorText);
			return json(
				{ error: 'fetch_failed', message: 'Unable to retrieve documentation' },
				{ status: 500 }
			);
		}

		const data = await response.json();
		const content = data.data?.markdown || '';

		if (!content) {
			return json(
				{ error: 'no_content', message: 'No documentation found for this repository' },
				{ status: 404 }
			);
		}

		return json({
			content,
			truncated: content.length > 500,
			cached: false
		});
	} catch (error) {
		console.error('[API/readme] Error:', error);
		return json(
			{ error: 'server_error', message: 'Documentation fetch encountered an issue' },
			{ status: 500 }
		);
	}
};
