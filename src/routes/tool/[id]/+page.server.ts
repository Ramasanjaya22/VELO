import type { TrendingData, Tool } from '$lib/types';
import { scoreTool, DEFAULT_WEIGHTS } from '$lib/scoring';
import type { ToolScore } from '$lib/types';
import fs from 'fs';
import path from 'path';

interface PageData {
	tool: Tool;
	relatedTools: Tool[];
	compareTools: Tool[];
	categoryStats: {
		averageScore: number;
		topScore: number;
		toolCount: number;
	};
	scoreBreakdown: ToolScore;
}

export async function load({ params }: { params: { id: string } }): Promise<PageData> {
	const historyDir = path.resolve('data', 'history');
	const files = fs
		.readdirSync(historyDir)
		.filter((f) => f.endsWith('.json'))
		.sort()
		.reverse();
	const fallbackName = decodeURIComponent(params.id);

	if (files.length === 0) {
		return {
			tool: {
				rank: 0,
				name: fallbackName,
				url: `https://example.com/${fallbackName}`,
				description: 'Tool information not available.',
				pricingModel: 'unknown',
				affiliateAvailable: false,
				trustScore: 0,
				score: 0,
				category: 'general',
				useCases: [],
				bestFor: [],
				sourceIds: []
			},
			relatedTools: [],
			compareTools: [],
			categoryStats: { averageScore: 0, topScore: 0, toolCount: 0 },
			scoreBreakdown: {
				totalScore: 0,
				weights: DEFAULT_WEIGHTS,
				breakdown: {
					demandScore: 0,
					affiliateReadinessScore: 0,
					conversionFitScore: 0,
					trustScore: 0,
					useCaseRelevanceScore: 0,
					contentOpportunityScore: 0,
					differentiationScore: 0
				}
			}
		};
	}

	const fileContent = fs.readFileSync(path.join(historyDir, files[0]), 'utf-8');
	const trending: TrendingData = JSON.parse(fileContent);
	const tool = trending.products.find(
		(p) => (p.slug ?? p.name) === params.id || p.name === fallbackName
	);
	const selected = tool ?? trending.products[0];

	if (!selected) {
		return {
			tool: {
				rank: 0,
				name: fallbackName,
				url: `https://example.com/${fallbackName}`,
				description: 'Tool information not available.',
				pricingModel: 'unknown',
				affiliateAvailable: false,
				trustScore: 0,
				score: 0,
				category: 'general',
				useCases: [],
				bestFor: [],
				sourceIds: []
			},
			relatedTools: [],
			compareTools: [],
			categoryStats: { averageScore: 0, topScore: 0, toolCount: 0 },
			scoreBreakdown: {
				totalScore: 0,
				weights: DEFAULT_WEIGHTS,
				breakdown: {
					demandScore: 0,
					affiliateReadinessScore: 0,
					conversionFitScore: 0,
					trustScore: 0,
					useCaseRelevanceScore: 0,
					contentOpportunityScore: 0,
					differentiationScore: 0
				}
			}
		};
	}

	// Calculate category stats
	const category = selected.category ?? 'general';
	const categoryTools = trending.products.filter((p) => (p.category ?? 'general') === category);
	const categoryScores = categoryTools.map((t) => t.score ?? 0);
	const categoryAvg =
		categoryScores.length > 0
			? categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length
			: 0;
	const categoryTop = categoryScores.length > 0 ? Math.max(...categoryScores) : 0;

	const relatedTools = trending.products.filter((p) => p.name !== selected.name).slice(0, 4);
	const compareTools = trending.products
		.filter(
			(p) =>
				p.name !== selected.name && (p.category ?? 'general') === (selected.category ?? 'general')
		)
		.slice(0, 3);

	// Full score breakdown
	const scoreBreakdown = scoreTool(selected);

	return {
		tool: selected,
		relatedTools,
		compareTools,
		categoryStats: {
			averageScore: Math.round(categoryAvg * 10) / 10,
			topScore: categoryTop,
			toolCount: categoryTools.length
		},
		scoreBreakdown
	};
}
