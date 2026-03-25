<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import type { Product } from '$lib/types';
	import { getSavedToolKey, loadSavedTools, toggleTool } from '$lib/utils/saved-tools';
	import { toasts } from '$lib/utils/toast';

	interface Props {
		product: Product;
		index: number;
		lastItem?: boolean;
	}

	let { product, index }: Props = $props();

	let isBookmarked = $state(false);
	let voteState = $state<'up' | 'down' | null>(null);

	function syncBookmarkState() {
		const toolKey = getSavedToolKey(product);
		isBookmarked = loadSavedTools().some((tool) => getSavedToolKey(tool) === toolKey);
	}

	function toggleBookmark(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		const wasBookmarked = isBookmarked;
		toggleTool(product);
		isBookmarked = !isBookmarked;

		if (!wasBookmarked) {
			toasts.add('Saved to archive');
			setTimeout(() => {
				goto('/archive');
			}, 200);
		} else {
			toasts.add('Removed from archive');
		}
	}

	function handleVote(e: MouseEvent, vote: 'up' | 'down') {
		e.preventDefault();
		e.stopPropagation();
		if (voteState === vote) {
			voteState = null;
		} else {
			voteState = vote;
		}
	}

	function openRepoPage() {
		goto(`/tool/${encodeURIComponent(product.slug ?? product.name)}`);
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

<div
	class="repo-card flex h-[120px] bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] border border-metal-100 rounded-sm overflow-hidden group cursor-pointer transition-all duration-200 hover:border-metal-700 hover:shadow-[0_6px_16px_rgba(0,0,0,0.05)]"
	in:fly={{ y: 20, delay: index * 60, duration: 350 }}
	onclick={openRepoPage}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openRepoPage();
		}
	}}
	role="button"
	tabindex="0"
	aria-label={`Open ${product.name} repo page`}
