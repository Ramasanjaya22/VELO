# Tool Detail Page Polish — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign `/tool/[id]` page with radar chart score breakdown, benchmark comparison, and enhanced visual hierarchy.

**Architecture:**

- Extend server load function to compute category stats and full score breakdowns
- Create reusable SVG chart components (RadarChart, BenchmarkBar)
- Refactor page layout with new hero, score section, and sidebar enhancements
- Maintain brutalist design system (shadows, accent-dim, Space Mono labels)

**Tech Stack:** SvelteKit, SVG charts (no external lib), existing Tailwind setup

---

## Task 1: Extend Server Load Function

**Files:**

- Modify: `src/routes/tool/[id]/+page.server.ts:1-75`

**Step 1: Add category stats computation**

```typescript
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
				url: '#',
				description: 'Tool not found',
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
				url: '#',
				description: 'Tool not found',
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

	// Related and compare tools
	const relatedTools = trending.products.filter((p) => p.name !== selected.name).slice(0, 4);
	const compareTools = trending.products
		.filter((p) => p.name !== selected.name && (p.category ?? 'general') === category)
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
```

**Step 2: Run typecheck to verify**

Run: `bun run typecheck`  
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/routes/tool/[id]/+page.server.ts
git commit -m "feat(tool): add category stats and score breakdown to load()"
```

---

## Task 2: Create RadarChart Component

**Files:**

- Create: `src/lib/components/RadarChart.svelte`

**Step 1: Write the component**

```svelte
<script lang="ts">
	interface Props {
		scores: {
			demandScore: number;
			affiliateReadinessScore: number;
			conversionFitScore: number;
			trustScore: number;
			useCaseRelevanceScore: number;
			contentOpportunityScore: number;
			differentiationScore: number;
		};
		benchmark?: number;
		size?: number;
	}

	let { scores, benchmark = 0, size = 280 }: Props = $props();

	const labels = ['Demand', 'Affiliate', 'Conversion', 'Trust', 'Use Case', 'Content', 'Diff'];

	const values = [
		scores.demandScore,
		scores.affiliateReadinessScore,
		scores.conversionFitScore,
		scores.trustScore,
		scores.useCaseRelevanceScore,
		scores.contentOpportunityScore,
		scores.differentiationScore
	];

	const center = size / 2;
	const maxRadius = size / 2 - 40;
	const angleStep = (2 * Math.PI) / 7;
	const startAngle = -Math.PI / 2;

	function polarToCartesian(value: number, index: number) {
		const angle = startAngle + index * angleStep;
		const radius = (value / 100) * maxRadius;
		return {
			x: center + radius * Math.cos(angle),
			y: center + radius * Math.sin(angle)
		};
	}

	const points = $derived(values.map((v, i) => polarToCartesian(v, i)));
	const polygonPoints = $derived(points.map((p) => `${p.x},${p.y}`).join(' '));

	// Grid circles at 25%, 50%, 75%, 100%
	const gridLevels = [25, 50, 75, 100];
</script>

