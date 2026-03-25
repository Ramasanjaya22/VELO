import { buildAbsoluteUrl, getTrendingData } from '$lib/server/site';

export const prerender = true;

function escapeXml(value: string) {
	return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function formatLastmod(value?: string) {
	if (!value) return undefined;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return undefined;
	return date.toISOString();
}

type SitemapEntry = {
	path: string;
	lastmod?: string;
};

export function GET() {
	const trending = getTrendingData();
	const products = trending.products ?? [];

	const urls: Array<SitemapEntry | null> = [
		{ path: '/', lastmod: trending.lastUpdated },
		{ path: '/about', lastmod: trending.lastUpdated },
		{ path: '/archive', lastmod: trending.lastUpdated },
		{ path: '/submit', lastmod: trending.lastUpdated },
		...products.map((tool) => ({
			path: `/tool/${encodeURIComponent(tool.slug ?? tool.name)}`,
			lastmod: tool.updatedAt ?? trending.lastUpdated
		})),
		...products.flatMap((tool) => [
			tool.category
				? { path: `/category/${encodeURIComponent(tool.category)}`, lastmod: trending.lastUpdated }
				: null,
			tool.slug
				? {
						path: `/best-for/${encodeURIComponent(tool.slug)}`,
						lastmod: tool.updatedAt ?? trending.lastUpdated
					}
				: null
		])
	];

	const uniqueUrls = Array.from(
		new Map(
			urls
				.filter((entry): entry is SitemapEntry => Boolean(entry))
				.map((entry) => [entry.path, entry])
		).values()
	);
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls
	.map(
		(entry) => `  <url>
    <loc>${escapeXml(buildAbsoluteUrl(entry.path))}</loc>
    ${formatLastmod(entry.lastmod) ? `<lastmod>${escapeXml(formatLastmod(entry.lastmod)!)}</lastmod>` : ''}
  </url>`
	)
	.join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
}
