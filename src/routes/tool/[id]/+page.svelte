<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Icon } from 'svelte-icon';
	import type { Tool } from '$lib/types';
	import searchIcon from '$lib/icons/search.svg?raw';
	import crownIcon from '$lib/icons/crown.svg?raw';
	import boltIcon from '$lib/icons/bolt.svg?raw';
	import layersIcon from '$lib/icons/layers.svg?raw';

	let { data }: { data: { tool: Tool; relatedTools: Tool[]; compareTools: Tool[] } } = $props();

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
</script>

<svelte:head>
	<title>{data.tool.name} — VELO</title>
</svelte:head>

<main class="w-full max-w-[1280px] mx-auto px-6 py-8 lg:py-12" in:fly={{ y: 16, duration: 300 }}>
	<section class="relative overflow-hidden rounded-sm border border-metal-100 bg-surface px-6 py-6 lg:px-8 lg:py-8">
		<div class="absolute inset-y-0 right-0 w-[260px] bg-[linear-gradient(180deg,rgba(184,255,31,0.14),rgba(255,255,255,0))] pointer-events-none"></div>
		<div class="relative grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
		<div class="space-y-6">
			<div class="flex items-center gap-3 text-metal-500 text-xs uppercase tracking-[0.25em] font-mono">
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

				<h1 class="max-w-4xl text-[clamp(2.3rem,4.5vw,4.6rem)] leading-[0.95] tracking-[-0.05em] text-metal-900 font-heading">
					{data.tool.name}
				</h1>
				<p class="max-w-3xl text-base lg:text-lg text-metal-500 leading-relaxed">{data.tool.description}</p>
			</header>
		</div>

		<div class="grid gap-4 self-start">
			<div class="border border-metal-100 bg-surface rounded-sm p-5 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
				<div class="flex items-center justify-between">
					<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">Score</p>
					<Icon data={crownIcon} size="16px" color="var(--metal-500)" />
				</div>
				<p class="mt-4 text-4xl font-mono font-bold text-metal-900">{(data.tool.score ?? 0).toFixed(1)}</p>
				<p class="mt-2 text-sm text-metal-500">Ranking score combines demand, trust, and conversion fit.</p>
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

			<div class="border border-metal-100 bg-surface rounded-sm p-5 text-sm text-metal-500">
				<p class="text-metal-900 font-medium mb-2">Promotion</p>
				{#if data.tool.affiliateAvailable}
					<p class="text-metal-500">This tool supports affiliate tracking and can be promoted here.</p>
					{#if data.tool.affiliateCommission}
						<p class="mt-2 text-xs uppercase tracking-[0.2em] font-mono text-metal-500">
							Commission: {data.tool.affiliateCommission}
						</p>
					{/if}
				{:else}
					<p class="text-metal-500">No promo slot attached to this tool yet.</p>
				{/if}
			</div>
		</div>
		</div>
	</section>

	<section class="mt-8 grid gap-8 xl:grid-cols-[1fr_320px]">
		<div class="space-y-6">
				<div class="grid gap-4 lg:grid-cols-3">
				<div class="border border-metal-100 bg-surface rounded-sm p-5">
					<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono mb-2">Benefit</p>
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
					<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono mb-2">Use case</p>
					<p class="text-base text-metal-900 font-medium">{data.tool.bestFor?.[0] ?? 'General users'}</p>
					<p class="mt-2 text-sm text-metal-500">
						Best for the selected persona and adjacent workflows.
					</p>
				</div>

				<div class="border border-metal-100 bg-surface rounded-sm p-5">
					<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono mb-2">Pricing</p>
					<p class="text-base text-metal-900 font-medium">{data.tool.pricingModel ?? 'unknown'}</p>
					<p class="mt-2 text-sm text-metal-500">
						Match pricing with buyer intent before sending traffic.
					</p>
				</div>
			</div>

				<div class="border border-metal-100 bg-surface rounded-sm p-5">
					<div class="flex items-center justify-between gap-3 mb-4">
						<h2 class="text-xs uppercase tracking-[0.25em] text-metal-500 font-mono">Compare</h2>
					<span class="text-xs uppercase tracking-[0.2em] text-metal-500 font-mono">{data.compareTools.length} candidates</span>
				</div>
				<div class="space-y-4">
					<div class="flex items-center justify-between gap-4 border border-metal-100 rounded-sm px-4 py-3 bg-bg">
						<div>
							<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">Selected</p>
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
									<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">Compare with</p>
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

			<div class="border border-metal-100 bg-surface rounded-sm p-5">
				<div class="flex items-center justify-between">
					<p class="text-xs uppercase tracking-[0.25em] text-metal-500 font-mono">Disclosure</p>
					<Icon data={boltIcon} size="14px" color="var(--accent-dim)" />
				</div>
				<p class="mt-3 text-sm text-metal-500">
					Some outbound links may be affiliate links. Sponsored promotion, if present, is shown on this page.
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
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent) 18%, var(--surface));
		color: var(--metal-900);
	}
</style>
