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
	import { parseMarkdown } from '$lib/utils/markdown';

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

	const displayPricing = $derived.by(() => {
		if (data.tool.pricingModel && data.tool.pricingModel !== 'unknown') {
			return data.tool.pricingModel;
		}
		return 'open-source';
	});

	const useCasesList = $derived.by(() => {
		const cases = [
			...(data.tool.useCases ?? []).map((u) => ({ text: u, type: 'useCase' })),
			...(data.tool.bestFor ?? []).map((b) => ({ text: b, type: 'bestFor' }))
		];
		return cases.slice(0, 6);
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

	const pageUrl = $derived.by(
		() => `https://velo-428.pages.dev/tool/${encodeURIComponent(data.tool.slug ?? data.tool.name)}`
	);

	let readmeContent = $state<string | null>(null);
	let readmeLoading = $state(false);
	let readmeError = $state<string | null>(null);
	let readmeTruncated = $state(false);
	let readmeExpanded = $state(false);

	const CACHE_TTL = 60 * 60 * 1000;

	function getCacheKey(slug: string): string {
		return `readme:${slug}`;
	}

	function getCachedReadme(slug: string): string | null {
		if (typeof sessionStorage === 'undefined') return null;
		const cached = sessionStorage.getItem(getCacheKey(slug));
		if (!cached) return null;
		try {
			const { content, fetchedAt } = JSON.parse(cached);
			if (Date.now() - fetchedAt > CACHE_TTL) {
				sessionStorage.removeItem(getCacheKey(slug));
				return null;
			}
			return content;
		} catch {
			return null;
		}
	}

	function setCachedReadme(slug: string, content: string): void {
		if (typeof sessionStorage === 'undefined') return;
		sessionStorage.setItem(
			getCacheKey(slug),
			JSON.stringify({
				content,
				fetchedAt: Date.now()
			})
		);
	}

	async function fetchReadme() {
		if (!data.tool.url) return;

		const slug = data.tool.slug ?? data.tool.name;

		const cached = getCachedReadme(slug);
		if (cached) {
			readmeContent = cached;
			return;
		}

		readmeLoading = true;
		readmeError = null;

		try {
			const apiUrl = `/api/readme?url=${encodeURIComponent(data.tool.url)}`;
			const response = await fetch(apiUrl);
			const result = await response.json();

			if (result.error) {
				readmeError = result.message || 'Documentation unavailable';
				readmeContent = null;
				return;
			}

			if (!result.content) {
				readmeError = 'No documentation found for this repository';
				readmeContent = null;
				return;
			}

			readmeContent = result.content;
			readmeTruncated = result.truncated;
			setCachedReadme(slug, result.content);
		} catch (err) {
			readmeError = 'Documentation unavailable';
			readmeContent = null;
		} finally {
			readmeLoading = false;
		}
	}

	$effect(() => {
		fetchReadme();
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
	<meta property="og:url" content={pageUrl} />
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
			<div class="min-w-0 space-y-6">
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
								class="detail-title max-w-4xl text-[clamp(2.3rem,4.5vw,4.6rem)] leading-[0.95] tracking-[-0.05em] text-metal-900 font-heading"
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

	<!-- README -->
	{#if readmeLoading || readmeContent || readmeError}
		<section class="mt-8 border border-metal-100 bg-surface rounded-sm overflow-hidden">
			<div class="flex items-center justify-between px-5 py-3 border-b border-metal-100">
				<div class="flex items-center gap-2">
					<svg class="size-4" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
						/>
					</svg>
					<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">README</p>
				</div>
				{#if readmeLoading}
					<span class="text-[10px] text-metal-500 font-mono">Loading...</span>
				{/if}
			</div>
			<div class="p-5">
				{#if readmeLoading}
					<div class="space-y-2 animate-pulse">
						<div class="h-4 bg-metal-100 rounded w-3/4"></div>
						<div class="h-4 bg-metal-100 rounded w-1/2"></div>
						<div class="h-4 bg-metal-100 rounded w-5/6"></div>
						<div class="h-4 bg-metal-100 rounded w-2/3"></div>
					</div>
				{:else if readmeError}
					<div class="flex items-center gap-2 text-sm">
						<span class="text-metal-500">{readmeError}</span>
						<a
							href={data.tool.url}
							target="_blank"
							rel="noopener noreferrer"
							class="text-accent-dim hover:text-metal-900 underline font-mono text-xs uppercase tracking-[0.15em]"
						>
							View on GitHub
						</a>
					</div>
				{:else if readmeContent}
					{@const displayContent =
						readmeExpanded || !readmeTruncated ? readmeContent : readmeContent.slice(0, 500)}
					<div class="readme-content prose">
						{@html parseMarkdown(displayContent)}
					</div>
					{#if readmeTruncated && !readmeExpanded}
						<button
							type="button"
							class="mt-4 text-xs uppercase tracking-[0.15em] font-mono text-metal-500 hover:text-metal-900 transition-colors"
							onclick={() => (readmeExpanded = true)}
						>
							Read more...
						</button>
					{/if}
				{/if}
			</div>
		</section>
	{/if}

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

			<div class="grid gap-4 lg:grid-cols-2">
				<div
					class="border border-metal-900 bg-surface rounded-sm p-5 shadow-[4px_4px_0px_var(--accent-dim)]"
				>
					<div class="flex items-center gap-2 mb-4">
						<div
							class="size-8 border border-metal-900 bg-metal-900 rounded-sm flex items-center justify-center"
						>
							<Icon data={boltIcon} size="14px" color="var(--accent-dim)" />
						</div>
						<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">
							Use cases
						</p>
					</div>
					{#if useCasesList.length > 0}
						<div class="flex flex-wrap gap-2">
							{#each useCasesList as item}
								<span class="use-case-tag">{item.text}</span>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-metal-500">No use cases listed.</p>
					{/if}
				</div>

				<div
					class="border border-metal-900 bg-surface rounded-sm p-5 shadow-[4px_4px_0px_var(--accent-dim)]"
				>
					<div class="flex items-center gap-2 mb-4">
						<div
							class="size-8 border border-metal-900 bg-metal-900 rounded-sm flex items-center justify-center"
						>
							<Icon data={crownIcon} size="14px" color="var(--accent-dim)" />
						</div>
						<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">
							Pricing model
						</p>
					</div>
					<p class="text-xl font-heading font-bold text-metal-900 capitalize">{displayPricing}</p>
					<p class="mt-2 text-sm text-metal-500">
						{data.tool.url.includes('github') ? 'Repository hosted on GitHub' : 'Web-based service'}
					</p>
					{#if data.tool.affiliateAvailable}
						<div class="mt-3 pt-3 border-t border-metal-100">
							<span class="use-case-tag use-case-tag-accent">affiliate-ready</span>
						</div>
					{/if}
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
						class="flex items-center justify-between gap-3 border border-metal-100 rounded-sm px-3 py-3 bg-bg min-w-0"
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
								class="flex items-center justify-between gap-3 border border-metal-100 rounded-sm px-3 py-3 hover:border-metal-900 transition-colors min-w-0"
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
							class="block border border-metal-100 rounded-sm px-3 py-3 hover:border-metal-900 transition-colors min-w-0"
						>
							<div class="flex items-center justify-between gap-3 min-w-0">
								<div class="min-w-0 flex-1">
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

	.use-case-tag {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		border: 1px solid var(--metal-200);
		background: var(--bg);
		color: var(--metal-700);
		padding: 0.4rem 0.75rem;
		border-radius: 0.125rem;
		font-size: 0.7rem;
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		transition: all 160ms ease;
	}

	.use-case-tag:hover {
		border-color: var(--metal-900);
		color: var(--metal-900);
	}

	.use-case-tag-accent {
		border-color: var(--accent-dim);
		background: color-mix(in srgb, var(--accent-dim) 15%, var(--surface));
		color: var(--metal-900);
	}

	.detail-title {
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	@media (max-width: 640px) {
		section {
			min-width: 0;
		}

		.border,
		.rounded-sm {
			min-width: 0;
		}

		.badge-chip,
		.use-case-tag {
			max-width: 100%;
			white-space: normal;
			line-height: 1.2;
			word-break: break-word;
		}

		.readme-content {
			font-size: 0.82rem;
		}

		.readme-content :global(pre) {
			padding: 0.75rem;
			font-size: 0.78rem;
		}

		.readme-content :global(img) {
			max-width: 100%;
			height: auto;
		}

		.readme-content :global(table) {
			display: block;
			width: 100%;
			overflow-x: auto;
		}

		.readme-content :global(pre),
		.readme-content :global(code) {
			overflow-wrap: anywhere;
		}

		.score-row > div:first-child,
		.signal-row > div:first-child {
			gap: 0.5rem;
		}
	}

	.readme-content {
		font-size: 0.875rem;
		line-height: 1.7;
		color: var(--metal-700);
	}

	.readme-content :global(h1) {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--metal-900);
		margin: 0 0 1rem;
		font-family: var(--font-heading);
	}

	.readme-content :global(h2) {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--metal-900);
		margin: 1.5rem 0 0.75rem;
		font-family: var(--font-heading);
	}

	.readme-content :global(h3) {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--metal-900);
		margin: 1rem 0 0.5rem;
	}

	.readme-content :global(p) {
		margin: 0 0 1rem;
	}

	.readme-content :global(ul) {
		margin: 0 0 1rem;
		padding-left: 1.5rem;
		list-style-type: disc;
	}

	.readme-content :global(li) {
		margin: 0.25rem 0;
	}

	.readme-content :global(code) {
		font-family: var(--font-mono);
		font-size: 0.8em;
		background: var(--metal-100);
		padding: 0.15em 0.4em;
		border-radius: 0.125rem;
	}

	.readme-content :global(pre) {
		background: var(--metal-900);
		color: var(--surface);
		padding: 1rem;
		border-radius: 0.125rem;
		overflow-x: auto;
		margin: 1rem 0;
	}

	.readme-content :global(pre code) {
		background: transparent;
		padding: 0;
		font-size: 0.8rem;
	}

	.readme-content :global(a) {
		color: var(--accent-dim);
		text-decoration: underline;
	}

	.readme-content :global(a:hover) {
		color: var(--metal-900);
	}

	.readme-content :global(strong) {
		font-weight: 700;
		color: var(--metal-900);
	}
</style>
