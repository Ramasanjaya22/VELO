import type { TrendingData, Tool } from '$lib/types';
import fs from 'fs';
import path from 'path';

interface PageData {
	segment: string;
	title: string;
	description: string;
	recommendations: Tool[];
	filters: {
		primary: string[];
		category: Array<{ label: string; count: number }>;
		pricing: Array<{ label: string; count: number }>;
		signals: Array<{ label: string; count: number }>;
	};
	highlights: {
		total: number;
		affiliateReady: number;
		freeTrial: number;
		topCategory: string;
	};
}

const SEGMENT_RULES: Record<
	string,
	{
		title: string;
		description: string;
		boost: (tool: Tool) => number;
	}
> = {
	freelancers: {
		title: 'Best AI tools for freelancers',
		description:
			'Tools for freelancers to win clients, write faster, deliver clean work, and keep overhead low.',
		boost: (tool) =>
			scoreByKeywords(tool, [
				'freelance',
				'client',
				'proposal',
				'writing',
				'design',
				'productivity'
			])
	},
	researchers: {
		title: 'Best AI tools for researchers',
		description: 'Tools that help with synthesis, citations, validation, and structured thinking.',
		boost: (tool) =>
			scoreByKeywords(tool, ['research', 'search', 'analysis', 'citation', 'paper', 'knowledge'])
	},
	'solo-founders': {
		title: 'Best AI tools for solo founders',
		description:
			'Lean tools for building, writing, automating, and moving faster with less team overhead.',
		boost: (tool) =>
			scoreByKeywords(tool, ['founder', 'startup', 'build', 'automation', 'writing', 'ops'])
	},
	organization: {
		title: 'Best AI tools for organizations',
		description: 'Tools that fit shared workflows, collaboration, and operational clarity.',
		boost: (tool) =>
			scoreByKeywords(tool, ['team', 'collaboration', 'workflow', 'ops', 'project', 'automation'])
	},
	writing: {
		title: 'Best AI tools for writing',
		description: 'Tools that speed up drafting, editing, and idea generation.',
		boost: (tool) => scoreByKeywords(tool, ['writing', 'editor', 'content', 'copy', 'draft'])
	},
	automation: {
		title: 'Best AI tools for automation',
		description: 'Tools that reduce repetitive work and keep workflows moving.',
		boost: (tool) =>
			scoreByKeywords(tool, ['automation', 'workflow', 'agent', 'ops', 'integration'])
	},
	'team-collaboration': {
		title: 'Best AI tools for team collaboration',
		description: 'Tools that improve alignment, shared context, and team execution.',
		boost: (tool) =>
			scoreByKeywords(tool, ['team', 'collaboration', 'shared', 'workflow', 'project'])
	}
};

function scoreByKeywords(tool: Tool, keywords: string[]): number {
	const haystack = [
		tool.name,
		tool.description,
		tool.category,
		...(tool.useCases ?? []),
		...(tool.bestFor ?? []),
		...(tool.topics ?? [])
	]
		.filter(Boolean)
		.join(' ')
		.toLowerCase();

	return keywords.reduce((sum, keyword) => sum + (haystack.includes(keyword) ? 1 : 0), 0);
}

function normalizeSlug(slug: string): string {
	return slug
		.toLowerCase()
		.trim()
		.replace(/[_\s]+/g, '-');
}

function loadTrending(): TrendingData | null {
	const historyDir = path.resolve('data', 'history');
	if (!fs.existsSync(historyDir)) return null;

	const files = fs
		.readdirSync(historyDir)
		.filter((f) => f.endsWith('.json'))
		.sort()
		.reverse();
	if (files.length === 0) return null;

	const fileContent = fs.readFileSync(path.join(historyDir, files[0]), 'utf-8');
	return JSON.parse(fileContent) as TrendingData;
}

function fallbackSegment(slug: string): { title: string; description: string } {
	const humanized = slug.replace(/-/g, ' ').trim();
	return {
		title: `Best AI tools for ${humanized}`,
		description: 'Flexible recommendation hub for fast evaluation and better decisions.'
	};
}

function countBy<T>(
	items: T[],
	getter: (item: T) => string
): Array<{ label: string; count: number }> {
	const buckets = new Map<string, number>();
	for (const item of items) {
		const key = getter(item);
		buckets.set(key, (buckets.get(key) ?? 0) + 1);
	}
	return [...buckets.entries()]
		.map(([label, count]) => ({ label, count }))
		.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export async function load({ params }: { params: { slug: string } }): Promise<PageData> {
	const trending = loadTrending();
	const segmentSlug = normalizeSlug(params.slug);
	const segment = SEGMENT_RULES[segmentSlug] ?? null;

	if (!trending) {
		const fallback = segment ?? fallbackSegment(segmentSlug);
		return {
			segment: segmentSlug,
			title: fallback.title,
			description: fallback.description,
			recommendations: [],
			filters: {
				primary: [fallback.title.toLowerCase()],
				category: [],
				pricing: [],
				signals: []
			},
			highlights: {
				total: 0,
				affiliateReady: 0,
				freeTrial: 0,
				topCategory: 'general'
			}
		};
	}

	const ranked = trending.products
		.map((tool) => ({
			tool,
			score:
				(tool.score ?? 0) +
				(tool.trustScore ?? 0) * 0.18 +
				(tool.affiliateAvailable ? 8 : 0) +
				(tool.pricingModel === 'free' || tool.pricingModel === 'freemium' ? 2 : 0) +
				(segment?.boost(tool) ?? 0) * 8
		}))
		.sort((a, b) => b.score - a.score);

	const recommendations = ranked.slice(0, 10).map(({ tool }, index) => ({
		...tool,
		rank: index + 1
	}));

	const primary = [
		segmentSlug.replace(/-/g, ' '),
		segment ? segment.title.replace(/^Best AI tools for /i, '').toLowerCase() : ''
	]
		.filter(Boolean)
		.map((value) => value.trim());

	const topCategory = recommendations[0]?.category ?? 'general';
	const highlights = {
		total: recommendations.length,
		affiliateReady: recommendations.filter((tool) => tool.affiliateAvailable).length,
		freeTrial: recommendations.filter(
			(tool) =>
				tool.pricingModel === 'free' ||
				tool.pricingModel === 'freemium' ||
				tool.pricingModel === 'trial'
		).length,
		topCategory
	};

	const filters = {
		primary,
		category: countBy(recommendations, (tool) => tool.category ?? 'general').slice(0, 5),
		pricing: countBy(recommendations, (tool) => tool.pricingModel ?? 'unknown').slice(0, 4),
		signals: [
			{ label: 'affiliate-ready', count: highlights.affiliateReady },
			{ label: 'free / trial', count: highlights.freeTrial }
		]
	};

	const fallback = segment ?? fallbackSegment(segmentSlug);

	return {
		segment: segmentSlug,
		title: fallback.title,
		description: fallback.description,
		recommendations,
		filters,
		highlights
	};
}
