<script lang="ts">
	import { fly } from 'svelte/transition';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import type { Product } from '$lib/types';

	const bookmarks: Product[] = [
		{
			rank: 1,
			name: 'Notion AI',
			slug: 'notion-ai',
			url: 'https://www.notion.so/product/ai',
			affiliateUrl: 'https://www.notion.so/product/ai',
			description: 'Workspace AI for writing, planning, and knowledge work.',
			category: 'writing',
			useCases: ['freelancers', 'founders'],
			bestFor: ['knowledge work'],
			pricingModel: 'freemium',
			affiliateAvailable: false,
			trustScore: 88,
			score: 94.5,
			logoUrl: 'https://www.notion.so/front-static/favicon.ico',
			avatarUrl: 'https://www.notion.so/front-static/favicon.ico',
			sourceIds: ['manual:notion']
		},
		{
			rank: 2,
			name: 'Perplexity',
			slug: 'perplexity',
			url: 'https://www.perplexity.ai/',
			description: 'Search and answer engine with citations.',
			category: 'research',
			useCases: ['marketers', 'researchers'],
			bestFor: ['research'],
			pricingModel: 'freemium',
			affiliateAvailable: false,
			trustScore: 90,
			score: 93.1,
			logoUrl: 'https://www.perplexity.ai/favicon.ico',
			avatarUrl: 'https://www.perplexity.ai/favicon.ico',
			sourceIds: ['manual:perplexity']
		},
		{
			rank: 3,
			name: 'Claude',
			slug: 'claude',
			url: 'https://claude.ai/',
			description: 'General-purpose AI assistant for writing and analysis.',
			category: 'assistant',
			useCases: ['creators', 'solo-founders'],
			bestFor: ['writing'],
			pricingModel: 'freemium',
			affiliateAvailable: false,
			trustScore: 92,
			score: 92.4,
			logoUrl: 'https://claude.ai/favicon.ico',
			avatarUrl: 'https://claude.ai/favicon.ico',
			sourceIds: ['manual:claude']
		}
	];
</script>

<svelte:head>
	<title>Archive — VELO</title>
</svelte:head>

<main class="w-full max-w-[1040px] mx-auto px-6 py-12" in:fly={{ y: 20, duration: 600 }}>
	<div class="flex flex-col gap-10">
		<header class="flex flex-col gap-3">
			<div class="flex items-center gap-3">
				<span class="material-symbols-outlined text-accent-dim text-[32px]">history</span>
				<h1 class="text-[32px] font-semibold tracking-[-0.02em] leading-tight text-metal-900 font-heading">
					Saved Tools
				</h1>
			</div>
			<p class="text-[18px] font-normal text-metal-500 leading-relaxed font-body max-w-[600px]">
				Curated tools you may want to revisit. This archive is a lightweight placeholder for future
				bookmark and history features.
			</p>
		</header>

		<div class="flex flex-col gap-4">
			{#each bookmarks as product, index (product.name)}
				<a href={`/tool/${encodeURIComponent(product.slug ?? product.name)}`} class="block no-underline">
					<ProductCard {product} {index} />
				</a>
			{/each}
		</div>
	</div>
</main>
