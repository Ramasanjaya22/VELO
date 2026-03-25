<script lang="ts">
	import { goto } from '$app/navigation';
	import { fly, fade, scale } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { Icon } from 'svelte-icon';
	import searchIcon from '$lib/icons/search.svg?raw';
	import crownIcon from '$lib/icons/crown.svg?raw';
	import boltIcon from '$lib/icons/bolt.svg?raw';
	import layersIcon from '$lib/icons/layers.svg?raw';
	import type { TrendingData, Tool } from '$lib/types';

	let { data }: { data: { trending: TrendingData } } = $props();

	let query = $state('');
	let activeCategory = $state('All');
	let searchOpen = $state(false);
	let searchIndex = $state(0);
	let searchInput = $state<HTMLInputElement | null>(null);
	let votes = $state<Record<string, number>>({});
	let selectedToolId = $state<string | null>(null);

	const categories = $derived.by(() => {
		const values = new Set<string>();
		for (const tool of data.trending.products) values.add(tool.category ?? 'general');
		return ['All', ...Array.from(values).sort()];
	});

	const indexedTools = $derived.by(() =>
		data.trending.products.map((tool) => {
			const terms = [
				tool.name,
				tool.description,
				tool.category,
				tool.language,
				...(tool.useCases ?? []),
				...(tool.bestFor ?? []),
				...(tool.topics ?? []),
				tool.pricingModel,
				tool.affiliateAvailable ? 'affiliate' : '',
				tool.stars ? String(tool.stars) : '',
				tool.contributors ? String(tool.contributors) : ''
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();

			return { tool, terms };
		})
	);

	const recommendations = $derived.by(() => {
		const byScore = [...data.trending.products]
			.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
			.slice(0, 3);
		const byCategory = categories.slice(1, 4);
		return {
			top: byScore,
			categories: byCategory
		};
	});

	const filteredTools = $derived.by(() => {
		const q = query.trim().toLowerCase();
		return indexedTools
			.filter(({ tool, terms }) => {
				const categoryMatch =
					activeCategory === 'All' || (tool.category ?? 'general') === activeCategory;
				if (!categoryMatch) return false;
				if (!q) return true;
				return terms.includes(q);
			})
			.map(({ tool }) => tool);
	});

	const searchResults = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return recommendations.top;
		return indexedTools
			.filter(({ tool, terms }) => {
				const categoryMatch =
					activeCategory === 'All' || (tool.category ?? 'general') === activeCategory;
				if (!categoryMatch) return false;
				return terms.includes(q);
			})
			.map(({ tool }) => tool)
			.slice(0, 8);
	});

	const rankedTools = $derived.by(() =>
		[...filteredTools].sort((a, b) => {
			const aVote = votes[a.slug ?? a.name] ?? 0;
			const bVote = votes[b.slug ?? b.name] ?? 0;
			const aScore = (a.score ?? 0) + aVote;
			const bScore = (b.score ?? 0) + bVote;
			return bScore - aScore;
		})
	);

	const top1 = $derived.by(() => rankedTools[0]);
	const visibleTools = $derived.by(() => rankedTools.slice(0, 12));
	const monetizedCount = $derived.by(
		() => data.trending.products.filter((tool) => tool.affiliateAvailable).length
	);
	const selectedTool = $derived.by(
		() => rankedTools.find((tool) => (tool.slug ?? tool.name) === selectedToolId) ?? top1 ?? null
	);
	const selectedCategoryLabel = $derived.by(() =>
		activeCategory === 'All' ? 'All categories' : activeCategory
	);
	const resultCountLabel = $derived.by(() => `${filteredTools.length} tools`);
	const hasFilters = $derived.by(() => query.trim().length > 0 || activeCategory !== 'All');

	function scoreLabel(tool: Tool): string {
		const vote = votes[tool.slug ?? tool.name] ?? 0;
		return ((tool.score ?? 0) + vote).toFixed(1);
	}

	function vote(tool: Tool, delta: number) {
		const key = tool.slug ?? tool.name;
		votes = { ...votes, [key]: (votes[key] ?? 0) + delta };
	}

	function selectTool(tool: Tool) {
		selectedToolId = tool.slug ?? tool.name;
	}

	function clearFilters() {
		query = '';
		activeCategory = 'All';
	}

	function openSearch() {
		searchOpen = true;
		searchIndex = 0;
		queueMicrotask(() => searchInput?.focus());
	}

	function closeSearch() {
		searchOpen = false;
	}

	function goToResult(index: number) {
		const tool = searchResults[index];
		if (!tool) return;
		searchOpen = false;
		goto(`/tool/${encodeURIComponent(tool.slug ?? tool.name)}`);
	}

	onMount(() => {
		const onKeydown = (event: KeyboardEvent) => {
			const key = event.key.toLowerCase();
			const mod = event.metaKey || event.ctrlKey;
			if (mod && key === 'k') {
				event.preventDefault();
				openSearch();
				return;
			}
			if (!searchOpen) return;
			if (key === 'escape') {
				event.preventDefault();
				closeSearch();
				return;
			}
			if (key === 'arrowdown') {
				event.preventDefault();
				searchIndex = Math.min(searchIndex + 1, Math.max(searchResults.length - 1, 0));
				return;
			}
			if (key === 'arrowup') {
				event.preventDefault();
				searchIndex = Math.max(searchIndex - 1, 0);
				return;
			}
			if (key === 'enter') {
				event.preventDefault();
				goToResult(searchIndex);
			}
		};

		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	});
