<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Icon } from 'svelte-icon';
	import searchIcon from '$lib/icons/search.svg?raw';
	import filterIcon from '$lib/icons/filter.svg?raw';
	import crownIcon from '$lib/icons/crown.svg?raw';
	import boltIcon from '$lib/icons/bolt.svg?raw';
	import layersIcon from '$lib/icons/layers.svg?raw';
	import type { TrendingData, Tool } from '$lib/types';

	let { data }: { data: { trending: TrendingData } } = $props();

	let query = $state('');
	let activeCategory = $state('All');

	const categories = $derived.by(() => {
		const values = new Set<string>();
		for (const tool of data.trending.products) values.add(tool.category ?? 'general');
		return ['All', ...Array.from(values).sort()];
	});

	const filteredTools = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return data.trending.products.filter((tool) => {
			const categoryMatch = activeCategory === 'All' || (tool.category ?? 'general') === activeCategory;
			if (!categoryMatch) return false;
			if (!q) return true;
			const haystack = [
				tool.name,
				tool.description,
				tool.category,
				...(tool.useCases ?? []),
				...(tool.bestFor ?? [])
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return haystack.includes(q);
		});
	});

	const top1 = $derived.by(() => filteredTools.slice(0, 1));
	const top3 = $derived.by(() => filteredTools.slice(0, 3));
	const top5 = $derived.by(() => filteredTools.slice(0, 5));
	const top10 = $derived.by(() => filteredTools.slice(0, 10));
	const monetizedCount = $derived.by(() => data.trending.products.filter((tool) => tool.affiliateAvailable).length);
	const selectedCategoryLabel = $derived.by(() =>
		activeCategory === 'All' ? 'All categories' : activeCategory
	);

	function scoreLabel(tool: Tool): string {
		return (tool.score ?? 0).toFixed(1);
	}
</script>

<svelte:head>
	<title>VELO — AI Tools Ranker</title>
</svelte:head>

