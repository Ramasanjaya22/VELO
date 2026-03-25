import { buildAbsoluteUrl } from '$lib/server/site';

export const prerender = true;

export function GET() {
	const body = `# VELO

VELO is a curated AI tools directory focused on fast discovery, ranking, and comparison.

## Important pages
- ${buildAbsoluteUrl('/')}
- ${buildAbsoluteUrl('/archive')}
- ${buildAbsoluteUrl('/about')}
- ${buildAbsoluteUrl('/submit')}

## Content notes
- Trending tools are scored and sorted by signal.
- Tool detail pages live under /tool/[id].
- Comparison pages live under /compare/[slug].
- Weekly archives live under /weekly/[weekKey].
`;

	return new Response(body, {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
}
