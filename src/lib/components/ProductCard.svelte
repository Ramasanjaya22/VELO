<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import type { Product } from '$lib/types';
	import { getSavedToolKey, loadSavedTools, toggleTool } from '$lib/utils/saved-tools';

	interface Props {
		product: Product;
		index: number;
		lastItem?: boolean;
	}

	let { product, index }: Props = $props();

	let isBookmarked = $state(false);

	function syncBookmarkState() {
		const toolKey = getSavedToolKey(product);
		isBookmarked = loadSavedTools().some((tool) => getSavedToolKey(tool) === toolKey);
	}

	function toggleBookmark(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		toggleTool(product);
		isBookmarked = !isBookmarked;
	}

	function handleUpvote(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		// Upvote logic
	}

	function formatNumber(n: number): string {
		if (n >= 1000) {
			return (n / 1000).toFixed(1) + 'k';
		}
		return n.toString();
	}

	const isHighRank = $derived(index < 3);

	onMount(() => {
		syncBookmarkState();

		const onStorage = () => {
			syncBookmarkState();
		};

		window.addEventListener('storage', onStorage);
		return () => window.removeEventListener('storage', onStorage);
	});
</script>

<article
	class="repo-card flex h-[120px] bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] border border-metal-100 rounded-sm overflow-hidden group cursor-pointer transition-all duration-200 hover:border-metal-700 hover:shadow-[0_6px_16px_rgba(0,0,0,0.05)]"
	in:fly={{ y: 20, delay: index * 60, duration: 350 }}
>
	<!-- Rank Indicator -->
	<div
		class="w-10 flex items-center justify-center border-r border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] group-hover:border-metal-700 transition-colors shrink-0"
	>
		<span
			class="font-mono font-bold text-lg"
			class:text-accent={isHighRank}
			class:text-metal-300={!isHighRank}
		>
			{index + 1}
		</span>
	</div>

	<!-- Avatar -->
	{#if product.avatarUrl}
		<div
			class="w-14 h-14 shrink-0 rounded-sm border border-metal-100 overflow-hidden ml-6 my-auto bg-[color-mix(in_srgb,var(--surface)_90%,var(--metal-100)_10%)]"
		>
			<img src={product.avatarUrl} alt={product.name} class="w-full h-full object-cover" />
		</div>
	{/if}

	<!-- Content -->
	<div class="flex-grow flex flex-col justify-center px-6 py-4 overflow-hidden relative">
		<!-- Bookmark Icon in top right of content area -->
		<button
			class="absolute top-4 right-4 text-metal-300 hover:text-accent-dim transition-colors h-8 w-8 flex items-center justify-center rounded-sm hover:bg-[color-mix(in_srgb,var(--surface)_90%,var(--metal-100)_10%)]"
			onclick={toggleBookmark}
			title={isBookmarked ? 'Remove from saved tools' : 'Save to archive'}
		>
			<span
				class="material-symbols-outlined text-[20px]"
				style="font-variation-settings: 'FILL' {isBookmarked ? 1 : 0};"
			>
				bookmark
			</span>
		</button>

		<div class="flex items-center gap-3 mb-1 pr-8">
			<h3
			class="text-lg font-semibold text-metal-900 truncate font-display tracking-tight hover:underline"
			>
				{product.name}
			</h3>
			<div class="flex gap-2 shrink-0">
				{#if product.language}
					<span
						class="bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] text-metal-500 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm border border-metal-100"
					>
						{product.language}
					</span>
				{/if}
				{#each (product.topics ?? []).slice(0, 1) as topic}
					<span
						class="bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] text-metal-500 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm border border-metal-100"
					>
						{topic}
					</span>
				{/each}
				<span
					class="text-accent-dim text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-sm border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)]"
				>
					Score: {(product.score ?? 0).toFixed(1)}
				</span>
			</div>
		</div>
		<p class="text-metal-500 text-sm leading-[1.6] truncate pr-8">
			{product.description || 'No description provided.'}
		</p>
		<div class="text-metal-300 text-[11px] flex gap-4 mt-2 font-mono">
			{#if product.starsGrowth}
				<span class="flex items-center gap-1 text-accent-dim font-bold"
					>+{formatNumber(product.starsGrowth)} this week</span
				>
			{/if}
			{#if product.forks}
				<span class="flex items-center gap-1">Forks: {formatNumber(product.forks)}</span>
			{/if}
			{#if product.contributors}
				<span class="flex items-center gap-1">Contributors: {product.contributors}</span>
			{/if}
		</div>
	</div>

	<!-- Upvote Action -->
	<button
		class="w-[120px] h-full shrink-0 border-l border-metal-100 flex flex-col items-center justify-center gap-1 group-hover:border-metal-700 transition-colors bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] hover:bg-[color-mix(in_srgb,var(--surface)_88%,var(--metal-100)_12%)] active:bg-accent active:text-metal-900 upvote-card-btn"
		onclick={handleUpvote}
	>
		<span
			class="material-symbols-outlined text-metal-900 transition-transform group-hover:-translate-y-0.5"
			style="font-variation-settings: 'FILL' 1;"
		>
			arrow_drop_up
		</span>
		<span class="text-metal-900 font-bold text-lg font-mono tracking-tight">
			{formatNumber(product.stars ?? 0)}
		</span>
	</button>
</article>

<style>
	.repo-card:active {
		transform: scale(0.99);
	}

	.upvote-card-btn:active span {
		color: var(--metal-900);
	}
</style>
