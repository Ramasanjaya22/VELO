<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Icon } from 'svelte-icon';
	import type { Tool } from '$lib/types';
	import type { ToolScore } from '$lib/types';
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
			scoreBreakdown: ToolScore;
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

	const benefits = $derived.by(() => {
		const list = [
			`Best for ${data.tool.bestFor?.[0] ?? 'general use'}`,
			data.tool.affiliateAvailable ? 'Affiliate-ready CTA' : 'No affiliate friction',
			`Category: ${data.tool.category ?? 'general'}`,
			`Pricing: ${data.tool.pricingModel ?? 'unknown'}`
		];
		return list;
	});

	const comparisonLine = $derived.by(() => {
		const target = data.compareTools[0];
		if (!target) return 'No comparison candidate yet.';
		return `${data.tool.name} vs ${target.name}`;
	});

	const signalBars = $derived.by(() => {
		const stars = Math.min(100, ((data.tool.stars ?? 0) / 50000) * 100);
		const growth = Math.min(100, ((data.tool.starsGrowth ?? 0) / 5000) * 100);
		const forks = Math.min(100, ((data.tool.forks ?? 0) / 20000) * 100);
		const contributors = Math.min(100, ((data.tool.contributors ?? 0) / 100) * 100);
		const trust = Math.min(100, ((data.tool.trustScore ?? 0) / 100) * 100);

		return [
			{ label: 'Stars', value: data.tool.stars?.toLocaleString() ?? '—', width: stars },
			{
				label: 'Weekly growth',
				value: data.tool.starsGrowth ? `+${data.tool.starsGrowth.toLocaleString()}` : '—',
				width: growth
			},
			{ label: 'Forks', value: data.tool.forks?.toLocaleString() ?? '—', width: forks },
			{
				label: 'Contributors',
				value: data.tool.contributors?.toString() ?? '—',
				width: contributors
			},
			{ label: 'Trust', value: data.tool.trustScore?.toFixed(1) ?? '—', width: trust }
		];
	});

	const categoryIconUrl = $derived.by(() => {
		const category = (data.tool.category ?? '').toLowerCase();
		if (category.includes('javascript') || category.includes('js')) {
			return 'https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/javascript.svg';
		}
		if (category.includes('typescript') || category.includes('ts')) {
			return 'https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/typescript.svg';
		}
		if (category.includes('python')) {
			return 'https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/python.svg';
		}
		if (category.includes('go')) {
			return 'https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/go.svg';
		}
		return '';
	});

	const schema = $derived.by(() => {
		const url = `https://velo-428.pages.dev/tool/${encodeURIComponent(data.tool.slug ?? data.tool.name)}`;
		const aggregateRating = data.tool.score
			? {
					'@type': 'AggregateRating',
					ratingValue: data.tool.score.toFixed(1),
					ratingCount: 1,
					bestRating: 100,
					worstRating: 0
				}
			: undefined;

		return {
			'@context': 'https://schema.org',
			'@graph': [
				{
					'@type': 'WebPage',
					'@id': `${url}#webpage`,
					url,
					name: data.tool.name,
					description: data.tool.description,
					inLanguage: 'en',
					isPartOf: { '@id': 'https://velo-428.pages.dev/#website' },
					dateModified: data.tool.updatedAt ?? undefined,
					datePublished: data.tool.updatedAt ?? undefined
				},
				{
					'@type': 'SoftwareApplication',
					'@id': `${url}#software`,
					name: data.tool.name,
					description: data.tool.description,
					url,
					applicationCategory: data.tool.category ?? 'general',
					operatingSystem: 'Web',
					offers: {
						'@type': 'Offer',
						price: 0,
						priceCurrency: 'USD',
						url: data.tool.affiliateUrl ?? data.tool.url
					},
					provider: { '@id': 'https://velo-428.pages.dev/#organization' },
					...(aggregateRating ? { aggregateRating } : {})
				}
			]
		};
	});
</script>

<svelte:head>
	<title>{data.tool.name} — VELO</title>
	<meta name="description" content={data.tool.description} />
	<meta property="og:title" content={`${data.tool.name} — VELO`} />
	<meta property="og:description" content={data.tool.description} />
	<meta property="og:type" content="article" />
	<meta
		property="og:url"
		content={`https://velo-428.pages.dev/tool/${encodeURIComponent(data.tool.slug ?? data.tool.name)}`}
	/>
	<meta property="og:image" content="https://velo-428.pages.dev/og-image.svg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={`${data.tool.name} — VELO`} />
	<meta name="twitter:description" content={data.tool.description} />
	<meta name="twitter:image" content="https://velo-428.pages.dev/og-image.svg" />
	{@html `<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>`}
