import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as cheerio from 'cheerio';
import Firecrawl from '@mendable/firecrawl-js';
import { rankProducts } from '../src/lib/scoring';
import type { Tool, TrendingData } from '../src/lib/types';
import { RETENTION_CONFIG, SCRAPE_CONFIG } from './lib/config';
import { ensureDir, writeJSON, getDatePrefix } from './lib/fs-utils';

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const GITHUB_TRENDING_URL = 'https://github.com/trending?since=weekly';

interface RawRepo {
	name: string;
	url: string;
	description: string;
	language: string;
	stars: number;
	starsGrowth: number;
	forks: number;
	topics: string[];
	contributors: number;
	avatarUrl?: string;
}

function toSlug(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function upscaleGitHubAvatar(url?: string): string | undefined {
	if (!url) return undefined;
	return url.replace(/([?&]s=)\d+/i, '$196');
}

function normalizeTool(repo: RawRepo): Tool {
	const slug = toSlug(repo.name);
	return {
		rank: 0,
		name: repo.name,
		slug,
		url: repo.url,
		description: repo.description || 'AI tool listing imported from trending source.',
		category: repo.topics[0] || repo.language || 'general',
		useCases: repo.topics.slice(0, 3),
		bestFor: repo.topics.slice(0, 2),
		pricingModel: 'unknown',
		affiliateAvailable: false,
		trustScore: Math.min(40 + (repo.description ? 15 : 0) + (repo.avatarUrl ? 10 : 0), 100),
		score: 0,
		logoUrl: upscaleGitHubAvatar(repo.avatarUrl),
		updatedAt: new Date().toISOString(),
		sourceIds: [`github:${slug}`],
		legacy: {
			language: repo.language,
			stars: repo.stars,
			starsGrowth: repo.starsGrowth,
			forks: repo.forks,
			topics: repo.topics,
			contributors: repo.contributors
		}
	};
}

function parseStarCount(text: string): number {
	if (!text) return 0;
	const cleaned = text.trim().toLowerCase().replace(/,/g, '');
	if (cleaned.includes('k')) {
		return Math.round(parseFloat(cleaned) * 1000);
	}
	return parseInt(cleaned, 10) || 0;
}

function parseGitHubTrending(html: string): RawRepo[] {
	const $ = cheerio.load(html);
	const repos: RawRepo[] = [];

	$('article.Box-row').each((_: number, element: any) => {
		try {
			const $article = $(element);
			const $link = $article.find('h2 a');
			const name = $link.text().trim().replace(/\s+/g, '');
			const href = $link.attr('href') || '';
			const url = href.startsWith('http') ? href : `https://github.com${href}`;

			const description = $article.find('p.col-9').text().trim() || '';

			const $lang = $article.find('[itemprop="programmingLanguage"]');
			const language = $lang.text().trim() || 'Unknown';

			const $stars = $article.find('a.Link--muted').first();
			const starsText = $stars.text().trim();
			const stars = parseStarCount(starsText);

			const $forks = $article.find('a.Link--muted').eq(1);
			const forksText = $forks.text().trim();
			const forks = parseStarCount(forksText.split('/').pop() || forksText);

			const $growth = $article.find('span.d-inline-block.float-sm-right');
			const growthText = $growth.text().trim();
			let starsGrowth = 0;
			const growthMatch = growthText.match(/(\d+,?\d*)\s*(stars?|this week)/i);
			if (growthMatch) {
				starsGrowth = parseStarCount(growthMatch[1]);
			}

			const topics: string[] = [];
			$article.find('[data-topic-tag]').each((__: number, topicEl: any) => {
				const topic = $(topicEl).attr('data-topic-tag');
				if (topic) topics.push(topic);
			});

			const $avatar = $article.find('img.avatar');
			const avatarUrl = $avatar.attr('src') || undefined;

			repos.push({
				name,
				url,
				description,
				language,
				stars,
				starsGrowth,
				forks,
				topics,
				contributors: 1,
				avatarUrl
			});
		} catch (err) {
			console.error('[WARN] Failed to parse repo:', err);
		}
	});

	return repos;
}

async function fetchWithFirecrawl(): Promise<string> {
	if (!FIRECRAWL_API_KEY) {
		throw new Error('FIRECRAWL_API_KEY is required');
	}
	const firecrawl = new Firecrawl({ apiKey: FIRECRAWL_API_KEY });

	console.log('[INFO] Fetching GitHub Trending via Firecrawl...');

	try {
		const result = await firecrawl.scrape(GITHUB_TRENDING_URL, {
			formats: ['html']
		});

		const html = result.html;
		if (!html) {
			throw new Error('No HTML content returned from Firecrawl');
		}

		return html;
	} catch (error) {
		throw new Error(
			`Firecrawl failed: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
}

async function fetchDirectly(): Promise<string> {
	console.log('[INFO] Fetching GitHub Trending directly...');

	const response = await fetch(GITHUB_TRENDING_URL, {
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
			Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
		}
	});

	if (!response.ok) {
		throw new Error(`Direct fetch failed: ${response.status}`);
	}

	return response.text();
}

function loadCachedData(): { products: RawRepo[]; lastUpdated: string } | null {
	try {
		const cachedPath = join(process.cwd(), 'static', 'data', 'trending.json');
		if (existsSync(cachedPath)) {
			const content = readFileSync(cachedPath, 'utf-8');
			const data = JSON.parse(content);
			console.log('[INFO] Loaded cached data from', data.lastUpdated);
			return data;
		}
	} catch (err) {
		console.error('[WARN] Failed to load cache:', err);
	}
	return null;
}

function isCacheFresh(cached: { lastUpdated: string } | null): boolean {
	if (!cached || SCRAPE_CONFIG.FORCE_SCRAPE) return false;
	const age = Date.now() - new Date(cached.lastUpdated).getTime();
	return age < RETENTION_CONFIG.TTL_MINUTES * 60 * 1000;
}

function getCacheAge(cached: { lastUpdated: string } | null): number {
	if (!cached) return Infinity;
	return Date.now() - new Date(cached.lastUpdated).getTime();
}

function archiveSnapshot(data: TrendingData): void {
	const datePrefix = getDatePrefix();
	const historyPath = join(process.cwd(), RETENTION_CONFIG.HISTORY_DIR, `${datePrefix}.json`);

	writeJSON(historyPath, {
		...data,
		archivedAt: new Date().toISOString()
	});

	if (SCRAPE_CONFIG.VERBOSE) {
		console.log(`[ARCHIVE] Snapshot saved: ${historyPath}`);
	}
}

async function scrapeGitHubTrending(): Promise<void> {
	console.log('VELO Scraper - v2 (with retention)');
	console.log('====================================\n');

	const cached = loadCachedData();

	if (isCacheFresh(cached)) {
		const age = Math.round(getCacheAge(cached) / 60000);
		console.log(`[CACHE] Data is fresh (${age} min old). Use --force to re-scrape.`);
		console.log(`[INFO] Output: ${join(process.cwd(), 'static', 'data', 'trending.json')}`);
		return;
	}

	if (SCRAPE_CONFIG.FORCE_SCRAPE) {
		console.log('[INFO] Force scrape enabled (--force)');
	}

	let html: string;
	const source = 'github-trending-weekly';

	try {
		html = await fetchWithFirecrawl();
		console.log('[SUCCESS] Fetched via Firecrawl');
	} catch (firecrawlError) {
		console.error('[WARN] Firecrawl failed:', firecrawlError);
		console.log('[INFO] Trying direct fetch...');

		try {
			html = await fetchDirectly();
			console.log('[SUCCESS] Fetched directly from GitHub');
		} catch (directError) {
			console.error('[ERROR] Direct fetch also failed:', directError);

			if (cached && cached.products.length > 0) {
				console.log('[INFO] Using stale cache...');
				const data: TrendingData = {
					lastUpdated: cached.lastUpdated,
					source: 'cached-stale',
					products: cached.products as unknown as Tool[]
				};

				const outputPath = join(process.cwd(), 'static', 'data', 'trending.json');
				writeJSON(outputPath, data);

				console.log(`[SUCCESS] Using stale cache: ${data.products.length} products`);
				console.log(`[INFO] Output: ${outputPath}`);
				return;
			}

			throw new Error('All fetch methods failed and no cache available');
		}
	}

	console.log('[INFO] Parsing trending repositories...');
	const rawRepos = parseGitHubTrending(html);
	console.log(`[INFO] Found ${rawRepos.length} repositories`);

	if (rawRepos.length === 0) {
		console.error('[ERROR] No repositories found');
		throw new Error('No repositories parsed from HTML');
	}

	console.log('[INFO] Calculating scores and ranking...');
	const tools = rawRepos.map(normalizeTool);
	const rankedProducts = rankProducts(tools);

	const data: TrendingData = {
		lastUpdated: new Date().toISOString(),
		source,
		products: rankedProducts
	};

	const dataDir = join(process.cwd(), 'static', 'data');
	ensureDir(dataDir);
	const outputPath = join(dataDir, 'trending.json');
	writeJSON(outputPath, data);

	archiveSnapshot(data);

	console.log(`\n[SUCCESS] Data written to ${outputPath}`);
	console.log(`[INFO] ${data.products.length} tools scraped and ranked.`);

	console.log('\n[INFO] Top 5:');
	data.products.slice(0, 5).forEach((p, i) => {
		console.log(`  ${i + 1}. ${p.name} - Score: ${(p.score ?? 0).toFixed(1)} (${p.category ?? 'general'})`);
	});
}

scrapeGitHubTrending().catch((err) => {
	console.error('[FATAL]', err);
	process.exit(1);
});