>
	<!-- Rank Indicator -->
	<div
		class="repo-rank w-10 flex items-center justify-center border-r border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] group-hover:border-metal-700 transition-colors shrink-0"
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
	<div class="repo-main">
		{#if product.avatarUrl}
			<div
				class="repo-avatar w-14 h-14 shrink-0 rounded-sm border border-metal-100 overflow-hidden ml-6 my-auto bg-[color-mix(in_srgb,var(--surface)_90%,var(--metal-100)_10%)]"
			>
				<img src={product.avatarUrl} alt={product.name} class="w-full h-full object-cover" />
			</div>
		{/if}

		<!-- Content -->
		<div
			class="repo-content flex-grow flex flex-col justify-center px-6 py-4 overflow-hidden relative"
		>
			<!-- Bookmark Icon in top right of content area -->
			<button
				class="bookmark-btn absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-sm transition-all duration-150"
				class:bookmark-saved={isBookmarked}
				onclick={toggleBookmark}
				title={isBookmarked ? 'Remove from saved tools' : 'Save to archive'}
			>
				<span
					class="material-symbols-outlined text-[28px] transition-transform duration-150"
					class:text-metal-500={!isBookmarked}
					class:text-accent={isBookmarked}
					style="font-variation-settings: 'FILL' {isBookmarked ? 1 : 0};"
				>
					bookmark
				</span>
			</button>

			<div class="repo-heading-row flex items-center gap-3 mb-1 pr-8">
				<h3
					class="repo-title text-lg font-semibold text-metal-900 truncate font-display tracking-tight hover:underline"
				>
					{product.name}
				</h3>
				<div class="repo-chips flex gap-2 shrink-0">
					{#if product.language}
						<span
							class="repo-chip bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] text-metal-500 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm border border-metal-100"
						>
							{product.language}
						</span>
					{/if}
					{#each (product.topics ?? []).slice(0, 1) as topic}
						<span
							class="repo-chip bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] text-metal-500 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm border border-metal-100"
						>
							{topic}
						</span>
					{/each}
					<span
						class="repo-score-chip text-accent-dim text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-sm border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)]"
					>
						Score: {(product.score ?? 0).toFixed(1)}
					</span>
				</div>
			</div>
			<p class="repo-description text-metal-500 text-sm leading-[1.6] truncate pr-8">
				{product.description || 'No description provided.'}
			</p>
			<div class="repo-stats text-metal-300 text-[11px] flex gap-4 mt-2 font-mono">
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
	</div>

	<!-- Vote Actions -->
	<div
		class="repo-votes w-[120px] h-full shrink-0 border-l border-metal-100 flex flex-col items-center justify-center gap-0.5 bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] group-hover:border-metal-700 transition-colors"
	>
		<button
			class="vote-btn w-full flex-1 flex items-center justify-center transition-colors"
			class:vote-up-active={voteState === 'up'}
			onclick={(e) => handleVote(e, 'up')}
			title="Upvote"
		>
			<span
				class="material-symbols-outlined text-xl transition-all duration-100"
				class:text-metal-300={voteState !== 'up'}
				class:text-accent={voteState === 'up'}
				style="font-variation-settings: 'FILL' {voteState === 'up' ? 1 : 0};"
			>
				arrow_drop_up
			</span>
		</button>
		<span class="text-metal-900 font-bold text-sm font-mono tracking-tight py-0.5">
			{formatNumber(product.stars ?? 0)}
		</span>
		<button
			class="vote-btn w-full flex-1 flex items-center justify-center transition-colors"
			class:vote-down-active={voteState === 'down'}
			onclick={(e) => handleVote(e, 'down')}
			title="Downvote"
		>
			<span
				class="material-symbols-outlined text-xl transition-all duration-100"
				class:text-metal-300={voteState !== 'down'}
				class:text-metal-700={voteState === 'down'}
				style="font-variation-settings: 'FILL' {voteState === 'down' ? 1 : 0};"
			>
				arrow_drop_down
			</span>
		</button>
	</div>
</div>

<style>
	.repo-card:active {
		transform: scale(0.99);
	}

	.vote-btn:hover {
		background: color-mix(in srgb, var(--surface) 86%, var(--metal-100) 14%);
	}

	.vote-btn:active {
		background: color-mix(in srgb, var(--surface) 80%, var(--metal-100) 20%);
	}

	.vote-up-active {
		background: color-mix(in srgb, var(--accent-dim) 12%, var(--surface) 88%);
	}

	.vote-down-active {
		background: color-mix(in srgb, var(--metal-700) 8%, var(--surface) 92%);
	}

	.bookmark-btn {
		color: var(--metal-500);
	}

	.bookmark-btn:hover {
		background: color-mix(in srgb, var(--surface) 88%, var(--metal-100) 12%);
	}

	.bookmark-btn:hover .material-symbols-outlined:not(.text-accent) {
		color: var(--accent-dim);
		transform: scale(1.1);
	}

	.bookmark-btn:active .material-symbols-outlined {
		transform: scale(0.95);
	}

	.bookmark-saved {
		background: color-mix(in srgb, var(--accent-dim) 8%, var(--surface) 92%);
	}

	@keyframes bookmarkPulse {
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

	.bookmark-saved .material-symbols-outlined {
		animation: bookmarkPulse 200ms ease-out;
	}

	@media (max-width: 640px) {
		.repo-card {
			display: grid;
			grid-template-columns: minmax(0, 1fr) 4.25rem;
			grid-template-areas:
				'rank rank'
				'main votes';
			grid-template-rows: auto 1fr;
			height: auto;
		}

		.repo-rank {
			grid-area: rank;
			width: 100%;
			height: 2.25rem;
			justify-content: space-between;
			padding: 0 0.8rem;
			border-right: 0;
			border-bottom: 1px solid var(--metal-100);
		}

		.repo-main {
			grid-area: main;
			display: grid;
			grid-template-columns: 2.5rem minmax(0, 1fr);
			gap: 0.55rem;
			min-width: 0;
			padding: 0.7rem 0.65rem 0.65rem 0.7rem;
			align-items: start;
		}

		.repo-avatar {
			width: 2.5rem;
			height: 2.5rem;
			margin: 0;
		}

		.repo-content {
			padding: 0;
			min-width: 0;
		}

		.repo-heading-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.35rem;
			padding-right: 0;
			margin-bottom: 0.45rem;
		}

		.repo-title {
			max-width: 100%;
			font-size: 0.92rem;
			line-height: 1.08;
			white-space: normal;
			line-clamp: 2;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
		}

		.repo-chips {
			flex-wrap: wrap;
			gap: 0.3rem;
		}

		.repo-chip,
		.repo-score-chip {
			font-size: 0.52rem;
			letter-spacing: 0.06em;
			padding: 0.22rem 0.35rem;
		}

		.repo-description {
			padding-right: 0;
			font-size: 0.78rem;
			line-height: 1.45;
			line-clamp: 2;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			white-space: normal;
		}

		.repo-stats {
			flex-wrap: wrap;
			gap: 0.25rem 0.55rem;
			margin-top: 0.45rem;
			font-size: 0.6rem;
		}

		.repo-votes {
			grid-area: votes;
			width: 100%;
			height: 100%;
			flex-direction: column;
			border-left: 1px solid var(--metal-100);
			border-top: 0;
			margin-top: 0;
			gap: 0;
		}

		.repo-votes .vote-btn {
			flex: 1;
			width: 100%;
			min-height: 2rem;
		}

		.repo-votes > span {
			min-width: 100%;
			padding: 0.3rem 0.15rem;
			text-align: center;
			font-size: 0.78rem;
		}

		.bookmark-btn {
			top: 0.45rem;
			right: 0.45rem;
			width: 2rem;
			height: 2rem;
		}
	}
</style>
