<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { Icon } from 'svelte-icon';
	import searchIcon from '$lib/icons/search.svg?raw';
	import layersIcon from '$lib/icons/layers.svg?raw';
	import type { Tool } from '$lib/types';
	import {
		clearSavedTools,
		getSavedToolKey,
		loadSavedTools,
		removeTool,
		type SavedTool
	} from '$lib/utils/saved-tools';

	let savedTools = $state<SavedTool[]>([]);
	let query = $state('');
	let activeCategory = $state('All');
	let mounted = $state(false);

	const categories = $derived.by(() => {
		const values = new Set<string>();
		for (const tool of savedTools) values.add(tool.category ?? 'general');
		return ['All', ...Array.from(values).sort()];
	});

	const normalizedQuery = $derived.by(() => query.trim().toLowerCase());
	const savedCount = $derived.by(() => savedTools.length);
	const hasFilters = $derived.by(() => query.trim().length > 0 || activeCategory !== 'All');

	const filteredTools = $derived.by(() =>
		[...savedTools]
			.sort((a, b) => new Date(b.savedAt ?? 0).getTime() - new Date(a.savedAt ?? 0).getTime())
			.filter((tool) => {
				const category = tool.category ?? 'general';
				if (activeCategory !== 'All' && category !== activeCategory) return false;
				if (!normalizedQuery) return true;

				const terms = [
					tool.name,
					tool.description,
					tool.category,
					tool.language,
					...(tool.useCases ?? []),
					...(tool.bestFor ?? []),
					...(tool.topics ?? [])
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase();

				return terms.includes(normalizedQuery);
			})
	);

	function loadArchive() {
		savedTools = loadSavedTools();
		if (
			activeCategory !== 'All' &&
			!savedTools.some((tool) => (tool.category ?? 'general') === activeCategory)
		) {
			activeCategory = 'All';
		}
	}

	function deleteSavedTool(tool: Pick<Tool, 'slug' | 'name'>) {
		savedTools = removeTool(tool);
	}

	function clearArchive() {
		clearSavedTools();
		savedTools = [];
		query = '';
		activeCategory = 'All';
	}

	function formatScore(score?: number): string {
		return typeof score === 'number' ? score.toFixed(1) : '—';
	}

	onMount(() => {
		mounted = true;
		loadArchive();

		const onStorage = (event: StorageEvent) => {
			if (event.key && event.key !== 'velo.saved-tools.v1') return;
			loadArchive();
		};

		window.addEventListener('storage', onStorage);
		return () => window.removeEventListener('storage', onStorage);
	});
</script>

<svelte:head>
	<title>Archive — VELO</title>
	<meta name="description" content="Saved AI tools archive with search and category filters." />
	<meta property="og:title" content="Archive — VELO" />
	<meta property="og:description" content="Saved AI tools archive with search and category filters." />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://velo-428.pages.dev/og-image.svg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Archive — VELO" />
	<meta name="twitter:description" content="Saved AI tools archive with search and category filters." />
	<meta name="twitter:image" content="https://velo-428.pages.dev/og-image.svg" />
</svelte:head>

<main class="w-full max-w-[1280px] mx-auto px-6 py-10 lg:py-12" in:fly={{ y: 16, duration: 320 }}>
	<section class="space-y-6">
		<header class="space-y-3">
			<div class="inline-flex items-center gap-3">
				<div
				class="size-9 border border-metal-900 bg-metal-100 text-metal-900 rounded-sm flex items-center justify-center"
				>
					<Icon data={layersIcon} size="16px" color="currentColor" />
				</div>
				<div>
					<p class="text-[10px] uppercase tracking-[0.3em] text-metal-500 font-mono">Saved tools</p>
					<h1
						class="text-[clamp(2rem,4vw,3rem)] leading-[0.95] tracking-[-0.06em] text-metal-900 font-heading"
					>
						Archive
					</h1>
				</div>
			</div>
			<p class="max-w-2xl text-sm lg:text-base text-metal-500 leading-relaxed">
				Search and filter saved tools in this browser.
			</p>
			<p class="text-[10px] uppercase tracking-[0.22em] text-metal-500 font-mono">
				{savedCount} saved
			</p>
		</header>

		<div class="border border-metal-100 bg-surface rounded-sm p-3 lg:p-4">
			<div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
				<div
					class="flex items-center gap-3 rounded-sm border border-metal-100 bg-bg px-4 py-3 focus-within:border-metal-900"
				>
					<Icon data={searchIcon} size="18px" color="var(--metal-500)" />
					<input
						bind:value={query}
						class="w-full bg-transparent outline-none text-sm lg:text-base text-metal-900 placeholder:text-metal-500"
						placeholder="Search saved tools"
						aria-label="Search saved tools"
					/>
					{#if query}
						<button type="button" class="action-link" onclick={() => (query = '')}>Clear</button>
					{/if}
				</div>

				<div class="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
					{#each categories as category}
						<button
							type="button"
							class="category-chip whitespace-nowrap"
							class:category-chip-active={activeCategory === category}
							onclick={() => (activeCategory = category)}
						>
							{category}
						</button>
					{/each}
				</div>
			</div>

			<div class="mt-3 flex items-center justify-between gap-3">
				<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">
					{filteredTools.length} visible
				</p>
				<div class="flex items-center gap-2">
					<button
						type="button"
						class="action-link"
						onclick={() => {
							query = '';
							activeCategory = 'All';
						}}
						disabled={!hasFilters}
					>
						Reset
					</button>
					<button
						type="button"
						class="action-link action-link-danger"
						onclick={clearArchive}
						disabled={!savedCount}
					>
						Clear
					</button>
				</div>
			</div>
		</div>
	</section>

	<section class="mt-8">
		{#if mounted && savedTools.length === 0}
			<div class="border border-metal-100 bg-surface rounded-sm p-8 lg:p-10">
				<p class="text-[10px] uppercase tracking-[0.3em] text-metal-500 font-mono">Empty archive</p>
				<h2 class="mt-3 text-3xl font-heading tracking-[-0.05em] text-metal-900">
					No saved tools yet.
				</h2>
				<p class="mt-3 max-w-2xl text-metal-500 leading-relaxed">
					Save a tool from the main feed to see it here.
				</p>
			</div>
		{:else if mounted && filteredTools.length === 0}
			<div class="border border-metal-100 bg-surface rounded-sm p-8 lg:p-10">
				<p class="text-[10px] uppercase tracking-[0.3em] text-metal-500 font-mono">No matches</p>
				<h2 class="mt-3 text-3xl font-heading tracking-[-0.05em] text-metal-900">
					Nothing matches this filter.
				</h2>
				<p class="mt-3 max-w-2xl text-metal-500 leading-relaxed">
					Try a broader search or switch back to All categories.
				</p>
			</div>
		{:else}
			<div class="grid gap-3">
				{#each filteredTools as tool, index (getSavedToolKey(tool))}
					<article
						class="border border-metal-100 bg-surface rounded-sm p-5 transition-all hover:border-metal-900 hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)]"
						in:fly={{ y: 10, delay: index * 18, duration: 220 }}
					>
						<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
							<div class="min-w-0 space-y-2">
								<div class="flex flex-wrap items-center gap-2">
									<span class="tag tag-accent">Saved</span>
									{#if tool.category}
										<span class="tag">{tool.category}</span>
									{/if}
									{#if tool.score}
										<span class="tag">score {formatScore(tool.score)}</span>
									{/if}
								</div>
								<h3
									class="truncate text-xl lg:text-2xl font-heading tracking-[-0.04em] text-metal-900"
								>
									{tool.name}
								</h3>
								<p class="max-w-3xl text-sm lg:text-[0.95rem] text-metal-500 leading-relaxed">
									{tool.description || 'No description provided.'}
								</p>
								<p class="text-[10px] uppercase tracking-[0.18em] text-metal-500 font-mono">
									Saved {new Date(tool.savedAt).toLocaleDateString()}
								</p>
							</div>

							<div class="flex shrink-0 gap-3">
								<a href={`/tool/${encodeURIComponent(tool.slug ?? tool.name)}`} class="action-link">
									Open
								</a>
								<button
									type="button"
									class="action-link action-link-danger"
									onclick={() => deleteSavedTool(tool)}
								>
									Remove
								</button>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</section>
</main>

<style>
	.action-link {
		border: 1px solid var(--metal-100);
		background: var(--bg);
		color: var(--metal-500);
		padding: 0.45rem 0.7rem;
		border-radius: 0.125rem;
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		font-family: var(--font-mono);
		transition: all 180ms ease;
	}

	.action-link:hover {
		border-color: var(--metal-900);
		color: var(--metal-900);
		transform: translateY(-1px);
	}

	.action-link:disabled {
		opacity: 0.45;
		cursor: not-allowed;
		transform: none;
	}

	.action-link-danger {
		color: var(--metal-700);
	}

	.category-chip {
		border: 1px solid var(--metal-100);
		background: var(--bg);
		color: var(--metal-500);
		padding: 0.45rem 0.7rem;
		border-radius: 0.125rem;
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		font-family: var(--font-mono);
		transition: all 180ms ease;
	}

	.category-chip:hover {
		border-color: var(--metal-900);
		color: var(--metal-900);
		transform: translateY(-1px);
	}

	.category-chip-active {
		border-color: var(--metal-900);
		color: var(--metal-900);
		background: color-mix(in srgb, var(--accent) 8%, var(--surface));
	}

	.tag {
		border: 1px solid var(--metal-100);
		background: var(--bg);
		color: var(--metal-500);
		padding: 0.3rem 0.55rem;
		border-radius: 0.125rem;
		font-size: 0.62rem;
		line-height: 1;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		font-family: var(--font-mono);
	}

	.tag-accent {
		border-color: color-mix(in srgb, var(--accent) 35%, var(--metal-100));
		color: var(--accent-dim);
	}
</style>
