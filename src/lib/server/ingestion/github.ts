import { upsertTool, recordToolHistory } from '../db/tools.js';
import { getCache, setCache } from '../cache/index.js';
import type { Tool } from '../../../types.js';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

interface GitHubRepo {
	id: number;
	name: string;
	full_name: string;
	html_url: string;
	description: string | null;
	stargazers_count: number;
	forks_count: number;
	language: string | null;
	topics: string[];
	created_at: string;
	updated_at: string;
	pushed_at: string;
	owner: {
		login: string;
		avatar_url: string;
	};
}

interface TrendingItem {
	repositoryName: string;
	starsSince: number;
}

function getHeaders(): Record<string, string> {
	const headers: Record<string, string> = {
		'Accept': 'application/vnd.github.v3+json',
		'User-Agent': 'VELO-AI-Ranking'
	};
	
	if (GITHUB_TOKEN) {
		headers['Authorization'] = `token ${GITHUB_TOKEN}`;
	}
	
	return headers;
}

async function fetchWithRateLimit(url: string): Promise<Response> {
	const response = await fetch(url, { headers: getHeaders() });
	
	if (response.status === 403) {
		const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
		const rateLimitReset = response.headers.get('X-RateLimit-Reset');
		
		if (rateLimitRemaining === '0' && rateLimitReset) {
			const resetTime = parseInt(rateLimitReset) * 1000;
			const waitTime = resetTime - Date.now();
			console.warn(`[GitHub API] Rate limited. Resets in ${Math.ceil(waitTime / 1000)}s`);
			
			if (waitTime > 0 && waitTime < 60000) {
				console.log('[GitHub API] Waiting for rate limit reset...');
				await new Promise(resolve => setTimeout(resolve, waitTime + 1000));
				return fetchWithRateLimit(url);
			}
		}
	}
	
	return response;
}

export async function getRepo(owner: string, repoName: string): Promise<GitHubRepo | null> {
	const cacheKey = `github:repo:${owner}:${repoName}`;
	const cached = getCache<GitHubRepo>(cacheKey);
	
	if (cached) {
		return cached;
	}
	
	const url = `${GITHUB_API_BASE}/repos/${owner}/${repoName}`;
	const response = await fetchWithRateLimit(url);
	
	if (!response.ok) {
		if (response.status === 404) {
			return null;
		}
		throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
	}
	
	const repo = await response.json() as GitHubRepo;
	setCache(cacheKey, repo, 1800);
	
	return repo;
}

export async function getTrendingRepos(language?: string, since: 'daily' | 'weekly' | 'monthly' = 'weekly', limit = 25): Promise<GitHubRepo[]> {
	const cacheKey = `github:trending:${language || 'all'}:${since}`;
	const cached = getCache<GitHubRepo[]>(cacheKey);
	
	if (cached) {
		return cached;
	}
	
	const date = new Date();
	let dateStr: string;
	
	switch (since) {
		case 'daily':
			date.setDate(date.getDate() - 1);
			break;
		case 'weekly':
			date.setDate(date.getDate() - 7);
			break;
		case 'monthly':
			date.setMonth(date.getMonth() - 1);
			break;
	}
	
	dateStr = date.toISOString().split('T')[0];
	
	let query = `created:>${dateStr}`;
	if (language) {
		query += ` language:${language}`;
	}
	
	const url = `${GITHUB_API_BASE}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${limit}`;
	const response = await fetchWithRateLimit(url);
	
	if (!response.ok) {
		throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
	}
	
	const data = await response.json() as { items: GitHubRepo[] };
	const repos = data.items || [];
	
	setCache(cacheKey, repos, 1800);
	
	return repos;
}