<main class="w-full max-w-[1280px] mx-auto px-6 py-8 lg:py-12" in:fly={{ y: 12, duration: 350 }}>
	<section class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
		<div class="space-y-5">
			<div class="inline-flex items-center gap-3 border border-metal-100 bg-surface px-4 py-3 rounded-sm shadow-[0_1px_0_rgba(0,0,0,0.02)]">
				<div class="size-10 border border-metal-900 bg-metal-900 text-surface rounded-sm flex items-center justify-center shadow-[4px_4px_0px_var(--accent)]">
					<Icon data={layersIcon} size="18px" color="currentColor" />
				</div>
				<div>
					<p class="text-[10px] uppercase tracking-[0.3em] text-metal-500 font-mono">AI Tools Ranker</p>
					<p class="text-sm text-metal-500">Curated catalog at speed</p>
				</div>
			</div>

			<header class="space-y-4">
				<p class="text-[10px] uppercase tracking-[0.35em] text-metal-500 font-mono">
					Curated AI tools, ranked by signal
				</p>
				<h1 class="max-w-4xl text-[clamp(2.4rem,4.8vw,5rem)] leading-[0.92] tracking-[-0.05em] text-metal-900 font-heading">
					Find the top AI tools fast.
				</h1>
				<p class="max-w-2xl text-base lg:text-lg text-metal-500 leading-relaxed">
					Scan top 1, top 3, top 5, and top 10 at a glance. Search across names, categories, use cases,
					and best-for labels without losing the ranking hierarchy.
				</p>
			</header>

			<div class="grid gap-3 xl:grid-cols-[1fr_auto]">
				<label class="flex items-center gap-3 border border-metal-100 bg-surface px-4 py-3 rounded-sm shadow-[0_1px_0_rgba(0,0,0,0.02)]">
					<Icon data={searchIcon} size="18px" color="var(--metal-500)" />
					<input
						bind:value={query}
						class="w-full bg-transparent outline-none text-sm text-metal-900 placeholder:text-metal-500"
						placeholder="Search tools, categories, use cases..."
					/>
				</label>

				<div class="flex flex-wrap items-center gap-2">
					{#each categories as category}
						<button
							class="shrink-0 rounded-sm border px-3 py-2.5 text-xs font-mono uppercase tracking-[0.15em] transition-all inline-flex items-center gap-2 hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] cursor-pointer"
							class:bg-metal-900={activeCategory === category}
							class:text-surface={activeCategory === category}
							class:border-metal-900={activeCategory === category}
							class:bg-surface={activeCategory !== category}
							class:text-metal-500={activeCategory !== category}
							class:border-metal-100={activeCategory !== category}
							onclick={() => (activeCategory = category)}
						>
							<Icon data={filterIcon} size="12px" color="currentColor" />
							{category}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<div class="grid gap-4 self-start">
			<div class="border border-metal-100 bg-surface rounded-sm overflow-hidden shadow-[0_1px_0_rgba(0,0,0,0.02)]">
				<div class="relative aspect-[16/10] bg-[color-mix(in_srgb,var(--surface)_88%,var(--accent)_12%)]">
					<picture>
						<source srcset="/hero-image/hero-image_4x.webp" media="(min-width: 1400px)" />
						<source srcset="/hero-image/hero-image_3x.webp" media="(min-width: 1024px)" />
						<source srcset="/hero-image/hero-image_2x.webp" media="(min-width: 640px)" />
						<img
							src="/hero-image/hero-image_1x.webp"
							alt="VELO landing visual"
							class="absolute inset-0 size-full object-cover translate-y-[-50px]"
							loading="eager"
							decoding="async"
						/>
					</picture>
					<div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-[color-mix(in_srgb,var(--bg)_88%,transparent)] to-transparent p-4">
						<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">Hero visual</p>
						<p class="mt-1 text-sm font-medium text-metal-900">Fast scan, clean discovery, clear hierarchy.</p>
					</div>
				</div>
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div class="border border-metal-100 bg-surface rounded-sm p-5">
					<div class="flex items-center justify-between">
						<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">Inventory</p>
						<Icon data={layersIcon} size="16px" color="var(--metal-500)" />
					</div>
					<p class="mt-4 text-3xl font-heading text-metal-900">{data.trending.products.length}</p>
					<p class="text-sm text-metal-500 mt-2">Tools in catalog.</p>
				</div>
				<div class="border border-metal-100 bg-surface rounded-sm p-5">
					<div class="flex items-center justify-between">
						<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">Top 1</p>
						<Icon data={crownIcon} size="16px" color="var(--metal-500)" />
					</div>
					<p class="mt-4 text-3xl font-heading text-metal-900">{top1[0] ? scoreLabel(top1[0]) : '—'}</p>
					<p class="text-sm text-metal-500 mt-2">Current leader.</p>
				</div>
			</div>
			<div class="border border-metal-100 bg-surface rounded-sm p-5">
				<div class="flex items-center justify-between gap-3">
					<div>
						<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">Monetization</p>
						<p class="mt-2 text-sm text-metal-500">
							Affiliate-ready tools are labeled. Sponsored placements stay separate from rank.
						</p>
					</div>
					<div class="size-10 border border-metal-100 rounded-sm flex items-center justify-center bg-bg">
						<Icon data={boltIcon} size="16px" color="var(--accent-dim)" />
					</div>
				</div>
				<div class="mt-4 flex items-center justify-between rounded-sm border border-metal-100 bg-bg px-3 py-2">
					<span class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">Affiliate tools</span>
					<span class="text-sm font-mono font-bold text-metal-900">{monetizedCount}</span>
				</div>
			</div>
		</div>
	</section>

	<section class="mt-8 grid gap-8 xl:grid-cols-[1.18fr_0.82fr]">
		<div class="space-y-8">
			<div class="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
				{#if top1[0]}
						<article class="border border-metal-900 bg-metal-900 text-surface rounded-sm p-6 lg:p-7 shadow-[6px_6px_0px_var(--accent)] cursor-pointer">
						<div class="flex items-start justify-between gap-4">
							<div>
								<div class="inline-flex items-center gap-2 text-accent">
									<Icon data={crownIcon} size="16px" color="currentColor" />
									<p class="text-[10px] uppercase tracking-[0.25em] font-mono">Top 1</p>
								</div>
								<h2 class="mt-3 text-3xl lg:text-4xl font-heading text-surface">{top1[0].name}</h2>
							</div>
							<div class="text-right">
								<p class="text-[10px] uppercase tracking-[0.25em] text-metal-300 font-mono">score</p>
								<p class="text-4xl font-mono font-bold text-accent">{scoreLabel(top1[0])}</p>
							</div>
						</div>
						<p class="mt-4 max-w-xl text-surface/80 leading-relaxed">{top1[0].description}</p>
						<div class="mt-5 flex flex-wrap gap-2">
							<span class="badge-hero">{top1[0].category ?? 'general'}</span>
							{#if top1[0].pricingModel}
								<span class="badge-hero">{top1[0].pricingModel}</span>
							{/if}
							{#if activeCategory !== 'All'}
								<span class="badge-hero badge-hero-accent">selected</span>
							{/if}
							{#if top1[0].affiliateAvailable}
								<span class="badge-hero badge-hero-accent">affiliate</span>
							{/if}
						</div>
					</article>
				{/if}

				<div class="grid gap-4">
					{#each top3.slice(1, 3) as tool, index}
						<a
							href={`/tool/${encodeURIComponent(tool.slug ?? tool.name)}`}
							class={index === 0
								? 'border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_90%,var(--accent)_10%)] rounded-sm p-5 transition-all shadow-[0_1px_0_rgba(0,0,0,0.02)] hover:border-metal-900 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] active:translate-y-[0px] active:scale-[0.995] cursor-pointer'
								: 'border border-metal-100 bg-surface rounded-sm p-5 transition-all shadow-[0_1px_0_rgba(0,0,0,0.02)] hover:border-metal-900 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] active:translate-y-[0px] active:scale-[0.995] cursor-pointer'}
						>
							<div class="flex items-start justify-between gap-4">
								<div>
									<div class="inline-flex items-center gap-2 text-metal-500">
										<Icon data={boltIcon} size="14px" color="currentColor" />
										<p class="text-[10px] uppercase tracking-[0.25em] font-mono">Top {index + 2}</p>
									</div>
									<h3 class="mt-1 text-xl font-heading text-metal-900">{tool.name}</h3>
									<p class="mt-2 text-sm text-metal-500">{tool.description}</p>
								</div>
								<p class="text-2xl font-mono font-bold text-metal-900">{scoreLabel(tool)}</p>
							</div>
							<div class="mt-3 flex flex-wrap gap-2">
								<span class="badge-chip">{tool.category ?? 'general'}</span>
								{#if activeCategory !== 'All'}
									<span class="badge-chip badge-chip-accent">selected</span>
								{/if}
								{#if tool.affiliateAvailable}
									<span class="badge-chip badge-chip-accent">affiliate</span>
								{/if}
							</div>
						</a>
					{/each}
				</div>
			</div>

			<div class="grid gap-3">
				<div class="flex items-center justify-between">
					<h2 class="text-xs uppercase tracking-[0.3em] text-metal-500 font-mono">Top 5</h2>
					<span class="text-xs uppercase tracking-[0.2em] text-metal-500 font-mono">{top5.length} visible</span>
				</div>
				<div class="grid gap-3">
					{#each top5 as tool, index}
						<a
							href={`/tool/${encodeURIComponent(tool.slug ?? tool.name)}`}
							class={index < 2
								? 'flex items-center justify-between gap-4 border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--accent)_6%)] rounded-sm px-4 py-4 transition-all shadow-[0_1px_0_rgba(0,0,0,0.02)] hover:border-metal-900 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] active:scale-[0.995] cursor-pointer'
								: 'flex items-center justify-between gap-4 border border-metal-100 bg-surface rounded-sm px-4 py-4 transition-all shadow-[0_1px_0_rgba(0,0,0,0.02)] hover:border-metal-900 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] active:scale-[0.995] cursor-pointer'}
						>
							<div class="min-w-0">
								<div class="flex items-center gap-2 text-metal-500">
									<Icon data={index === 0 ? crownIcon : boltIcon} size="12px" color="currentColor" />
									<p class="text-[10px] uppercase tracking-[0.2em] font-mono">#{index + 1}</p>
								</div>
								<h3 class="truncate text-base font-semibold text-metal-900">{tool.name}</h3>
								<div class="mt-2 flex flex-wrap gap-2">
									<span class="badge-chip">{tool.category ?? 'general'}</span>
									{#if tool.bestFor?.length}
										<span class="badge-chip">{tool.bestFor[0]}</span>
									{/if}
									{#if activeCategory !== 'All'}
										<span class="badge-chip badge-chip-accent">selected</span>
									{/if}
								</div>
							</div>
							<div class="text-right shrink-0">
								<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">score</p>
								<p class="text-xl font-mono font-bold text-accent">{scoreLabel(tool)}</p>
							</div>
						</a>
					{/each}
				</div>
			</div>

			<div class="grid gap-3">
				<div class="flex items-center justify-between">
					<h2 class="text-xs uppercase tracking-[0.3em] text-metal-500 font-mono">Top 10</h2>
					<span class="text-xs uppercase tracking-[0.2em] text-metal-500 font-mono">{top10.slice(5, 10).length} more</span>
				</div>
				<div class="grid gap-3 md:grid-cols-2">
					{#each top10.slice(5, 10) as tool, index}
						<a
							href={`/tool/${encodeURIComponent(tool.slug ?? tool.name)}`}
							class="border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_96%,var(--metal-100)_4%)] rounded-sm p-4 transition-all shadow-[0_1px_0_rgba(0,0,0,0.02)] hover:border-metal-900 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] active:scale-[0.995] cursor-pointer"
						>
							<div class="flex items-start justify-between gap-4">
								<div class="min-w-0">
									<div class="flex items-center gap-2 text-metal-500">
										<Icon data={layersIcon} size="12px" color="currentColor" />
										<p class="text-[10px] uppercase tracking-[0.2em] font-mono">
											#{index + 6}
										</p>
									</div>
									<h3 class="truncate text-base font-semibold text-metal-900">{tool.name}</h3>
								</div>
								<p class="text-lg font-mono font-bold text-metal-900">{scoreLabel(tool)}</p>
							</div>
							<div class="mt-3 flex flex-wrap gap-2">
								<span class="badge-chip">{tool.category ?? 'general'}</span>
								{#if tool.pricingModel}
									<span class="badge-chip">{tool.pricingModel}</span>
								{/if}
								{#if activeCategory !== 'All'}
									<span class="badge-chip badge-chip-accent">selected</span>
								{/if}
							</div>
						</a>
					{/each}
				</div>
			</div>
		</div>

		<aside class="space-y-4">
			<div class="border border-metal-100 bg-surface rounded-sm p-5">
				<div class="flex items-center justify-between">
					<h3 class="text-xs uppercase tracking-[0.25em] text-metal-500 font-mono">Categories</h3>
					<span class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">Selected</span>
				</div>
				<div class="mt-3 rounded-sm border border-metal-100 bg-bg px-3 py-2">
					<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">Active</p>
					<p class="mt-1 text-sm font-medium text-metal-900 capitalize">{selectedCategoryLabel}</p>
				</div>
				<div class="mt-4 grid grid-cols-2 gap-2">
					{#each categories.slice(1) as category}
						<button
							class="badge-chip text-left transition-all hover:border-metal-900 hover:text-metal-900 cursor-pointer"
							class:badge-chip-active={activeCategory === category}
							onclick={() => (activeCategory = category)}
						>
							{category}
						</button>
					{/each}
				</div>
			</div>

			<div class="border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_97%,var(--metal-100)_3%)] rounded-sm p-5">
				<p class="text-xs uppercase tracking-[0.25em] text-metal-500 font-mono mb-2">Search results</p>
				<p class="text-3xl font-mono font-bold text-metal-900">{filteredTools.length}</p>
				<p class="mt-2 text-sm text-metal-500">Tools matching your current filter.</p>
			</div>

			<div class="border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_97%,var(--metal-100)_3%)] rounded-sm p-5 text-sm text-metal-500 leading-relaxed">
				<div class="flex items-center justify-between mb-3">
					<p class="text-metal-900 font-medium">Disclosure</p>
					<Icon data={boltIcon} size="14px" color="var(--accent-dim)" />
				</div>
				<p>
					Some outbound links may be affiliate links. Ranking stays separate from sponsor placement.
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

	.badge-chip-accent {
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent) 18%, var(--surface));
		color: var(--metal-900);
	}

	.badge-chip-active {
		border-color: var(--metal-900);
		background: color-mix(in srgb, var(--metal-900) 5%, var(--surface));
		color: var(--metal-900);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 40%, transparent);
	}

	.badge-hero {
		border: 1px solid rgba(255, 255, 255, 0.16);
		background: rgba(255, 255, 255, 0.06);
		color: var(--surface);
		padding: 0.35rem 0.6rem;
		border-radius: 0.125rem;
		font-size: 0.65rem;
		line-height: 1;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		font-family: var(--font-mono);
	}

	.badge-hero-accent {
		background: var(--accent);
		color: var(--metal-900);
		border-color: var(--accent);
	}
</style>
