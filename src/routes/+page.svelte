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
	import { getSavedToolKey, loadSavedTools, toggleTool } from '$lib/utils/saved-tools';
	import { toasts } from '$lib/utils/toast';

	let { data }: { data: { trending: TrendingData } } = $props();

	let query = $state('');
	let activeCategory = $state('All');
	let searchOpen = $state(false);
	let searchIndex = $state(0);
	let searchInput = $state<HTMLInputElement | null>(null);
	let votes = $state<Record<string, number>>({});
	let selectedToolId = $state<string | null>(null);
	let voteStates = $state<Record<string, 'up' | 'down' | null>>({});
	let bookmarkStates = $state<Record<string, boolean>>({});

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
	const selectedToolKey = $derived.by(() => selectedTool?.slug ?? selectedTool?.name ?? null);
	const selectedCategoryLabel = $derived.by(() =>
		activeCategory === 'All' ? 'All categories' : activeCategory
	);
	const resultCountLabel = $derived.by(() => `${filteredTools.length} tools`);
	const hasFilters = $derived.by(() => query.trim().length > 0 || activeCategory !== 'All');
	const categoryCounts = $derived.by(() => {
		const counts = new Map<string, number>();
		counts.set('All', data.trending.products.length);

		for (const tool of data.trending.products) {
			const category = tool.category ?? 'general';
			counts.set(category, (counts.get(category) ?? 0) + 1);
		}

		return counts;
	});
	const schema = $derived.by(() => {
		const topItems = [...data.trending.products]
			.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
			.slice(0, 10);

		return {
			'@context': 'https://schema.org',
			'@graph': [
				{
					'@type': 'WebSite',
					'@id': 'https://velo-428.pages.dev/#website',
					url: 'https://velo-428.pages.dev/',
					name: 'VELO',
					description: 'Curated AI tools directory for fast discovery, ranking, and filtering.',
					inLanguage: 'en',
					potentialAction: {
						'@type': 'SearchAction',
						target: 'https://velo-428.pages.dev/?q={search_term_string}',
						'query-input': 'required name=search_term_string'
					}
				},
				{
					'@type': 'Organization',
					'@id': 'https://velo-428.pages.dev/#organization',
					name: 'VELO',
					url: 'https://velo-428.pages.dev/',
					logo: 'https://velo-428.pages.dev/favicon.svg'
				},
				{
					'@type': 'CollectionPage',
					'@id': 'https://velo-428.pages.dev/#webpage',
					url: 'https://velo-428.pages.dev/',
					name: 'VELO — Curated AI Tools Directory',
					description: 'Curated AI tools directory for fast discovery, ranking, and filtering.',
					isPartOf: {
						'@id': 'https://velo-428.pages.dev/#website'
					},
					about: {
						'@id': 'https://velo-428.pages.dev/#organization'
					}
				},
				{
					'@type': 'ItemList',
					name: 'Top ranked AI tools',
					itemListOrder: 'https://schema.org/ItemListOrderDescending',
					numberOfItems: topItems.length,
					itemListElement: topItems.map((tool, index) => ({
						'@type': 'ListItem',
						position: index + 1,
						url: `https://velo-428.pages.dev/tool/${encodeURIComponent(tool.slug ?? tool.name)}`,
						name: tool.name
					}))
				}
			]
		};
	});

	const featuredApplications = [
		{
			href: 'https://xenkio.com',
			label: 'Xenkio',
			subtitle: 'Featured application',
			icon: '/logos/xenkio.svg'
		},
		{
			href: 'https://typecade.com',
			label: 'Typecade',
			subtitle: 'Featured application',
			icon: '/logos/typecade.png'
		}
	];

	const anyworkBanner = {
		href: 'https://anywork.dev',
		label: 'anywork.dev',
		subtitle: 'B2B project',
		icon: '/logos/anywork.svg'
	};

	function scoreLabel(tool: Tool): string {
		const vote = votes[tool.slug ?? tool.name] ?? 0;
		return ((tool.score ?? 0) + vote).toFixed(1);
	}

	function vote(tool: Tool, delta: number) {
		const key = tool.slug ?? tool.name;
		const currentState = voteStates[key];
		if (delta === 1) {
			if (currentState === 'up') {
				voteStates = { ...voteStates, [key]: null };
				votes = { ...votes, [key]: (votes[key] ?? 0) - 1 };
			} else {
				voteStates = { ...voteStates, [key]: 'up' };
				votes = { ...votes, [key]: (votes[key] ?? 0) + (currentState === 'down' ? 2 : 1) };
			}
		} else {
			if (currentState === 'down') {
				voteStates = { ...voteStates, [key]: null };
				votes = { ...votes, [key]: (votes[key] ?? 0) + 1 };
			} else {
				voteStates = { ...voteStates, [key]: 'down' };
				votes = { ...votes, [key]: (votes[key] ?? 0) + (currentState === 'up' ? -2 : -1) };
			}
		}
	}

	function toggleBookmark(e: MouseEvent, tool: Tool) {
		e.preventDefault();
		e.stopPropagation();
		const key = tool.slug ?? tool.name;
		const isCurrentlyBookmarked = bookmarkStates[key] ?? false;

		toggleTool(tool);
		bookmarkStates = { ...bookmarkStates, [key]: !isCurrentlyBookmarked };

		if (!isCurrentlyBookmarked) {
			toasts.add('Saved to archive');
			setTimeout(() => {
				goto('/archive');
			}, 200);
		} else {
			toasts.add('Removed from archive');
		}
	}

	function syncBookmarkStates() {
		const saved = loadSavedTools();
		const newStates: Record<string, boolean> = {};
		for (const tool of data.trending.products) {
			const key = tool.slug ?? tool.name;
			newStates[key] = saved.some((t) => (t.slug ?? t.name) === key);
		}
		bookmarkStates = newStates;
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
		syncBookmarkStates();

		const onStorage = () => {
			syncBookmarkStates();
		};
		window.addEventListener('storage', onStorage);

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
		return () => {
			window.removeEventListener('keydown', onKeydown);
			window.removeEventListener('storage', onStorage);
		};
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
	<meta property="og:url" content="https://velo-428.pages.dev/" />
	<meta property="og:image" content="https://velo-428.pages.dev/og-image.svg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="VELO — Curated AI Tools Directory" />
	<meta
		name="twitter:description"
		content="Curated AI tools directory for fast discovery, ranking, and filtering."
	/>
	<meta name="twitter:image" content="https://velo-428.pages.dev/og-image.svg" />
	{@html `<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>`}
</svelte:head>

<main
	class="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12"
	in:fly={{ y: 12, duration: 350 }}
>
	<section class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
		<div class="space-y-5">
			<div
				class="inline-flex items-center gap-3 border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_92%,var(--metal-100)_8%)] px-4 py-3 rounded-sm shadow-[0_1px_0_rgba(0,0,0,0.02)]"
			>
				<div
					class="size-10 border border-metal-900 bg-metal-100 text-metal-900 rounded-sm flex items-center justify-center shadow-[4px_4px_0px_var(--accent)]"
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
					Scan GitHub trending tools by score, category, language, and use case. VELO keeps the list
					short, the ranking explicit, and the comparison fast.
				</p>
			</header>

			<div class="search-panel w-full">
				<div class="search-shell">
					<div
						class="flex flex-col gap-3 rounded-sm border border-metal-900 bg-surface px-4 py-4 transition-all shadow-[4px_4px_0px_var(--accent-dim)] focus-within:shadow-[6px_6px_0px_var(--accent-dim)] focus-within:border-metal-900 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
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
					<div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
						<button
							type="button"
							class="w-full rounded-sm border border-metal-900 bg-metal-100 px-3 py-2 text-xs font-mono uppercase tracking-[0.15em] text-metal-900 transition-all hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_var(--accent)] cursor-pointer sm:w-auto"
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
				class="summary-panel w-full max-w-none border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_92%,var(--metal-100)_8%)] rounded-sm p-5 shadow-[0_1px_0_rgba(0,0,0,0.02)] xl:max-w-[20rem]"
			>
				<div class="flex items-center justify-between gap-3">
					<div>
						<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">
							Directory snapshot
						</p>
					</div>
					<Icon data={layersIcon} size="16px" color="var(--metal-500)" />
				</div>

				<div class="mt-4 space-y-3">
					<div class="summary-meta">
						<span class="summary-meta-label">Source</span>
						<span class="summary-meta-value">GitHub Trending</span>
					</div>
					<div class="summary-meta">
						<span class="summary-meta-label">Frequency</span>
						<span class="summary-meta-value">Weekly</span>
					</div>
					<div class="summary-meta">
						<span class="summary-meta-label">Tools indexed</span>
						<span class="summary-meta-value">{data.trending.products.length}</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
		<div class="min-w-0 space-y-6">
			<a
				href={anyworkBanner.href}
				target="_blank"
				rel="noopener noreferrer"
				class="block overflow-hidden border border-metal-900 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface)_86%,var(--accent-dim)_14%),color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%))] rounded-sm p-4 sm:p-5 transition-all hover:-translate-y-[1px] hover:shadow-[6px_6px_0px_var(--accent-dim)]"
			>
				<div class="flex min-w-0 items-center gap-3 sm:gap-4">
					<div
						class="size-11 sm:size-12 shrink-0 border border-metal-100 bg-[color-mix(in_srgb,var(--accent-dim)_14%,var(--surface))] flex items-center justify-center rounded-sm overflow-hidden"
					>
						<img
							src={anyworkBanner.icon}
							alt={anyworkBanner.label}
							class="w-7 h-7 object-contain"
							loading="lazy"
							referrerpolicy="no-referrer"
						/>
					</div>
					<div class="min-w-0 flex-1">
						<p class="text-[10px] uppercase tracking-[0.3em] text-metal-700 font-mono font-bold">
							{anyworkBanner.subtitle}
						</p>
						<div class="mt-2 flex min-w-0 items-center gap-2 sm:gap-3">
							<h2
								class="anywork-title min-w-0 text-lg sm:text-xl lg:text-2xl font-heading text-metal-900"
							>
								{anyworkBanner.label}
							</h2>
							<span class="anywork-chip shrink-0">B2B</span>
						</div>
					</div>
					<div class="shrink-0 hidden sm:flex items-center justify-center">
						<div
							class="size-9 border border-metal-100 bg-surface rounded-sm flex items-center justify-center"
						>
							<img
								src="/logos/anywork.svg"
								alt="anywork.dev"
								class="w-5 h-5 object-contain"
								loading="lazy"
							/>
						</div>
					</div>
				</div>
			</a>

			<div class="flex items-center justify-between gap-4">
				<div>
					<h2 class="text-xs uppercase tracking-[0.3em] text-metal-500 font-mono">Fast results</h2>
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
					class="featured-card group overflow-hidden border border-metal-900 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--surface)_84%,var(--accent-dim)_16%),color-mix(in_srgb,var(--surface)_96%,var(--metal-100)_4%))] text-metal-900 rounded-sm p-4 lg:p-5 shadow-[8px_8px_0px_var(--accent-dim)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[10px_10px_0px_var(--accent-dim)]"
				>
					<div class="top1-shell">
						<div class="top1-brand">
							<div
								class="top1-logo size-14 sm:size-16 border border-metal-100 bg-surface flex items-center justify-center rounded-sm overflow-hidden shrink-0"
							>
								{#if top1.logoUrl || top1.avatarUrl}
									<img
										src={top1.logoUrl ?? top1.avatarUrl}
										alt={`${top1.name} logo`}
										class="size-full object-cover"
										loading="lazy"
										decoding="async"
									/>
								{:else}
									<Icon data={crownIcon} size="18px" color="currentColor" />
								{/if}
							</div>

							<div class="min-w-0 flex-1">
								<div class="top1-ribbon">
									<Icon data={crownIcon} size="14px" color="currentColor" />
									<span>Top 1</span>
								</div>
								<h3
									class="top1-name min-w-0 text-[clamp(1.15rem,5vw,2.1rem)] leading-[0.95] font-heading text-metal-900"
								>
									{top1.name}
								</h3>
								<div class="mt-3 flex min-w-0 flex-wrap gap-2">
									<span class="badge-hero">{top1.category ?? 'general'}</span>
									{#if top1.bestFor?.length}
										<span class="badge-hero">{top1.bestFor[0]}</span>
									{/if}
									{#if top1.affiliateAvailable}
										<span class="badge-hero badge-hero-accent">affiliate</span>
									{/if}
								</div>
							</div>
						</div>

						<div class="top1-score">
							<p class="text-[10px] uppercase tracking-[0.2em] text-metal-700 font-mono">Score</p>
							<p
								class="mt-1 text-[clamp(1.8rem,8vw,3.5rem)] sm:text-[clamp(2.3rem,4vw,3.5rem)] font-mono font-bold text-metal-900 leading-none"
							>
								{scoreLabel(top1)}
							</p>
						</div>
					</div>
				</a>
			{/if}

			<div class="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
				{#each visibleTools as tool, index}
					{@const toolKey = tool.slug ?? tool.name}
					<div
						class="tool-card group border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] rounded-sm p-3 sm:p-4 transition-all shadow-[0_1px_0_rgba(0,0,0,0.02)] hover:border-metal-700 hover:-translate-y-[1px] hover:shadow-[0_6px_18px_rgba(0,0,0,0.05)] active:translate-y-0 active:scale-[0.996] cursor-pointer"
						class:tool-card-selected={selectedToolKey === toolKey}
						role="button"
						tabindex="0"
						onclick={() => selectTool(tool)}
						data-selected={selectedToolKey === toolKey}
						onkeydown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								event.preventDefault();
								selectTool(tool);
							}
						}}
						aria-label={`Select ${tool.name} for chart view`}
					>
						<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div class="min-w-0 flex-1 space-y-2">
								<div class="flex items-start gap-2.5">
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
											<p class="text-[9px] uppercase tracking-[0.18em] font-mono">Project</p>
											<span class="text-[10px] uppercase tracking-[0.2em] font-mono"
												>#{index + 1}</span
											>
										</div>
										<h3 class="truncate text-[0.95rem] sm:text-lg font-heading text-metal-900">
											{tool.name}
										</h3>
									</div>
								</div>

								<p
									class="line-clamp-2 text-[0.8rem] sm:text-sm leading-snug sm:leading-relaxed text-metal-500"
								>
									{tool.description}
								</p>
							</div>

							<div
								class="flex shrink-0 flex-row items-start justify-between gap-3 sm:flex-col sm:items-end sm:gap-1"
							>
								<p class="text-xl sm:text-2xl font-mono font-bold text-metal-900">
									{scoreLabel(tool)}
								</p>
								<div class="vote-stack">
									<button
										type="button"
										class="vote-btn vote-up"
										class:vote-up-active={voteStates[tool.slug ?? tool.name] === 'up'}
										onclick={(event) => {
											event.preventDefault();
											event.stopPropagation();
											vote(tool, 1);
										}}
										aria-label={`Upvote ${tool.name}`}
									>
										<span
											class="material-symbols-outlined text-base"
											style="font-variation-settings: 'FILL' {(voteStates[tool.slug ?? tool.name] ??
												null) === 'up'
												? 1
												: 0};"
										>
											arrow_drop_up
										</span>
									</button>
									<button
										type="button"
										class="vote-btn vote-down"
										class:vote-down-active={voteStates[tool.slug ?? tool.name] === 'down'}
										onclick={(event) => {
											event.preventDefault();
											event.stopPropagation();
											vote(tool, -1);
										}}
										aria-label={`Downvote ${tool.name}`}
									>
										<span
											class="material-symbols-outlined text-base"
											style="font-variation-settings: 'FILL' {(voteStates[tool.slug ?? tool.name] ??
												null) === 'down'
												? 1
												: 0};"
										>
											arrow_drop_down
										</span>
									</button>
								</div>
								<button
									type="button"
									class="home-bookmark-btn mt-1"
									class:home-bookmark-saved={bookmarkStates[tool.slug ?? tool.name]}
									onclick={(e) => toggleBookmark(e, tool)}
									title={bookmarkStates[tool.slug ?? tool.name]
										? 'Remove from archive'
										: 'Save to archive'}
								>
									<span
										class="material-symbols-outlined text-lg"
										style="font-variation-settings: 'FILL' {(bookmarkStates[
											tool.slug ?? tool.name
										] ?? false)
											? 1
											: 0};"
									>
										bookmark
									</span>
								</button>
							</div>
						</div>

						<div class="mt-3 flex flex-wrap gap-1.5">
							<span class="badge-chip">{tool.category ?? 'general'}</span>
							{#if tool.pricingModel && tool.pricingModel !== 'unknown'}
								<span class="badge-chip">{tool.pricingModel}</span>
							{/if}
							{#if tool.bestFor?.length}
								<span class="badge-chip">{tool.bestFor[0]}</span>
							{:else if tool.useCases?.length}
								<span class="badge-chip">{tool.useCases[0]}</span>
							{/if}
						</div>

						<div
							class="mt-3 flex items-center justify-between border-t border-metal-100 pt-3 text-[9px] uppercase tracking-[0.15em] text-metal-500 font-mono"
						>
							{#if tool.language}
								<span>{tool.language}</span>
							{/if}
							{#if tool.affiliateAvailable}
								<span>affiliate link</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<div
				class="border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] rounded-sm p-5"
			>
				<div class="flex items-end justify-between gap-4">
					<div>
						<p class="text-[10px] uppercase tracking-[0.3em] text-metal-500 font-mono">
							Featured Applications
						</p>
						<h2 class="mt-2 text-lg font-heading text-metal-900">
							Selected work and product highlights
						</h2>
					</div>
					<div class="flex items-center gap-2">
						{#each featuredApplications as app}
							<img
								src={app.icon}
								alt={app.label}
								class="size-7 rounded-sm border border-metal-100 bg-surface object-contain p-1"
								loading="lazy"
								referrerpolicy="no-referrer"
							/>
						{/each}
					</div>
				</div>

				<div class="mt-4 overflow-hidden rounded-sm border border-metal-100 bg-bg">
					<div class="featured-marquee">
						<div class="featured-track">
							{#each [...featuredApplications, ...featuredApplications] as app, index}
								<a
									href={app.href}
									target="_blank"
									rel="noopener noreferrer"
									class="group featured-pill"
									aria-label={`${app.label} featured application ${index + 1}`}
								>
									<div class="flex items-center gap-3">
										<div
											class="size-10 border border-metal-100 bg-surface flex items-center justify-center rounded-sm overflow-hidden"
										>
											<img
												src={app.icon}
												alt={app.label}
												class="w-5 h-5 object-contain"
												loading="lazy"
												referrerpolicy="no-referrer"
											/>
										</div>
										<div class="min-w-0">
											<p class="text-base font-semibold text-metal-900">{app.label}</p>
										</div>
									</div>
								</a>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>

		<aside class="sticky top-24 space-y-4">
			<div
				class="border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_92%,var(--metal-100)_8%)] rounded-sm p-5 transition-all duration-200 hover:border-metal-700 hover:shadow-[0_6px_18px_rgba(0,0,0,0.05)]"
			>
				<div class="flex items-center justify-between gap-2">
					<h3 class="text-xs uppercase tracking-[0.25em] text-metal-500 font-mono">Categories</h3>
					<span
						class="sidebar-kicker text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono"
						>Filter</span
					>
				</div>
				<div
					class="sidebar-active mt-3 rounded-sm border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] px-3 py-2"
				>
					<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">Active</p>
					<p class="sidebar-active-label mt-1 text-sm font-medium text-metal-900 capitalize">
						{selectedCategoryLabel}
					</p>
				</div>
				<div class="sidebar-grid mt-4 grid gap-2">
					{#each categories as category}
						<button
							class="sidebar-chip text-left transition-all duration-200 hover:-translate-y-[1px] hover:border-metal-700 hover:shadow-[0_3px_10px_rgba(0,0,0,0.03)] cursor-pointer"
							class:sidebar-chip-active={activeCategory === category}
							onclick={() => (activeCategory = category)}
						>
							<span class="sidebar-chip-label">{category}</span>
							<span class="sidebar-chip-count">{categoryCounts.get(category) ?? 0}</span>
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
					class="selected-repo-card border border-metal-900 bg-surface rounded-sm p-4 sm:p-5 shadow-[8px_8px_0px_var(--accent-dim)]"
				>
					<div class="selected-repo-header">
						<div class="selected-repo-copy min-w-0">
							<p class="text-[10px] uppercase tracking-[0.25em] text-accent-dim font-mono">
								Selected repo
							</p>
							<h3 class="selected-repo-title mt-2 font-heading text-metal-900">
								{selectedTool.name}
							</h3>
							<p class="selected-repo-description mt-2 text-sm text-metal-500 leading-relaxed">
								{selectedTool.description}
							</p>
						</div>
						<div class="selected-repo-score shrink-0">
							<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">Score</p>
							<p class="selected-repo-score-value mt-1 text-2xl font-mono font-bold text-metal-900">
								{scoreLabel(selectedTool)}
							</p>
						</div>
					</div>

					<div class="selected-repo-metrics mt-4 grid gap-3">
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

					<div class="selected-repo-badges mt-4 flex flex-wrap gap-2">
						<span class="badge-chip">{selectedTool.category ?? 'general'}</span>
						{#if selectedTool.language}
							<span class="badge-chip">{selectedTool.language}</span>
						{/if}
						{#if selectedTool.affiliateAvailable}
							<span class="badge-chip badge-chip-muted">affiliate</span>
						{/if}
					</div>

					<a
						href={`/tool/${encodeURIComponent(selectedTool.slug ?? selectedTool.name)}`}
						class="mt-4 inline-flex items-center justify-center rounded-sm border border-metal-900 bg-accent-dim px-3 py-2 text-xs font-mono uppercase tracking-[0.15em] text-metal-900 transition-all hover:-translate-y-[1px] hover:shadow-[2px_2px_0px_var(--metal-900)]"
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
		class="search-backdrop fixed inset-0 z-[60] bg-[rgba(0,0,0,0.42)]"
		aria-label="Close search"
		onclick={closeSearch}
	></button>
	<div class="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
		<div
			class="search-modal w-full max-w-2xl overflow-hidden rounded-sm border border-metal-900 bg-surface shadow-[10px_10px_0px_var(--accent-dim)]"
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

	.tool-card-selected {
		border-color: var(--metal-900);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--surface) 86%, var(--accent-dim) 14%),
			color-mix(in srgb, var(--surface) 96%, var(--metal-100) 4%)
		);
		transform: translateY(-2px);
		box-shadow:
			0 12px 26px rgba(0, 0, 0, 0.08),
			0 0 0 1px var(--accent-dim),
			0 0 0 4px color-mix(in srgb, var(--accent-dim) 16%, transparent);
	}

	.tool-card-selected:hover {
		border-color: var(--metal-900);
		transform: translateY(-3px);
		box-shadow:
			0 14px 30px rgba(0, 0, 0, 0.1),
			0 0 0 1px var(--accent-dim),
			0 0 0 4px color-mix(in srgb, var(--accent-dim) 16%, transparent);
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
		background: var(--accent-dim);
		color: var(--metal-900);
		border-color: var(--accent-dim);
	}

	.hero-highlight {
		display: inline-block;
		color: var(--metal-900);
		background: linear-gradient(
			180deg,
			transparent 64%,
			color-mix(in srgb, var(--accent-dim) 30%, transparent) 64%
		);
		padding: 0 0.08em;
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

	.summary-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.5rem 0;
	}

	.summary-meta + .summary-meta {
		border-top: 1px solid var(--metal-100);
	}

	.summary-meta-label {
		font-size: 0.62rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		font-family: var(--font-mono);
		color: var(--metal-500);
	}

	.summary-meta-value {
		font-size: 0.75rem;
		font-family: var(--font-mono);
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
		content-visibility: auto;
		contain-intrinsic-size: 320px;
	}

	.top1-shell {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 1rem;
		align-items: start;
	}

	.top1-ribbon {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		margin-bottom: 0.75rem;
		padding: 0.3rem 0.5rem;
		border: 1px solid var(--metal-900);
		background: color-mix(in srgb, var(--accent-dim) 18%, var(--surface));
		color: var(--metal-900);
		border-radius: 0.125rem;
		font-size: 0.62rem;
		line-height: 1;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		font-family: var(--font-mono);
	}

	.top1-brand {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.top1-logo {
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent-dim) 12%, transparent);
	}

	.top1-score {
		text-align: right;
		padding-top: 0.2rem;
	}

	.top1-name,
	.anywork-title {
		min-width: 0;
		overflow-wrap: anywhere;
		word-break: break-word;
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

	.vote-stack {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.vote-btn {
		width: 2rem;
		height: 1.8rem;
		border: 1px solid var(--metal-100);
		background: var(--bg);
		border-radius: 0.125rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 120ms ease;
		cursor: pointer;
	}

	.vote-btn:hover {
		border-color: var(--metal-700);
		background: color-mix(in srgb, var(--surface) 86%, var(--metal-100) 14%);
	}

	.vote-up {
		color: var(--metal-400);
	}

	.vote-up:hover {
		color: var(--accent-dim);
	}

	.vote-up-active {
		background: color-mix(in srgb, var(--accent-dim) 14%, var(--surface) 86%);
		border-color: var(--accent-dim);
		color: var(--accent);
	}

	.vote-up-active:hover {
		background: color-mix(in srgb, var(--accent-dim) 20%, var(--surface) 80%);
	}

	.vote-down {
		color: var(--metal-400);
	}

	.vote-down:hover {
		color: var(--metal-700);
	}

	.vote-down-active {
		background: color-mix(in srgb, var(--metal-700) 10%, var(--surface) 90%);
		border-color: var(--metal-700);
		color: var(--metal-900);
	}

	.vote-down-active:hover {
		background: color-mix(in srgb, var(--metal-700) 16%, var(--surface) 84%);
	}

	.home-bookmark-btn {
		width: 2rem;
		height: 1.8rem;
		border: 1px solid var(--metal-100);
		background: var(--bg);
		border-radius: 0.125rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--metal-400);
		transition: all 120ms ease;
		cursor: pointer;
	}

	.home-bookmark-btn:hover {
		border-color: var(--metal-700);
		background: color-mix(in srgb, var(--surface) 86%, var(--metal-100) 14%);
		color: var(--accent-dim);
	}

	.home-bookmark-saved {
		background: color-mix(in srgb, var(--accent-dim) 10%, var(--surface) 90%);
		border-color: var(--accent-dim);
		color: var(--accent);
	}

	.home-bookmark-saved:hover {
		background: color-mix(in srgb, var(--accent-dim) 16%, var(--surface) 84%);
	}

	@keyframes bookmarkPulseHome {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.15);
		}
		100% {
			transform: scale(1);
		}
	}

	.home-bookmark-saved .material-symbols-outlined {
		animation: bookmarkPulseHome 200ms ease-out;
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
		background: color-mix(in srgb, var(--accent-dim) 12%, var(--surface));
		color: var(--metal-900);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent-dim) 24%, transparent);
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
			var(--accent-dim),
			color-mix(in srgb, var(--accent-dim) 55%, var(--metal-900))
		);
	}

	.search-result {
		border-color: var(--metal-100);
		background: var(--surface);
		transition:
			border-color 80ms ease,
			background-color 80ms ease;
	}

	.search-result-active {
		border-color: var(--metal-900);
		background: color-mix(in srgb, var(--accent-dim) 10%, var(--surface));
	}

	.search-result-active h3 {
		color: var(--metal-900);
	}

	@keyframes searchModalIn {
		from {
			opacity: 0;
			transform: scale(0.96) translateY(-8px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.search-modal {
		animation: searchModalIn 100ms ease-out forwards;
	}

	@keyframes backdropIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.search-backdrop {
		animation: backdropIn 80ms ease-out forwards;
	}

	.featured-marquee {
		overflow: hidden;
	}

	.featured-track {
		display: flex;
		width: max-content;
		gap: 0.75rem;
		padding: 0.75rem;
		animation: featuredMarquee 22s linear infinite;
	}

	.featured-pill {
		flex: 0 0 auto;
		min-width: 15rem;
		border: 1px solid var(--metal-100);
		background: var(--surface);
		border-radius: 0.125rem;
		padding: 0.9rem 1rem;
		transition:
			transform 120ms ease,
			border-color 120ms ease;
	}

	.featured-pill:hover {
		border-color: var(--metal-900);
		transform: translateY(-1px);
	}

	.anywork-chip {
		border: 1px solid var(--metal-100);
		background: color-mix(in srgb, var(--accent-dim) 14%, var(--surface));
		color: var(--metal-900);
		padding: 0.3rem 0.5rem;
		border-radius: 0.125rem;
		font-size: 0.6rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		font-family: var(--font-mono);
	}

	@keyframes featuredMarquee {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.featured-track {
			animation: none;
		}
	}

	@media (max-width: 640px) {
		.selected-repo-card {
			padding: 0.9rem;
		}

		.selected-repo-header {
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto;
			gap: 0.75rem;
			align-items: start;
		}

		.selected-repo-title {
			font-size: 1.05rem;
			line-height: 1.08;
			overflow-wrap: anywhere;
			word-break: break-word;
		}

		.selected-repo-description {
			font-size: 0.875rem;
			line-height: 1.45;
			line-clamp: 2;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}

		.selected-repo-score {
			text-align: right;
			white-space: nowrap;
		}

		.selected-repo-copy,
		.selected-repo-title,
		.selected-repo-description,
		.selected-repo-badges {
			min-width: 0;
		}

		.selected-repo-title,
		.selected-repo-description {
			overflow-wrap: anywhere;
			word-break: break-word;
		}

		.selected-repo-score p:last-child {
			font-size: 1.5rem;
			line-height: 1;
		}

		.selected-repo-metrics {
			display: none;
		}

		.selected-repo-badges {
			margin-top: 0.75rem;
			gap: 0.4rem;
		}

		.selected-repo-badges .badge-chip {
			max-width: 100%;
			font-size: 0.56rem;
			letter-spacing: 0.08em;
			padding: 0.25rem 0.4rem;
		}

		.selected-repo-card a {
			width: 100%;
			margin-top: 0.85rem;
		}

		.summary-panel {
			max-width: none;
		}

		.top1-shell {
			grid-template-columns: 1fr;
			gap: 0.85rem;
		}

		.top1-brand {
			display: flex;
			gap: 0.75rem;
			align-items: flex-start;
		}

		.top1-score {
			text-align: left;
			padding-top: 0;
			display: flex;
			align-items: baseline;
			justify-content: space-between;
			gap: 0.75rem;
		}

		.top1-score p {
			margin: 0;
		}

		.top1-name {
			line-clamp: 2;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
			line-height: 1.02;
			font-size: clamp(1rem, 4.6vw, 1.3rem);
		}

		.anywork-title {
			line-clamp: 1;
			display: -webkit-box;
			-webkit-line-clamp: 1;
			-webkit-box-orient: vertical;
			overflow: hidden;
			line-height: 1.05;
		}

		.badge-hero {
			max-width: 100%;
			font-size: 0.58rem;
			letter-spacing: 0.12em;
			padding: 0.3rem 0.45rem;
		}

		.badge-hero,
		.anywork-chip {
			white-space: nowrap;
		}

		.featured-track {
			gap: 0.5rem;
			padding: 0.5rem;
		}

		.featured-pill {
			min-width: 12.5rem;
			padding: 0.8rem 0.9rem;
		}

		.sidebar-chip {
			padding: 0.68rem 0.75rem;
		}

		.chart-meta {
			gap: 0.75rem;
			letter-spacing: 0.12em;
		}

		.search-modal {
			max-height: 88vh;
		}

		.search-modal > .grid {
			grid-template-columns: 1fr;
		}

		.sidebar-kicker {
			display: none;
		}

		.sidebar-active {
			padding: 0.65rem 0.75rem;
		}

		.sidebar-active-label {
			font-size: 0.85rem;
			line-height: 1.15;
			overflow-wrap: anywhere;
		}

		.sidebar-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 0.5rem;
		}

		.sidebar-chip {
			padding: 0.6rem 0.7rem;
			min-width: 0;
		}

		.sidebar-chip-label {
			font-size: 0.58rem;
			letter-spacing: 0.1em;
			min-width: 0;
		}

		.sidebar-chip-count {
			font-size: 0.62rem;
			flex-shrink: 0;
		}
	}
</style>