</script>

<svelte:head>
	<title>VELO — Curated AI Tools Directory</title>
	<meta
		name="description"
		content="VELO is a curated AI tools directory for fast discovery, ranking, and filtering. Find the best AI tools by category, use case, pricing, and score."
	/>
	<meta
		name="keywords"
		content="curated AI tools directory, AI tools directory, best AI tools, AI tools ranking, AI tools catalog, AI tools by category"
	/>
	<meta property="og:title" content="VELO — Curated AI Tools Directory" />
	<meta
		property="og:description"
		content="Curated AI tools directory for fast discovery, ranking, and filtering."
	/>
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<main class="w-full max-w-[1280px] mx-auto px-6 py-8 lg:py-12" in:fly={{ y: 12, duration: 350 }}>
	<section class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
		<div class="space-y-5">
			<div
				class="inline-flex items-center gap-3 border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_92%,var(--metal-100)_8%)] px-4 py-3 rounded-sm shadow-[0_1px_0_rgba(0,0,0,0.02)]"
			>
				<div
					class="size-10 border border-metal-900 bg-metal-900 text-surface rounded-sm flex items-center justify-center shadow-[4px_4px_0px_var(--accent)]"
				>
					<Icon data={layersIcon} size="18px" color="currentColor" />
				</div>
				<div>
					<p class="text-[10px] uppercase tracking-[0.3em] text-metal-500 font-mono">
						Curated AI Tools Directory
					</p>
					<p class="text-sm text-metal-500">Fast, sporty, ranked by signal</p>
				</div>
			</div>

			<header class="space-y-4">
				<p class="text-[10px] uppercase tracking-[0.45em] text-accent-dim font-mono font-bold">
					Ranked tools, no noise.
				</p>
				<h1
					class="max-w-4xl text-[clamp(2.5rem,5vw,5.5rem)] leading-[0.88] tracking-[-0.07em] text-metal-900 font-heading"
				>
					Tools worth opening,
					<span class="hero-highlight">ranked by signal</span>.
				</h1>
				<p class="max-w-2xl text-[1.02rem] lg:text-[1.15rem] text-metal-500 leading-relaxed">
					Scan GitHub trending tools by score, category, language, and use case. VELO keeps the
					list short, the ranking explicit, and the comparison fast.
				</p>
			</header>

			<div class="search-panel">
				<div class="search-shell">
					<div
						class="flex items-center gap-4 rounded-sm border border-metal-900 bg-surface px-5 py-4 transition-all shadow-[4px_4px_0px_var(--accent)] focus-within:shadow-[6px_6px_0px_var(--accent)] focus-within:border-metal-900"
					>
						<Icon data={searchIcon} size="20px" color="var(--metal-500)" />
						<input
							bind:value={query}
							class="w-full bg-transparent outline-none text-base lg:text-lg text-metal-900 placeholder:text-metal-500"
							placeholder="Search tools, topics, languages, or use cases"
							aria-label="Search AI tools"
						/>
						{#if query}
							<button
								class="clear-btn"
								type="button"
								onclick={clearFilters}
								aria-label="Clear search"
							>
								Clear
							</button>
						{/if}
					</div>
					<div
						class="mt-2 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono"
					>
						<span>{resultCountLabel}</span>
						<span>{selectedCategoryLabel}</span>
					</div>
					<div class="mt-3 flex items-center gap-2">
						<button
							type="button"
							class="rounded-sm border border-metal-900 bg-metal-900 px-3 py-2 text-xs font-mono uppercase tracking-[0.15em] text-surface transition-all hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_var(--accent)] cursor-pointer"
							onclick={openSearch}
						>
							Search
						</button>
						<p class="text-[10px] uppercase tracking-[0.18em] text-metal-500 font-mono">
							Cmd / Ctrl + K
						</p>
					</div>
				</div>
			</div>
		</div>

		<div class="space-y-4 self-start">
			<div
				class="summary-panel border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_92%,var(--metal-100)_8%)] rounded-sm p-5 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
			>
				<div class="flex items-center justify-between gap-3">
					<div>
						<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">
							Directory summary
						</p>
						<p class="mt-2 text-sm text-metal-500">
							One view for size, leader, and monetization signal.
						</p>
					</div>
					<Icon data={layersIcon} size="16px" color="var(--metal-500)" />
				</div>

				<div class="mt-4 grid gap-3">
					<div class="summary-row">
						<span class="summary-label">Directory size</span>
						<span class="summary-value">{data.trending.products.length}</span>
					</div>
					<div class="summary-row">
						<span class="summary-label">Top score</span>
						<span class="summary-value">{top1 ? scoreLabel(top1) : '—'}</span>
					</div>
					<div class="summary-row">
						<span class="summary-label">Affiliate tools</span>
						<span class="summary-value">{monetizedCount}</span>
					</div>
				</div>

				{#if top1}
				<a
					href={`/tool/${encodeURIComponent(top1.slug ?? top1.name)}`}
					class="mt-4 block rounded-sm border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] px-3 py-3 transition-all hover:border-metal-900"
				>
						<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">
							Current leader
						</p>
						<p class="mt-1 truncate text-sm font-heading text-metal-900">{top1.name}</p>
						<p class="mt-1 text-xs text-metal-500">Open the current top tool.</p>
					</a>
				{/if}
			</div>
		</div>
	</section>

	<section class="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
		<div class="space-y-6">
			<div class="flex items-center justify-between gap-4">
				<div>
					<h2 class="text-xs uppercase tracking-[0.3em] text-metal-500 font-mono">Fast results</h2>
					<p class="mt-2 text-sm text-metal-500">
						{filteredTools.length} tools matched. Tap a card for details.
					</p>
				</div>
				{#if hasFilters}
					<button
						type="button"
						class="rounded-sm border border-metal-100 bg-surface px-3 py-2 text-xs font-mono uppercase tracking-[0.15em] text-metal-500 transition-all hover:border-metal-900 hover:text-metal-900 cursor-pointer"
						onclick={clearFilters}
					>
						Reset
					</button>
				{/if}
			</div>

			{#if top1}
				<a
					href={`/tool/${encodeURIComponent(top1.slug ?? top1.name)}`}
					class="featured-card group border border-metal-900 bg-metal-900 text-surface rounded-sm p-6 lg:p-7 shadow-[8px_8px_0px_var(--accent)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[10px_10px_0px_var(--accent)]"
				>
					<div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
						<div class="space-y-4">
							<div class="inline-flex items-center gap-2 text-accent">
								<Icon data={crownIcon} size="16px" color="currentColor" />
								<p class="text-[10px] uppercase tracking-[0.25em] font-mono">Top 1</p>
							</div>
							<div>
								<h3 class="text-3xl lg:text-4xl font-heading text-surface">{top1.name}</h3>
								<p class="mt-3 max-w-2xl text-surface/80 leading-relaxed">
									Current leader by score. This is the anchor result for the page.
								</p>
							</div>
						</div>

						<div class="grid gap-3 shrink-0 sm:grid-cols-2 lg:grid-cols-1">
							<div class="metric-tile metric-score">
								<p class="metric-label">Score</p>
								<p class="metric-value">{scoreLabel(top1)}</p>
							</div>
							<div class="metric-tile">
								<p class="metric-label">Category</p>
								<p class="metric-value text-lg">{top1.category ?? 'general'}</p>
							</div>
						</div>
					</div>

					<div class="mt-5 flex flex-wrap gap-2">
						{#if top1.useCases?.length}
							<span class="badge-hero">{top1.useCases[0]}</span>
						{/if}
						{#if top1.bestFor?.length}
							<span class="badge-hero">{top1.bestFor[0]}</span>
						{/if}
						{#if top1.affiliateAvailable}
							<span class="badge-hero badge-hero-accent">affiliate</span>
						{/if}
					</div>
				</a>
			{/if}

			<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{#each visibleTools as tool, index}
					<div
						class="tool-card group border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] rounded-sm p-5 transition-all shadow-[0_1px_0_rgba(0,0,0,0.02)] hover:border-metal-700 hover:-translate-y-[1px] hover:shadow-[0_6px_18px_rgba(0,0,0,0.05)] active:translate-y-0 active:scale-[0.996] cursor-pointer"
						role="button"
						tabindex="0"
						onclick={() => selectTool(tool)}
						onkeydown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								selectTool(tool);
							}
						}}
						aria-label={`Select ${tool.name} for chart view`}
					>
						<div class="flex items-start justify-between gap-4">
							<div class="min-w-0 flex-1 space-y-3">
								<div class="flex items-start gap-3">
									<div class="tool-logo">
										{#if tool.logoUrl || tool.avatarUrl}
											<img
												src={tool.logoUrl ?? tool.avatarUrl}
												alt={`${tool.name} logo`}
												class="size-full object-cover"
												loading="lazy"
												decoding="async"
											/>
										{:else}
											<Icon data={layersIcon} size="14px" color="currentColor" />
										{/if}
									</div>

									<div class="min-w-0 space-y-1">
										<div class="flex items-center gap-2 text-metal-500">
											<p class="text-[10px] uppercase tracking-[0.2em] font-mono">Project</p>
											<span class="text-[10px] uppercase tracking-[0.2em] font-mono"
												>#{index + 1}</span
											>
										</div>
										<h3 class="truncate text-lg font-heading text-metal-900">{tool.name}</h3>
									</div>
								</div>

								<p class="line-clamp-2 text-sm leading-relaxed text-metal-500">
									{tool.description}
								</p>

								{#if tool.logoUrl || tool.avatarUrl}
									<div class="preview-strip">
										<img
											src={tool.logoUrl ?? tool.avatarUrl}
											alt={`${tool.name} preview`}
											class="h-full w-full object-cover"
											loading="lazy"
											decoding="async"
										/>
									</div>
								{/if}
							</div>

							<div class="flex shrink-0 flex-col items-end gap-2">
								<p class="text-2xl font-mono font-bold text-metal-900">{scoreLabel(tool)}</p>
								<div class="vote-stack">
									<button
										type="button"
										class="vote-btn"
										onclick={(event) => {
											event.preventDefault();
											event.stopPropagation();
											vote(tool, 1);
										}}
										aria-label={`Upvote ${tool.name}`}
									>
										▲
									</button>
									<button
										type="button"
										class="vote-btn"
										onclick={(event) => {
											event.preventDefault();
											event.stopPropagation();
											vote(tool, -1);
										}}
										aria-label={`Downvote ${tool.name}`}
									>
										▼
									</button>
								</div>
							</div>
						</div>

						<div class="mt-4 flex flex-wrap gap-2">
							<span class="badge-chip">{tool.category ?? 'general'}</span>
							{#if tool.pricingModel}
								<span class="badge-chip">{tool.pricingModel}</span>
							{:else}
								<span class="badge-chip badge-chip-muted">pricing not listed</span>
							{/if}
							{#if tool.bestFor?.length}
								<span class="badge-chip">{tool.bestFor[0]}</span>
							{:else if tool.useCases?.length}
								<span class="badge-chip">{tool.useCases[0]}</span>
							{/if}
						</div>

						<div
							class="mt-4 flex items-center justify-between border-t border-metal-100 pt-4 text-[10px] uppercase tracking-[0.18em] text-metal-500 font-mono"
						>
							<span>{tool.language ?? 'language not listed'}</span>
							<span>{tool.affiliateAvailable ? 'affiliate link' : 'direct link'}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<aside class="sticky top-24 space-y-4">
			<div
				class="border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_92%,var(--metal-100)_8%)] rounded-sm p-5 transition-all duration-200 hover:border-metal-700 hover:shadow-[0_6px_18px_rgba(0,0,0,0.05)]"
			>
				<div class="flex items-center justify-between">
					<h3 class="text-xs uppercase tracking-[0.25em] text-metal-500 font-mono">Categories</h3>
					<span class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">Filter</span
					>
				</div>
				<div class="mt-3 rounded-sm border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] px-3 py-2">
					<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">Active</p>
					<p class="mt-1 text-sm font-medium text-metal-900 capitalize">{selectedCategoryLabel}</p>
				</div>
				<div class="mt-4 grid gap-2">
					{#each categories as category, index}
						<button
							class="sidebar-chip text-left transition-all duration-200 hover:-translate-y-[1px] hover:border-metal-700 hover:shadow-[0_3px_10px_rgba(0,0,0,0.03)] cursor-pointer"
							class:sidebar-chip-active={activeCategory === category}
							onclick={() => (activeCategory = category)}
						>
							<span class="sidebar-chip-label">{category}</span>
							<span class="sidebar-chip-count"
								>{index === 0
									? filteredTools.length
									: data.trending.products.filter(
											(tool) => (tool.category ?? 'general') === category
										).length}</span
							>
						</button>
					{/each}
				</div>
				{#if hasFilters}
					<button
						type="button"
						class="mt-4 w-full rounded-sm border border-metal-100 bg-bg px-3 py-2 text-xs font-mono uppercase tracking-[0.15em] text-metal-500 transition-all hover:border-metal-900 hover:text-metal-900 cursor-pointer"
						onclick={clearFilters}
					>
						Reset filters
					</button>
				{/if}
			</div>

			{#if selectedTool}
				<div
					class="border border-metal-900 bg-surface rounded-sm p-5 shadow-[8px_8px_0px_var(--accent)]"
				>
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0">
							<p class="text-[10px] uppercase tracking-[0.25em] text-accent-dim font-mono">
								Selected repo
							</p>
							<h3 class="mt-2 truncate text-xl font-heading text-metal-900">{selectedTool.name}</h3>
							<p class="mt-2 text-sm text-metal-500 leading-relaxed">{selectedTool.description}</p>
						</div>
						<div class="shrink-0 text-right">
							<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">Score</p>
							<p class="mt-1 text-2xl font-mono font-bold text-metal-900">
								{scoreLabel(selectedTool)}
							</p>
						</div>
					</div>

					<div class="mt-4 grid gap-3">
						<div class="chart-row">
							<div class="chart-meta">
								<span>Stars</span>
								<span>{selectedTool.stars ? selectedTool.stars.toLocaleString() : '—'}</span>
							</div>
							<div class="chart-track">
								<div
									class="chart-fill"
									style={`width: ${Math.min(100, ((selectedTool.stars ?? 0) / 50000) * 100)}%`}
								></div>
							</div>
						</div>
						<div class="chart-row">
							<div class="chart-meta">
								<span>Weekly growth</span>
								<span
									>{selectedTool.starsGrowth
										? `+${selectedTool.starsGrowth.toLocaleString()}`
										: '—'}</span
								>
							</div>
							<div class="chart-track">
								<div
									class="chart-fill"
									style={`width: ${Math.min(100, ((selectedTool.starsGrowth ?? 0) / 5000) * 100)}%`}
								></div>
							</div>
						</div>
						<div class="chart-row">
							<div class="chart-meta">
								<span>Forks</span>
								<span>{selectedTool.forks ? selectedTool.forks.toLocaleString() : '—'}</span>
							</div>
							<div class="chart-track">
								<div
									class="chart-fill"
									style={`width: ${Math.min(100, ((selectedTool.forks ?? 0) / 20000) * 100)}%`}
								></div>
							</div>
						</div>
						<div class="chart-row">
							<div class="chart-meta">
								<span>Contributors</span>
								<span>{selectedTool.contributors ?? '—'}</span>
							</div>
							<div class="chart-track">
								<div
									class="chart-fill"
									style={`width: ${Math.min(100, ((selectedTool.contributors ?? 0) / 100) * 100)}%`}
								></div>
							</div>
						</div>
					</div>

					<div class="mt-4 flex flex-wrap gap-2">
						<span class="badge-chip">{selectedTool.category ?? 'general'}</span>
						<span class="badge-chip">{selectedTool.language ?? 'language not listed'}</span>
						{#if selectedTool.affiliateAvailable}
							<span class="badge-chip badge-chip-muted">affiliate</span>
						{/if}
					</div>

					<a
						href={`/tool/${encodeURIComponent(selectedTool.slug ?? selectedTool.name)}`}
						class="mt-4 inline-flex items-center justify-center rounded-sm border border-metal-900 bg-metal-900 px-3 py-2 text-xs font-mono uppercase tracking-[0.15em] text-surface transition-all hover:-translate-y-[1px] hover:shadow-[2px_2px_0px_var(--accent)]"
					>
						Open repo page
					</a>
				</div>
			{/if}
		</aside>
	</section>
</main>

{#if searchOpen}
	<button
		type="button"
			class="fixed inset-0 z-[60] bg-metal-900/42 backdrop-blur-[2px]"
		aria-label="Close search"
		transition:fade={{ duration: 120 }}
		onclick={closeSearch}
	></button>
	<div class="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
		<div
			class="w-full max-w-2xl overflow-hidden rounded-sm border border-metal-900 bg-surface shadow-[10px_10px_0px_var(--accent)]"
			transition:scale={{ duration: 120, start: 0.98 }}
		>
			<div
				class="border-b border-metal-100 bg-[color-mix(in_srgb,var(--surface)_96%,var(--metal-100)_4%)] p-4"
			>
				<div
					class="flex items-center gap-3 rounded-sm border border-metal-100 bg-surface px-4 py-3 focus-within:border-metal-900"
				>
					<Icon data={searchIcon} size="18px" color="var(--metal-500)" />
					<input
						bind:this={searchInput}
						bind:value={query}
						class="w-full bg-transparent outline-none text-base text-metal-900 placeholder:text-metal-500"
						placeholder="Search tools, categories, use cases..."
						aria-label="Search AI tools"
					/>
					<button
						type="button"
						class="text-[10px] uppercase tracking-[0.18em] text-metal-500 font-mono"
						onclick={closeSearch}
					>
						Esc
					</button>
				</div>
				<div
					class="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono"
				>
					<span>{searchResults.length} results</span>
					<span>Use arrows + Enter</span>
				</div>
			</div>

			<div class="grid gap-4 p-4 lg:grid-cols-[1fr_220px]">
				<div class="space-y-2">
					{#each searchResults as tool, index}
						<button
							type="button"
							class="search-result w-full rounded-sm border px-4 py-3 text-left transition-all cursor-pointer"
							class:search-result-active={index === searchIndex}
							onclick={() => goToResult(index)}
							onmouseenter={() => (searchIndex = index)}
						>
							<div class="flex items-start justify-between gap-4">
								<div class="min-w-0">
									<div class="flex items-center gap-2 text-metal-500">
										<Icon
											data={index === 0 ? crownIcon : boltIcon}
											size="12px"
											color="currentColor"
										/>
										<p class="text-[10px] uppercase tracking-[0.2em] font-mono">#{index + 1}</p>
										<span class="text-[10px] uppercase tracking-[0.2em] font-mono">
											{tool.category ?? 'general'}
										</span>
									</div>
									<h3 class="mt-1 truncate text-base font-heading text-metal-900">{tool.name}</h3>
									<p class="mt-1 line-clamp-1 text-sm text-metal-500">{tool.description}</p>
								</div>
								<p class="shrink-0 text-lg font-mono font-bold text-metal-900">
									{scoreLabel(tool)}
								</p>
							</div>
						</button>
					{/each}
				</div>

				<div class="space-y-3">
					<div class="rounded-sm border border-metal-100 bg-bg p-4">
						<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">
							Recommended
						</p>
						<div class="mt-3 grid gap-2">
							{#each recommendations.top as tool}
								<a
									href={`/tool/${encodeURIComponent(tool.slug ?? tool.name)}`}
									class="rounded-sm border border-metal-100 bg-surface px-3 py-2 text-sm text-metal-700 transition-all hover:border-metal-900 hover:text-metal-900"
								>
									<div class="flex items-center justify-between gap-3">
										<span class="truncate">{tool.name}</span>
										<span class="font-mono text-[10px] text-metal-500">{scoreLabel(tool)}</span>
									</div>
								</a>
							{/each}
						</div>
					</div>

					<div class="rounded-sm border border-metal-100 bg-bg p-4">
						<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">
							Categories
						</p>
						<div class="mt-3 flex flex-wrap gap-2">
							{#each recommendations.categories as category}
								<button
									type="button"
									class="badge-chip cursor-pointer transition-all hover:border-metal-900 hover:text-metal-900"
									onclick={() => {
										activeCategory = category;
										searchOpen = false;
									}}
								>
									{category}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

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

	.badge-chip-muted {
		border-color: color-mix(in srgb, var(--metal-300) 35%, var(--metal-100));
		background: color-mix(in srgb, var(--surface) 94%, var(--metal-100));
		color: var(--metal-500);
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

	.hero-highlight {
		display: inline-block;
		color: var(--metal-900);
		background: linear-gradient(
			180deg,
			transparent 64%,
			color-mix(in srgb, var(--accent) 24%, transparent) 64%
		);
		padding: 0 0.08em;
		text-shadow: 0 1px 0 rgba(255, 255, 255, 0.28);
	}

	.search-shell {
		min-width: 0;
	}

	.search-panel {
		max-width: 56rem;
	}

	.summary-panel {
		max-width: 20rem;
	}

	.summary-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.7rem 0;
		border-bottom: 1px solid var(--metal-100);
	}

	.summary-row:last-child {
		border-bottom: 0;
		padding-bottom: 0;
	}

	.summary-label {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		font-family: var(--font-mono);
		color: var(--metal-500);
	}

	.summary-value {
		font-size: 1rem;
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--metal-900);
	}

	.clear-btn {
		border: 1px solid var(--metal-100);
		background: var(--bg);
		color: var(--metal-500);
		padding: 0.35rem 0.55rem;
		border-radius: 0.125rem;
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-family: var(--font-mono);
		transition: all 180ms ease;
	}

	.clear-btn:hover {
		border-color: var(--metal-900);
		color: var(--metal-900);
	}

	.featured-card,
	.tool-card {
		will-change: transform;
	}

	.metric-tile {
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.04);
		border-radius: 0.125rem;
		padding: 0.85rem 0.9rem;
	}

	.metric-score {
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--accent) 42%, var(--surface)),
				color-mix(in srgb, var(--accent) 22%, var(--surface))
			),
			var(--surface);
		border-color: color-mix(in srgb, var(--accent) 48%, rgba(255, 255, 255, 0.12));
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 12%, transparent);
	}

	.metric-score .metric-label {
		color: var(--metal-700);
	}

	.metric-score .metric-value {
		color: var(--metal-900);
		font-size: 2.25rem;
		line-height: 0.95;
		letter-spacing: -0.05em;
	}

	.metric-label {
		font-size: 0.62rem;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		font-family: var(--font-mono);
		color: rgba(255, 255, 255, 0.6);
	}

	.metric-value {
		margin-top: 0.35rem;
		font-size: 1rem;
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--surface);
	}

	.tool-logo {
		width: 2.25rem;
		height: 2.25rem;
		border: 1px solid var(--metal-100);
		background: var(--bg);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		border-radius: 0.125rem;
		overflow: hidden;
	}

	.preview-strip {
		margin-top: 0.75rem;
		height: 3.5rem;
		border: 1px solid var(--metal-100);
		background: color-mix(in srgb, var(--surface) 92%, var(--accent) 8%);
		border-radius: 0.125rem;
		overflow: hidden;
	}

	.vote-stack {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.vote-btn {
		width: 1.9rem;
		height: 1.9rem;
		border: 1px solid var(--metal-100);
		background: var(--bg);
		color: var(--metal-500);
		border-radius: 0.125rem;
		font-size: 0.65rem;
		line-height: 1;
		transition: all 160ms ease;
		cursor: pointer;
	}

	.vote-btn:hover {
		border-color: var(--metal-900);
		color: var(--metal-900);
		transform: translateY(-1px);
	}

	.sidebar-chip {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		border: 1px solid var(--metal-100);
		background: color-mix(in srgb, var(--surface) 92%, var(--metal-100) 8%);
		color: var(--metal-500);
		padding: 0.72rem 0.85rem;
		border-radius: 0.125rem;
	}

	.sidebar-chip-active {
		border-color: var(--metal-700);
		background: color-mix(in srgb, var(--accent) 8%, var(--surface));
		color: var(--metal-900);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent);
	}

	.sidebar-chip-label {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-family: var(--font-mono);
	}

	.sidebar-chip-count {
		font-size: 0.7rem;
		font-family: var(--font-mono);
		color: var(--metal-300);
	}

	.sidebar-chip-active .sidebar-chip-count {
		color: var(--metal-700);
	}

	.chart-row {
		display: grid;
		gap: 0.45rem;
	}

	.tool-card + .tool-card {
		margin-top: 0;
	}

	.chart-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		font-family: var(--font-mono);
		color: var(--metal-500);
	}

	.chart-track {
		height: 0.6rem;
		border: 1px solid var(--metal-100);
		background: var(--bg);
		border-radius: 0.125rem;
		overflow: hidden;
	}

	.chart-fill {
		height: 100%;
		background: linear-gradient(
			90deg,
			var(--accent),
			color-mix(in srgb, var(--accent) 55%, var(--metal-900))
		);
	}
</style>
