export type PricingModel = 'free' | 'freemium' | 'trial' | 'paid' | 'unknown';

export interface Tool {
	rank: number;
	name: string;
	slug?: string;
	url: string;
	affiliateUrl?: string;
	description: string;
	category?: string;
	useCases?: string[];
	bestFor?: string[];
	pricingModel?: PricingModel;
	affiliateAvailable?: boolean;
	affiliateCommission?: string;
	trustScore?: number;
	score?: number;
	logoUrl?: string;
	avatarUrl?: string;
	updatedAt?: string;
	sourceIds?: string[];
	language?: string;
	stars?: number;
	starsGrowth?: number;
	forks?: number;
	topics?: string[];
	contributors?: number;
	legacy?: {
		language?: string;
		stars?: number;
		starsGrowth?: number;
		forks?: number;
		topics?: string[];
		contributors?: number;
	};
}

export interface ToolSource {
	id: string;
	type:
		| 'directory'
		| 'landing_page'
		| 'affiliate_page'
		| 'pricing_page'
		| 'review_page'
		| 'blog'
		| 'manual';
	url: string;
	fetchedAt: string;
	confidence: number;
}

export interface ToolSignal {
	demandScore: number;
	affiliateReadinessScore: number;
	conversionFitScore: number;
	trustScore: number;
	useCaseRelevanceScore: number;
	contentOpportunityScore: number;
	differentiationScore: number;
}

export interface ToolScore {
	totalScore: number;
	weights: ScoreWeights;
	breakdown: ToolSignal;
}

export interface TrendingData {
	lastUpdated: string;
	source: string;
	products: Tool[];
}

export interface ArchiveMeta {
	lastUpdated: string;
	source: string;
	productCount: number;
	topScore: number;
}

export interface WeeklyRollup {
	week: string;
	startDate: string;
	endDate: string;
	averageScore: number;
	topProducts: Pick<Tool, 'name' | 'score' | 'category'>[];
	productCount: number;
}

export interface ScoreWeights {
	demand: number;
	affiliateReadiness: number;
	conversionFit: number;
	trust: number;
	useCaseRelevance: number;
	contentOpportunity: number;
	differentiation: number;
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
	demand: 0.25,
	affiliateReadiness: 0.2,
	conversionFit: 0.2,
	trust: 0.15,
	useCaseRelevance: 0.1,
	contentOpportunity: 0.05,
	differentiation: 0.05
};

export const DEFAULT_SEGMENTS = ['freelancers', 'solo-founders', 'marketers', 'creators'];

export type Product = Tool;
