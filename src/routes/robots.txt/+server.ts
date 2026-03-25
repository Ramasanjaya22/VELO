import { buildAbsoluteUrl } from '$lib/server/site';

export const prerender = true;

export function GET() {
	const body = `User-agent: *
Allow: /

Sitemap: ${buildAbsoluteUrl('/sitemap.xml')}
`;

	return new Response(body, {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
}