export async function getRepoStarsHistory(owner: string, repo: string): Promise<{ date: string; stars: number }[]> {
	const cacheKey = `github:stars:${owner}:${repo}`;
	const cached = getCache<{ date: string; stars: number }[]>(cacheKey);
	
	if (cached) {
		return cached;
	}
	
	const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/stargazers?per_page=100`;
	const response = await fetchWithRateLimit(url);
	
	if (!response.ok) {
		return [];
	}
	
	const stargazers = await response.json() as Array<{ starred_at: string }>;
	
	const history: { date: string; stars: number }[] = [];
	const dateCounts: Record<string, number> = {};
	
	for (const sg of stargazers) {
		if (sg.starred_at) {
			const date = sg.starred_at.split('T')[0];
			dateCounts[date] = (dateCounts[date] || 0) + 1;
		}
	}
	
	let cumulative = 0;
	const sortedDates = Object.keys(dateCounts).sort();
	
	for (const date of sortedDates) {
		cumulative += dateCounts[date];
		history.push({ date, stars: cumulative });
	}
	
	setCache(cacheKey, history, 3600);
	
	return history;
}

function toSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function normalizeGitHubRepo(repo: GitHubRepo): Tool {
	const [owner, repoName] = repo.full_name.split('/');
	const slug = toSlug(repo.full_name);
	const id = `github:${repo.id}`;
	
	const description = repo.description || `${repo.name} - A ${repo.language || 'software'} project`;
	
	return {
		id,
		slug,
		name: repo.name,
		url: repo.html_url,
		description,
		category: repo.topics[0] || repo.language || 'general',
		useCases: repo.topics.slice(0, 3),
		bestFor: detectBestFor(repo),
		pricingModel: detectPricingModel(repo),
		affiliateAvailable: false,
		trustScore: calculateTrustScore(repo),
		score: 0,
		logoUrl: repo.owner.avatar_url,
		avatarUrl: repo.owner.avatar_url,
		stars: repo.stargazers_count,
		forks: repo.forks_count,
		language: repo.language || undefined,
		topics: repo.topics,
		updatedAt: repo.updated_at,
		legacy: {
			language: repo.language || undefined,
			stars: repo.stargazers_count,
			starsGrowth: 0,
			forks: repo.forks_count,
			topics: repo.topics,
			contributors: 0
		}
	};
}

function detectBestFor(repo: GitHubRepo): string[] {
	const bestFor: string[] = [];
	const text = `${repo.description || ''} ${repo.topics.join(' ')}`.toLowerCase();
	
	if (text.includes('developer') || text.includes('dev') || repo.language) {
		bestFor.push('developers');
	}
	if (text.includes('startup') || text.includes('founder')) {
		bestFor.push('founders');
	}
	if (text.includes('design') || text.includes('ui') || text.includes('ux')) {
		bestFor.push('designers');
	}
	if (text.includes('data') || text.includes('analytics') || text.includes('ml')) {
		bestFor.push('data-scientists');
	}
	if (text.includes('marketing') || text.includes('seo') || text.includes('growth')) {
		bestFor.push('marketers');
	}
	
	if (bestFor.length === 0) {
		bestFor.push('developers');
	}
	
	return bestFor.slice(0, 2);
}

function detectPricingModel(repo: GitHubRepo): 'free' | 'freemium' | 'trial' | 'paid' | 'unknown' {
	const text = (repo.description || '').toLowerCase();
	
	if (text.includes('open source') || text.includes('free') || text.includes('mit') || text.includes('apache')) {
		return 'free';
	}
	if (text.includes('saas') || text.includes('cloud') || text.includes('hosted')) {
		return 'freemium';
	}
	
	return 'unknown';
}

function calculateTrustScore(repo: GitHubRepo): number {
	let score = 40;
	
	if (repo.description && repo.description.length > 50) score += 10;
	if (repo.stargazers_count > 1000) score += 15;
	if (repo.stargazers_count > 10000) score += 10;
	if (repo.forks_count > 100) score += 10;
	if (repo.topics.length > 0) score += 10;
	if (repo.language) score += 5;
	
	return Math.min(score, 100);
}

export async function ingestRepo(owner: string, repo: string): Promise<Tool | null> {
	console.log(`[Ingest] Fetching ${owner}/${repo}...`);
	
	const githubRepo = await getRepo(owner, repo);
	if (!githubRepo) {
		console.warn(`[Ingest] Repo not found: ${owner}/${repo}`);
		return null;
	}
	
	const tool = normalizeGitHubRepo(githubRepo);
	
	upsertTool(tool);
	recordToolHistory(tool.id!, {
		stars: tool.stars,
		forks: tool.forks
	});
	
	console.log(`[Ingest] Saved ${tool.name} (${tool.stars} stars)`);
	
	return tool;
}

export async function ingestTrending(language?: string, since: 'daily' | 'weekly' | 'monthly' = 'weekly', limit = 25): Promise<Tool[]> {
	console.log(`[Ingest] Fetching trending repos (${language || 'all'}, ${since})...`);
	
	const repos = await getTrendingRepos(language, since, limit);
	const tools: Tool[] = [];
	
	for (const repo of repos) {
		try {
			const tool = normalizeGitHubRepo(repo);
			upsertTool(tool);
			recordToolHistory(tool.id!, {
				stars: tool.stars,
				forks: tool.forks
			});
			tools.push(tool);
		} catch (e) {
			console.error(`[Ingest] Failed to process ${repo.full_name}:`, e);
		}
	}
	
	console.log(`[Ingest] Saved ${tools.length} tools`);
	
	return tools;
}

export async function refreshToolData(toolId: string): Promise<Tool | null> {
	const parts = toolId.split(':');
	if (parts.length !== 2 || parts[0] !== 'github') {
		return null;
	}
	
	const numericId = parseInt(parts[1]);
	if (isNaN(numericId)) {
		return null;
	}
	
	const url = `${GITHUB_API_BASE}/repositories/${numericId}`;
	const response = await fetchWithRateLimit(url);
	
	if (!response.ok) {
		return null;
	}
	
	const repo = await response.json() as GitHubRepo;
	const tool = normalizeGitHubRepo(repo);
	
	upsertTool(tool);
	recordToolHistory(tool.id!, {
		stars: tool.stars,
		forks: tool.forks
	});
	
	return tool;
}
