# VELO - Architecture Deep Dive

## Scoring System (src/lib/scoring.ts)

### Score Calculation

```typescript
scoreTool(tool, weights) → ToolScore
- 7 signal components (each 0-100)
- Weighted sum → totalScore
```

### Signal Weights (DEFAULT_WEIGHTS)

```typescript
demand: 0.25,
affiliateReadiness: 0.2,
conversionFit: 0.2,
trust: 0.15,
useCaseRelevance: 0.1,
contentOpportunity: 0.05,
differentiation: 0.05
```

### Individual Signal Calculations

1. **demandScore**: legacy starsGrowth + description length signal
2. **affiliateReadinessScore**: affiliate available (+45), url (+30), freemium/trial (+15), https (+10)
3. **conversionFitScore**: keyword matching (best, free, tool, software, ai, automation)
4. **trustScore**: base trustScore + pricing model known (+10) + description >50 chars (+10)
5. **useCaseRelevanceScore**: 25 base + useCases count _ 12 + bestFor count _ 8
6. **contentOpportunityScore**: category (+10), bestFor clarity (+20), description >80 chars (+15)
7. **differentiationScore**: unique signals count \* 8 + 20 base

### Ranking

```typescript
rankProducts(products) → Tool[]  // sorted by score desc, adds rank field
```

## Data Model (src/lib/types.ts)

### Tool Interface

```typescript
interface Tool {
	rank: number;
	name: string;
	slug?: string;
	url: string;
	affiliateUrl?: string;
	description: string;
	category?: string;
	useCases?: string[];
	bestFor?: string[];
	pricingModel?: PricingModel; // 'free' | 'freemium' | 'trial' | 'paid' | 'unknown'
	affiliateAvailable?: boolean;
	affiliateCommission?: string;
	trustScore?: number;
	score?: number; // computed
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
		/* historical data */
	};
}
```

### Supporting Types

- `ToolSource` - origin tracking (directory, landing_page, affiliate_page, etc.)
- `TrendingData` - container with lastUpdated, source, products[]
- `ArchiveMeta` - archive metadata
- `WeeklyRollup` - weekly summary with averageScore, topProducts

## Routes

- `/` - Loads TrendingData, displays ranked ProductCard list
- `/tool/[id]` - Tool detail with full metadata and scoring breakdown
- `/category/[slug]` - Filter by category
- `/best-for/[slug]` - Filter by bestFor tag
- `/compare/[slug]` - Side-by-side comparison
- `/weekly/[weekKey]` - Historical snapshot view
- `/repo/[id]` - GitHub repo integration

## Data Flow

1. `scripts/scrape.ts` fetches via Firecrawl
2. Data saved to `data/weekly/{weekKey}.json`
3. `+page.server.ts` loads data, applies scoring
4. `+page.svelte` renders with ProductCard components
5. Static adapter builds to `build/` directory
