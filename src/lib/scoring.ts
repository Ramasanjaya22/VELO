import { DEFAULT_WEIGHTS } from './types';
import type { ScoreWeights, Tool, ToolSignal, ToolScore } from './types';

function normalize(value: number, maxValue: number): number {
	if (maxValue <= 0) return 0;
	return Math.min((value / maxValue) * 100, 100);
}

function calculateDemandScore(tool: Tool, maxDemand = 100): number {
	const legacyGrowth = tool.legacy?.starsGrowth ?? 0;
	const textSignal = tool.description.length >= 120 ? 15 : 5;
	return normalize(legacyGrowth + textSignal, maxDemand);
}

function calculateAffiliateReadinessScore(tool: Tool): number {
	let score = 0;
	if (tool.affiliateAvailable) score += 45;
	if (tool.affiliateUrl) score += 30;
	if (tool.pricingModel === 'freemium' || tool.pricingModel === 'trial') score += 15;
	if (tool.url.startsWith('https://')) score += 10;
	return Math.min(score, 100);
}

function calculateConversionFitScore(tool: Tool): number {
	const intentKeywords = ['best', 'free', 'tool', 'software', 'ai', 'automation'];
	const haystack = `${tool.name} ${tool.description} ${tool.category ?? ''} ${(tool.bestFor ?? []).join(' ')}`.toLowerCase();
	const matchCount = intentKeywords.reduce((acc, keyword) => acc + (haystack.includes(keyword) ? 1 : 0), 0);
	return Math.min(35 + matchCount * 12, 100);
}

function calculateTrustScore(tool: Tool): number {
	const base = tool.trustScore || 0;
	const hasPricing = tool.pricingModel !== 'unknown' ? 10 : 0;
	const hasDescription = tool.description.trim().length > 50 ? 10 : 0;
	return Math.min(base + hasPricing + hasDescription, 100);
}

function calculateUseCaseRelevanceScore(tool: Tool): number {
	return Math.min(25 + (tool.useCases ?? []).length * 12 + (tool.bestFor ?? []).length * 8, 100);
}

function calculateContentOpportunityScore(tool: Tool): number {
	const hasAlternatives = tool.category?.length ? 10 : 0;
	const hasClearPositioning = (tool.bestFor ?? []).length > 0 ? 20 : 0;
	const hasDescription = tool.description.length > 80 ? 15 : 5;
	return Math.min(hasAlternatives + hasClearPositioning + hasDescription, 100);
}

function calculateDifferentiationScore(tool: Tool): number {
	const uniqueSignals = new Set([
		tool.category,
		tool.pricingModel,
		...(tool.useCases ?? []),
		...(tool.bestFor ?? [])
	]).size;
	return Math.min(20 + uniqueSignals * 8, 100);
}

export function scoreTool(tool: Tool, weights: ScoreWeights = DEFAULT_WEIGHTS): ToolScore {
	const breakdown: ToolSignal = {
		demandScore: calculateDemandScore(tool),
		affiliateReadinessScore: calculateAffiliateReadinessScore(tool),
		conversionFitScore: calculateConversionFitScore(tool),
		trustScore: calculateTrustScore(tool),
		useCaseRelevanceScore: calculateUseCaseRelevanceScore(tool),
		contentOpportunityScore: calculateContentOpportunityScore(tool),
		differentiationScore: calculateDifferentiationScore(tool)
	};

	const totalScore =
		breakdown.demandScore * weights.demand +
		breakdown.affiliateReadinessScore * weights.affiliateReadiness +
		breakdown.conversionFitScore * weights.conversionFit +
		breakdown.trustScore * weights.trust +
		breakdown.useCaseRelevanceScore * weights.useCaseRelevance +
		breakdown.contentOpportunityScore * weights.contentOpportunity +
		breakdown.differentiationScore * weights.differentiation;

	return {
		totalScore: Math.round(totalScore * 10) / 10,
		weights,
		breakdown
	};
}

export function calculateScore(
	tool: Tool,
	weights: ScoreWeights = DEFAULT_WEIGHTS
): number {
	return scoreTool(tool, weights).totalScore;
}

export function rankProducts(products: Tool[]): Tool[] {
	const scored = products.map((tool) => {
		const score = calculateScore(tool, DEFAULT_WEIGHTS);
		return { ...tool, score };
	});

	scored.sort((a, b) => b.score - a.score);

	return scored.map((tool, index) => ({
		...tool,
		rank: index + 1
	}));
}
