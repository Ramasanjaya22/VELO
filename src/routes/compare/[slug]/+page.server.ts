import type { TrendingData, Tool } from '$lib/types';
import fs from 'fs';
import path from 'path';

interface PageData {
	left: Tool | null;
	right: Tool | null;
	slug: string;
	title: string;
	description: string;
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

function normalizeSlug(value: string): string {
	return value.toLowerCase().trim();
}

function scoreMatch(tool: Tool, token: string): number {
	const haystack = [
		tool.name,
		tool.slug,
		tool.description,
		tool.category,
		...(tool.useCases ?? []),
		...(tool.bestFor ?? []),
		...(tool.topics ?? [])
	]
		.filter(Boolean)
		.join(' ')
		.toLowerCase();

	return haystack.includes(token) ? 1 : 0;
}

function resolveTool(trending: TrendingData, token: string): Tool | null {
	const normalized = normalizeSlug(token);
	const direct = trending.products.find(
		(tool) => normalizeSlug(tool.slug ?? tool.name) === normalized
	);
	if (direct) return direct;

	const fuzzy = trending.products.find((tool) => scoreMatch(tool, normalized) > 0);
	return fuzzy ?? null;
}

export async function load({ params }: { params: { slug: string } }): Promise<PageData> {
	const trending = loadTrending();
	const fallback = params.slug.replace(/-/g, ' ');

	if (!trending) {
		return {
			left: null,
			right: null,
			slug: params.slug,
			title: `Compare: ${fallback}`,
			description: 'Comparison content for high-intent traffic.'
		};
	}

	const [leftToken, rightToken] = params.slug.split('-vs-');
	const left = resolveTool(trending, leftToken ?? params.slug);
	const right = resolveTool(trending, rightToken ?? '');

	return {
		left,
		right,
		slug: params.slug,
		title: left && right ? `Compare ${left.name} vs ${right.name}` : `Compare: ${fallback}`,
		description:
			left && right
				? `Side-by-side comparison for ${left.name} and ${right.name}.`
				: 'Comparison content for high-intent traffic.'
	};
}