<div class="radar-chart">
	<svg width={size} height={size} viewBox="0 0 {size} {size}">
		<!-- Grid circles -->
		{#each gridLevels as level}
			{@const r = (level / 100) * maxRadius}
			<circle cx={center} cy={center} {r} fill="none" stroke="var(--metal-100)" stroke-width="1" />
		{/each}

		<!-- Axis lines -->
		{#each values as _, i}
			{@const endpoint = polarToCartesian(100, i)}
			<line
				x1={center}
				y1={center}
				x2={endpoint.x}
				y2={endpoint.y}
				stroke="var(--metal-100)"
				stroke-width="1"
			/>
		{/each}

		<!-- Benchmark circle (if provided) -->
		{#if benchmark > 0}
			{@const r = (benchmark / 100) * maxRadius}
			<circle
				cx={center}
				cy={center}
				{r}
				fill="none"
				stroke="var(--metal-300)"
				stroke-width="1"
				stroke-dasharray="4 4"
			/>
		{/if}

		<!-- Score polygon -->
		<polygon
			points={polygonPoints}
			fill="var(--accent-dim)"
			fill-opacity="0.25"
			stroke="var(--accent-dim)"
			stroke-width="2"
		/>

		<!-- Data points -->
		{#each points as point, i}
			<circle
				cx={point.x}
				cy={point.y}
				r="4"
				fill="var(--accent-dim)"
				stroke="var(--surface)"
				stroke-width="2"
			/>
		{/each}

		<!-- Labels -->
		{#each labels as label, i}
			{@const pos = polarToCartesian(100, i)}
			{@const offsetX = pos.x > center ? 8 : pos.x < center ? -8 : 0}
			{@const offsetY = pos.y > center ? 8 : pos.y < center ? -8 : 0}
			<text
				x={pos.x + offsetX}
				y={pos.y + offsetY}
				text-anchor={pos.x > center ? 'start' : pos.x < center ? 'end' : 'middle'}
				dominant-baseline="middle"
				font-size="10"
				font-family="var(--font-mono)"
				fill="var(--metal-500)"
				text-transform="uppercase"
				letter-spacing="0.1em"
			>
				{label}
			</text>
		{/each}
	</svg>
</div>

<style>
	.radar-chart {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
```

**Step 2: Run typecheck to verify**

Run: `bun run typecheck`  
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/lib/components/RadarChart.svelte
git commit -m "feat(components): add RadarChart component"
```

---

## Task 3: Create BenchmarkBar Component

**Files:**

- Create: `src/lib/components/BenchmarkBar.svelte`

**Step 1: Write the component**

```svelte
<script lang="ts">
	interface BenchmarkItem {
		label: string;
		score: number;
		isThisTool?: boolean;
	}

	interface Props {
		items: BenchmarkItem[];
		maxScore?: number;
	}

	let { items, maxScore = 100 }: Props = $props();

	function getBarWidth(score: number): string {
		return `${(score / maxScore) * 100}%`;
	}

	function getDelta(item: BenchmarkItem, items: BenchmarkItem): string {
		if (!item.isThisTool && items.length > 0) {
			const thisTool = items.find((i) => i.isThisTool);
			if (thisTool) {
				const delta = item.score - thisTool.score;
				return delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);
			}
		}
		return '';
	}
</script>

<div class="benchmark-bar">
	<div class="benchmark-track">
		{#each items as item}
			<div class="benchmark-item" class:is-this-tool={item.isThisTool}>
				<div class="benchmark-label-row">
					<span class="benchmark-label">{item.label}</span>
					<span class="benchmark-score">{item.score.toFixed(1)}</span>
					{#if !item.isThisTool && getDelta(item, items)}
						<span
							class="benchmark-delta"
							class:positive={item.score > (items.find((i) => i.isThisTool)?.score ?? 0)}
						>
							({getDelta(item, items)})
						</span>
					{/if}
				</div>
				<div class="benchmark-bar-track">
					<div
						class="benchmark-bar-fill"
						class:is-this-tool={item.isThisTool}
						style="width: {getBarWidth(item.score)}"
					></div>
					{#if item.isThisTool}
						<div class="benchmark-marker" style="left: {getBarWidth(item.score)}"></div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.benchmark-bar {
		width: 100%;
	}

	.benchmark-item {
		margin-bottom: 1rem;
	}

	.benchmark-item:last-child {
		margin-bottom: 0;
	}

	.benchmark-label-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.35rem;
	}

	.benchmark-label {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		font-family: var(--font-mono);
		color: var(--metal-500);
	}

	.benchmark-score {
		font-size: 0.85rem;
		font-family: var(--font-mono);
		font-weight: 700;
		color: var(--metal-900);
	}

	.benchmark-delta {
		font-size: 0.65rem;
		font-family: var(--font-mono);
		color: var(--metal-500);
	}

	.benchmark-delta.positive {
		color: var(--accent-dim);
	}

	.benchmark-bar-track {
		position: relative;
		height: 0.5rem;
		background: var(--metal-100);
		border-radius: 0.125rem;
		overflow: visible;
	}

	.benchmark-bar-fill {
		height: 100%;
		background: var(--metal-300);
		border-radius: 0.125rem;
		transition: width 600ms ease-out;
	}

	.benchmark-bar-fill.is-this-tool {
		background: linear-gradient(
			90deg,
			var(--accent-dim),
			color-mix(in srgb, var(--accent-dim) 55%, var(--metal-900))
		);
	}

	.benchmark-marker {
		position: absolute;
		top: -3px;
		width: 2px;
		height: calc(100% + 6px);
		background: var(--metal-900);
		transform: translateX(-50%);
	}
</style>
```

**Step 2: Run typecheck to verify**

Run: `bun run typecheck`  
Expected: 0 errors

**Step 3: Commit**

```bash
git add src/lib/components/BenchmarkBar.svelte
git commit -m "feat(components): add BenchmarkBar component"
```

---

## Task 4: Refactor Tool Detail Page Layout

**Files:**

- Modify: `src/routes/tool/[id]/+page.svelte`

**Step 1: Update script section for new data**

Replace the `$derived.by` sections for `signalBars` and add new derived data:

```svelte
<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Icon } from 'svelte-icon';
	import type { Tool } from '$lib/types';
	import searchIcon from '$lib/icons/search.svg?raw';
	import crownIcon from '$lib/icons/crown.svg?raw';
	import boltIcon from '$lib/icons/bolt.svg?raw';
	import layersIcon from '$lib/icons/layers.svg?raw';
	import RadarChart from '$lib/components/RadarChart.svelte';
	import BenchmarkBar from '$lib/components/BenchmarkBar.svelte';

	let {
		data
	}: {
		data: {
			tool: Tool;
			relatedTools: Tool[];
			compareTools: Tool[];
			categoryStats: { averageScore: number; topScore: number; toolCount: number };
			scoreBreakdown: {
				totalScore: number;
				weights: Record<string, number>;
				breakdown: Record<string, number>;
			};
		};
	} = $props();

	const scoreDelta = $derived.by(() => {
		const delta = (data.tool.score ?? 0) - data.categoryStats.averageScore;
		return delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);
	});

	const isAboveAverage = $derived((data.tool.score ?? 0) >= data.categoryStats.averageScore);

	const benchmarkItems = $derived([
		{ label: 'This Tool', score: data.tool.score ?? 0, isThisTool: true },
		{
			label: `Category Avg (${data.categoryStats.toolCount} tools)`,
			score: data.categoryStats.averageScore,
			isThisTool: false
		},
		{ label: 'Top in Category', score: data.categoryStats.topScore, isThisTool: false }
	]);

	const signalBars = $derived.by(() => {
		const stars = Math.min(100, ((data.tool.stars ?? 0) / 50000) * 100);
		const growth = Math.min(100, ((data.tool.starsGrowth ?? 0) / 5000) * 100);
		const forks = Math.min(100, ((data.tool.forks ?? 0) / 20000) * 100);
		const contributors = Math.min(100, ((data.tool.contributors ?? 0) / 100) * 100);
		const trust = Math.min(100, ((data.tool.trustScore ?? 0) / 100) * 100);

		return [
			{
				label: 'Stars',
				value: data.tool.stars?.toLocaleString() ?? '—',
				width: stars,
				icon: 'star'
			},
			{
				label: 'Weekly growth',
				value: data.tool.starsGrowth ? `+${data.tool.starsGrowth.toLocaleString()}` : '—',
				width: growth,
				icon: 'trend'
			},
			{
				label: 'Forks',
				value: data.tool.forks?.toLocaleString() ?? '—',
				width: forks,
				icon: 'fork'
			},
			{
				label: 'Contributors',
				value: data.tool.contributors?.toString() ?? '—',
				width: contributors,
				icon: 'users'
			},
			{
				label: 'Trust',
				value: data.tool.trustScore?.toFixed(1) ?? '—',
				width: trust,
				icon: 'shield'
			}
		];
	});

	// ... (rest of existing script: categoryIconUrl, schema, benefits, comparisonLine)
</script>
```

**Step 2: Replace hero section**

Replace the existing hero (lines ~139-228) with:

```svelte
<!-- HERO -->
<section
	class="relative overflow-hidden rounded-sm border border-metal-900 bg-surface px-6 py-6 lg:px-8 lg:py-8"
>
	<div
		class="absolute inset-y-0 right-0 w-[260px] bg-[linear-gradient(180deg,rgba(147,217,10,0.12),rgba(255,255,255,0))] pointer-events-none"
	></div>

	<div class="relative grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
		<div class="space-y-6">
			<div
				class="flex items-center gap-3 text-metal-500 text-xs uppercase tracking-[0.25em] font-mono"
			>
				<Icon data={layersIcon} size="14px" color="currentColor" />
				<span>Tool detail</span>
			</div>

			<header class="space-y-4">
				<div class="flex flex-wrap gap-2">
					<span class="badge-chip badge-chip-hero">
						{#if categoryIconUrl}
							<img src={categoryIconUrl} alt="" class="size-3.5" />
						{/if}
						<span>{data.tool.category ?? 'general'}</span>
					</span>
					{#if data.tool.pricingModel}
						<span class="badge-chip">{data.tool.pricingModel}</span>
					{/if}
					{#if data.tool.bestFor?.length}
						<span class="badge-chip">{data.tool.bestFor[0]}</span>
					{/if}
					{#if data.tool.affiliateAvailable}
						<span class="badge-chip badge-chip-accent">affiliate-ready</span>
					{/if}
				</div>

				<div class="flex items-start gap-6">
					{#if data.tool.logoUrl || data.tool.avatarUrl}
						<img
							src={data.tool.logoUrl ?? data.tool.avatarUrl}
							alt="{data.tool.name} logo"
							class="size-16 lg:size-20 rounded-sm border border-metal-200 object-contain bg-surface shrink-0"
						/>
					{/if}
					<div class="min-w-0">
						<h1
							class="max-w-4xl text-[clamp(2.3rem,4.5vw,4.6rem)] leading-[0.95] tracking-[-0.05em] text-metal-900 font-heading"
						>
							{data.tool.name}
						</h1>
						<p class="mt-2 max-w-3xl text-base lg:text-lg text-metal-500 leading-relaxed">
							{data.tool.description}
						</p>
					</div>
				</div>
			</header>
		</div>

		<div class="grid gap-4 self-start">
			<div
				class="border border-metal-900 bg-surface rounded-sm p-5 shadow-[4px_4px_0px_var(--accent-dim)]"
			>
				<div class="flex items-center justify-between">
					<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">Score</p>
					<Icon data={crownIcon} size="16px" color="var(--metal-500)" />
				</div>
				<div class="flex items-baseline gap-3 mt-3">
					<p class="text-4xl font-mono font-bold text-metal-900">
						{(data.tool.score ?? 0).toFixed(1)}
					</p>
					<span
						class="text-sm font-mono"
						class:text-accent-dim={isAboveAverage}
						class:text-metal-500={!isAboveAverage}
					>
						{scoreDelta} vs avg
					</span>
				</div>
				<p class="mt-2 text-xs text-metal-500">
					Calculated from GitHub stars, weekly growth, forks, and contributors.
				</p>
			</div>

			<a
				class="border border-metal-900 bg-accent text-metal-900 rounded-sm px-4 py-4 text-center font-medium shadow-[4px_4px_0px_var(--metal-900)] inline-flex items-center justify-center gap-2"
				href={data.tool.affiliateUrl ?? data.tool.url}
				target="_blank"
				rel="noreferrer"
			>
				Visit tool
				<Icon data={searchIcon} size="14px" color="currentColor" />
			</a>

			{#if data.tool.affiliateAvailable}
				<div class="border border-metal-100 bg-surface rounded-sm p-4 text-sm">
					<p class="text-metal-900 font-medium mb-1">Promotion</p>
					<p class="text-metal-500 text-xs">
						Affiliate-ready
						{#if data.tool.affiliateCommission}
							<span class="font-mono">· {data.tool.affiliateCommission} commission</span>
						{/if}
					</p>
				</div>
			{/if}
		</div>
	</div>
</section>
```

**Step 3: Add Score Breakdown section (after hero)**

```svelte
<!-- SCORE BREAKDOWN -->
<section class="mt-8 grid gap-6 xl:grid-cols-[320px_1fr] xl:items-start">
	<div class="border border-metal-100 bg-surface rounded-sm p-5">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-xs uppercase tracking-[0.25em] text-metal-500 font-mono">Score Breakdown</h2>
		</div>
		<RadarChart
			scores={data.scoreBreakdown.breakdown}
			benchmark={data.categoryStats.averageScore}
			size={260}
		/>
		<p class="mt-3 text-center text-[10px] text-metal-500 font-mono uppercase tracking-wider">
			Category avg: {data.categoryStats.averageScore.toFixed(1)}
		</p>
	</div>

	<div class="border border-metal-100 bg-surface rounded-sm p-5">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-xs uppercase tracking-[0.25em] text-metal-500 font-mono">
				Score Composition
			</h2>
		</div>
		<div class="space-y-4">
			<div class="score-row">
				<div class="flex justify-between items-center mb-1">
					<span class="text-[10px] uppercase tracking-[0.15em] font-mono text-metal-500"
						>Demand</span
					>
					<span class="text-xs font-mono font-bold text-metal-900"
						>{data.scoreBreakdown.breakdown.demandScore.toFixed(0)}</span
					>
				</div>
				<div class="h-2 bg-metal-100 rounded-sm overflow-hidden">
					<div
						class="h-full bg-accent-dim rounded-sm"
						style="width: {data.scoreBreakdown.breakdown.demandScore}%"
					></div>
				</div>
			</div>
			<div class="score-row">
				<div class="flex justify-between items-center mb-1">
					<span class="text-[10px] uppercase tracking-[0.15em] font-mono text-metal-500"
						>Affiliate</span
					>
					<span class="text-xs font-mono font-bold text-metal-900"
						>{data.scoreBreakdown.breakdown.affiliateReadinessScore.toFixed(0)}</span
					>
				</div>
				<div class="h-2 bg-metal-100 rounded-sm overflow-hidden">
					<div
						class="h-full bg-accent-dim rounded-sm"
						style="width: {data.scoreBreakdown.breakdown.affiliateReadinessScore}%"
					></div>
				</div>
			</div>
			<div class="score-row">
				<div class="flex justify-between items-center mb-1">
					<span class="text-[10px] uppercase tracking-[0.15em] font-mono text-metal-500"
						>Conversion</span
					>
					<span class="text-xs font-mono font-bold text-metal-900"
						>{data.scoreBreakdown.breakdown.conversionFitScore.toFixed(0)}</span
					>
				</div>
				<div class="h-2 bg-metal-100 rounded-sm overflow-hidden">
					<div
						class="h-full bg-accent-dim rounded-sm"
						style="width: {data.scoreBreakdown.breakdown.conversionFitScore}%"
					></div>
				</div>
			</div>
			<div class="score-row">
				<div class="flex justify-between items-center mb-1">
					<span class="text-[10px] uppercase tracking-[0.15em] font-mono text-metal-500">Trust</span
					>
					<span class="text-xs font-mono font-bold text-metal-900"
						>{data.scoreBreakdown.breakdown.trustScore.toFixed(0)}</span
					>
				</div>
				<div class="h-2 bg-metal-100 rounded-sm overflow-hidden">
					<div
						class="h-full bg-accent-dim rounded-sm"
						style="width: {data.scoreBreakdown.breakdown.trustScore}%"
					></div>
				</div>
			</div>
			<div class="score-row">
				<div class="flex justify-between items-center mb-1">
					<span class="text-[10px] uppercase tracking-[0.15em] font-mono text-metal-500"
						>Use Case</span
					>
					<span class="text-xs font-mono font-bold text-metal-900"
						>{data.scoreBreakdown.breakdown.useCaseRelevanceScore.toFixed(0)}</span
					>
				</div>
				<div class="h-2 bg-metal-100 rounded-sm overflow-hidden">
					<div
						class="h-full bg-accent-dim rounded-sm"
						style="width: {data.scoreBreakdown.breakdown.useCaseRelevanceScore}%"
					></div>
				</div>
			</div>
			<div class="score-row">
				<div class="flex justify-between items-center mb-1">
					<span class="text-[10px] uppercase tracking-[0.15em] font-mono text-metal-500"
						>Content</span
					>
					<span class="text-xs font-mono font-bold text-metal-900"
						>{data.scoreBreakdown.breakdown.contentOpportunityScore.toFixed(0)}</span
					>
				</div>
				<div class="h-2 bg-metal-100 rounded-sm overflow-hidden">
					<div
						class="h-full bg-accent-dim rounded-sm"
						style="width: {data.scoreBreakdown.breakdown.contentOpportunityScore}%"
					></div>
				</div>
			</div>
			<div class="score-row">
				<div class="flex justify-between items-center mb-1">
					<span class="text-[10px] uppercase tracking-[0.15em] font-mono text-metal-500"
						>Differentiation</span
					>
					<span class="text-xs font-mono font-bold text-metal-900"
						>{data.scoreBreakdown.breakdown.differentiationScore.toFixed(0)}</span
					>
				</div>
				<div class="h-2 bg-metal-100 rounded-sm overflow-hidden">
					<div
						class="h-full bg-accent-dim rounded-sm"
						style="width: {data.scoreBreakdown.breakdown.differentiationScore}%"
					></div>
				</div>
			</div>
		</div>
	</div>
</section>
```

**Step 4: Add Benchmark section (after score breakdown)**

```svelte
<!-- BENCHMARK -->
<section class="mt-8 border border-metal-100 bg-surface rounded-sm p-5">
	<div class="flex items-center justify-between mb-4">
		<h2 class="text-xs uppercase tracking-[0.25em] text-metal-500 font-mono">Benchmark</h2>
		<span class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">vs category</span>
	</div>
	<BenchmarkBar items={benchmarkItems} />
</section>
```

**Step 5: Keep Signal Metrics section (update styling)**

Replace the signal bars content with enhanced version:

```svelte
<!-- SIGNAL METRICS -->
<section class="mt-8 border border-metal-100 bg-surface rounded-sm p-5">
	<div class="flex items-center justify-between gap-3">
		<h2 class="text-xs uppercase tracking-[0.25em] text-metal-500 font-mono">Signal Metrics</h2>
		<span class="text-xs uppercase tracking-[0.2em] text-metal-500 font-mono">GitHub data</span>
	</div>
	<div class="mt-5 grid gap-4">
		{#each signalBars as item}
			<div class="signal-row">
				<div
					class="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.18em] font-mono text-metal-500"
				>
					<span>{item.label}</span>
					<span>{item.value}</span>
				</div>
				<div class="signal-track">
					<div class="signal-fill" style="width: {item.width}%"></div>
				</div>
			</div>
		{/each}
	</div>
</section>
```

**Step 6: Update sidebar (enhance with larger logo + quick stats)**

Replace the aside content with:

```svelte
<aside class="space-y-4">
	<!-- Tool Profile Card -->
	<div
		class="border border-metal-900 bg-surface rounded-sm p-5 shadow-[4px_4px_0px_var(--accent-dim)]"
	>
		{#if data.tool.logoUrl || data.tool.avatarUrl}
			<img
				src={data.tool.logoUrl ?? data.tool.avatarUrl}
				alt="{data.tool.name} logo"
				class="w-20 h-20 rounded-sm border border-metal-200 object-contain bg-surface mx-auto mb-4"
			/>
		{/if}
		<h3 class="text-center text-lg font-heading text-metal-900 truncate">{data.tool.name}</h3>

		<div class="mt-4 space-y-2">
			<div class="flex items-center justify-between text-sm">
				<span class="text-metal-500">Stars</span>
				<span class="font-mono font-bold text-metal-900"
					>{data.tool.stars?.toLocaleString() ?? '—'}</span
				>
			</div>
			<div class="flex items-center justify-between text-sm">
				<span class="text-metal-500">Forks</span>
				<span class="font-mono font-bold text-metal-900"
					>{data.tool.forks?.toLocaleString() ?? '—'}</span
				>
			</div>
			<div class="flex items-center justify-between text-sm">
				<span class="text-metal-500">Contributors</span>
				<span class="font-mono font-bold text-metal-900">{data.tool.contributors ?? '—'}</span>
			</div>
		</div>

		{#if data.tool.trustScore}
			<div class="mt-4 pt-4 border-t border-metal-100">
				<div class="flex items-center justify-between mb-2">
					<span class="text-[10px] uppercase tracking-[0.15em] font-mono text-metal-500">Trust</span
					>
					<span class="text-xs font-mono font-bold text-metal-900">{data.tool.trustScore}</span>
				</div>
				<div class="h-2 bg-metal-100 rounded-sm overflow-hidden">
					<div class="h-full bg-accent-dim rounded-sm" style="width: {data.tool.trustScore}%"></div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Related tools (keep existing) -->
	<!-- ... existing related tools code ... -->

	<!-- Disclosure (keep existing) -->
	<!-- ... existing disclosure code ... -->
</aside>
```

**Step 7: Run typecheck to verify**

Run: `bun run typecheck`  
Expected: 0 errors

**Step 8: Run dev server to visually verify**

Run: `bun run dev`  
Navigate to `/tool/unslothai-unsloth`

**Step 9: Commit**

```bash
git add src/routes/tool/[id]/+page.svelte
git commit -m "feat(tool): complete layout redesign with visualizations"
```

---

## Task 5: Add CSS for New Components

**Files:**

- Modify: `src/routes/tool/[id]/+page.svelte` (add to style block)

Add these styles:

```css
.score-row {
	margin-bottom: 0.75rem;
}

.score-row:last-child {
	margin-bottom: 0;
}
```

---

## Task 6: Final Verification

**Step 1: Run typecheck on entire project**

Run: `bun run typecheck`  
Expected: 0 errors

**Step 2: Run lint**

Run: `bun run lint`  
Expected: No errors (warnings ok)

**Step 3: Test in browser**

1. Start dev server: `bun run dev`
2. Open http://localhost:5173/tool/unslothai-unsloth
3. Verify:
   - Hero shows large logo, score with delta
   - Radar chart renders with 7 axes
   - Benchmark bars show this tool vs category avg vs top
   - Signal metrics render correctly
   - Sidebar shows large logo + quick stats
   - All brutalist shadows use accent-dim

**Step 4: Test with different tool**

Navigate to `/tool/jarrodwatts-claude-hud` and verify all data loads correctly.

---

## Summary of Files Changed

| File                                     | Action                                     |
| ---------------------------------------- | ------------------------------------------ |
| `src/routes/tool/[id]/+page.server.ts`   | Modify - add categoryStats, scoreBreakdown |
| `src/lib/components/RadarChart.svelte`   | Create - SVG radar chart                   |
| `src/lib/components/BenchmarkBar.svelte` | Create - horizontal benchmark bars         |
| `src/routes/tool/[id]/+page.svelte`      | Modify - complete layout redesign          |

---

## Plan Complete

Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