</svelte:head>

<main class="w-full max-w-[1280px] mx-auto px-6 py-8 lg:py-12" in:fly={{ y: 16, duration: 300 }}>
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

	<!-- SCORE BREAKDOWN -->
	<section class="mt-8 grid gap-6 xl:grid-cols-[320px_1fr] xl:items-start">
		<div class="border border-metal-100 bg-surface rounded-sm p-5">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-xs uppercase tracking-[0.25em] text-metal-500 font-mono">
					Score Breakdown
				</h2>
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
						<span class="text-[10px] uppercase tracking-[0.15em] font-mono text-metal-500"
							>Trust</span
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

	<!-- BENCHMARK -->
	<section class="mt-8 border border-metal-100 bg-surface rounded-sm p-5">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-xs uppercase tracking-[0.25em] text-metal-500 font-mono">Benchmark</h2>
			<span class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono"
				>vs category</span
			>
		</div>
		<BenchmarkBar items={benchmarkItems} />
	</section>

	<section class="mt-8 grid gap-8 xl:grid-cols-[1fr_320px]">
		<div class="space-y-6">
			<div class="border border-metal-100 bg-surface rounded-sm p-5">
				<div class="flex items-center justify-between gap-3">
					<h2 class="text-xs uppercase tracking-[0.25em] text-metal-500 font-mono">
						Signal Metrics
					</h2>
					<span class="text-xs uppercase tracking-[0.2em] text-metal-500 font-mono"
						>GitHub data</span
					>
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
								<div class="signal-fill" style={`width: ${item.width}%`}></div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="grid gap-4 lg:grid-cols-3">
				<div class="border border-metal-100 bg-surface rounded-sm p-5">
					<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono mb-2">
						Benefit
					</p>
					<ul class="space-y-3 text-sm text-metal-500">
						{#each benefits as item}
							<li class="flex items-start gap-2">
								<Icon data={boltIcon} size="12px" color="var(--accent-dim)" />
								<span>{item}</span>
							</li>
						{/each}
					</ul>
				</div>

				<div class="border border-metal-100 bg-surface rounded-sm p-5">
					<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono mb-2">
						Use case
					</p>
					<p class="text-base text-metal-900 font-medium">
						{data.tool.bestFor?.[0] ?? 'General users'}
					</p>
					<p class="mt-2 text-sm text-metal-500">
						Ideal for developers and teams focused on this use case.
					</p>
				</div>

				<div class="border border-metal-100 bg-surface rounded-sm p-5">
					<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono mb-2">
						Pricing
					</p>
					<p class="text-base text-metal-900 font-medium">{data.tool.pricingModel ?? 'unknown'}</p>
					<p class="mt-2 text-sm text-metal-500">
						Transparent pricing to help evaluate ROI before visiting.
					</p>
				</div>
			</div>

			<div class="border border-metal-100 bg-surface rounded-sm p-5">
				<div class="flex items-center justify-between gap-3 mb-4">
					<h2 class="text-xs uppercase tracking-[0.25em] text-metal-500 font-mono">Compare</h2>
					<span class="text-xs uppercase tracking-[0.2em] text-metal-500 font-mono"
						>{data.compareTools.length} candidates</span
					>
				</div>
				<div class="space-y-4">
					<div
						class="flex items-center justify-between gap-4 border border-metal-100 rounded-sm px-4 py-3 bg-bg"
					>
						<div>
							<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">
								Selected
							</p>
							<p class="font-medium text-metal-900">{data.tool.name}</p>
						</div>
						<Icon data={crownIcon} size="16px" color="var(--accent-dim)" />
					</div>

					{#if data.compareTools.length > 0}
						{#each data.compareTools as compareTool}
							<a
								href={`/compare/${encodeURIComponent(`${data.tool.slug ?? data.tool.name}-vs-${compareTool.slug ?? compareTool.name}`)}`}
								class="flex items-center justify-between gap-4 border border-metal-100 rounded-sm px-4 py-3 hover:border-metal-900 transition-colors"
							>
								<div class="min-w-0">
									<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">
										Compare with
									</p>
									<p class="truncate font-medium text-metal-900">{compareTool.name}</p>
									<div class="mt-2 flex flex-wrap gap-2">
										<span class="badge-chip">
											{compareTool.category ?? 'general'}
										</span>
										{#if compareTool.bestFor?.length}
											<span class="badge-chip">{compareTool.bestFor[0]}</span>
										{/if}
									</div>
								</div>
								<Icon data={searchIcon} size="14px" color="currentColor" />
							</a>
						{/each}
					{:else}
						<p class="text-sm text-metal-500">
							{comparisonLine}
						</p>
					{/if}
				</div>
			</div>
		</div>

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
							<span class="text-[10px] uppercase tracking-[0.15em] font-mono text-metal-500"
								>Trust</span
							>
							<span class="text-xs font-mono font-bold text-metal-900">{data.tool.trustScore}</span>
						</div>
						<div class="h-2 bg-metal-100 rounded-sm overflow-hidden">
							<div
								class="h-full bg-accent-dim rounded-sm"
								style="width: {data.tool.trustScore}%"
							></div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Related tools -->
			<div class="border border-metal-100 bg-surface rounded-sm p-5">
				<div class="flex items-center justify-between">
					<p class="text-xs uppercase tracking-[0.25em] text-metal-500 font-mono">Related tools</p>
					<Icon data={layersIcon} size="14px" color="var(--metal-500)" />
				</div>
				<div class="mt-4 space-y-3">
					{#each data.relatedTools as related}
						<a
							href={`/tool/${encodeURIComponent(related.slug ?? related.name)}`}
							class="block border border-metal-100 rounded-sm px-4 py-3 hover:border-metal-900 transition-colors"
						>
							<div class="flex items-center justify-between gap-3">
								<div class="min-w-0">
									<p class="truncate text-sm font-medium text-metal-900">{related.name}</p>
									<div class="mt-2 flex flex-wrap gap-2">
										<span class="badge-chip">
											{related.category ?? 'general'}
										</span>
										{#if related.pricingModel}
											<span class="badge-chip">{related.pricingModel}</span>
										{/if}
									</div>
								</div>
								<span class="text-xs font-mono text-accent">{(related.score ?? 0).toFixed(1)}</span>
							</div>
						</a>
					{/each}
					{#if data.relatedTools.length === 0}
						<p class="text-sm text-metal-500">No related tools yet.</p>
					{/if}
				</div>
			</div>

			<!-- Disclosure -->
			<div class="border border-metal-100 bg-surface rounded-sm p-5">
				<div class="flex items-center justify-between">
					<p class="text-xs uppercase tracking-[0.25em] text-metal-500 font-mono">Disclosure</p>
					<Icon data={boltIcon} size="14px" color="var(--accent-dim)" />
				</div>
				<p class="mt-3 text-sm text-metal-500">
					Some outbound links may be affiliate links. Sponsored promotion, if present, is shown on
					this page.
				</p>
			</div>
		</aside>
	</section>
</main>

<style>
	.badge-chip {
		border: 1px solid var(--metal-100);
		background: var(--bg);
		color: var(--metal-500);
		padding: 0.35rem 0.6rem;
		border-radius: 0.125rem;
		font-size: 0.65rem;
		line-height: 1;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		font-family: var(--font-mono);
	}

	.badge-chip-hero {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding-inline: 0.7rem;
		background: var(--surface);
		color: var(--metal-900);
		border-color: var(--metal-900);
	}

	.badge-chip-hero img {
		filter: grayscale(100%) contrast(1.1);
	}

	.badge-chip-accent {
		border-color: var(--accent-dim);
		background: color-mix(in srgb, var(--accent-dim) 18%, var(--surface));
		color: var(--metal-900);
	}

	.signal-row {
		display: grid;
		gap: 0.45rem;
	}

	.signal-track {
		height: 0.6rem;
		border: 1px solid var(--metal-100);
		background: var(--bg);
		border-radius: 0.125rem;
		overflow: hidden;
	}

	.signal-fill {
		height: 100%;
		background: linear-gradient(
			90deg,
			var(--accent-dim),
			color-mix(in srgb, var(--accent-dim) 55%, var(--metal-900))
		);
	}

	.score-row {
		margin-bottom: 0.75rem;
	}

	.score-row:last-child {
		margin-bottom: 0;
	}
</style>
