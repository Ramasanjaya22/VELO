<script lang="ts">
	import { fly } from 'svelte/transition';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import type { Product } from '$lib/types';

	const mockUser = {
		name: 'Alex Operator',
		bio: 'Independent builder tracking AI tools worth testing.',
		avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Alex',
		stats: [
			{ label: 'Saved', value: '12' },
			{ label: 'Focus', value: 'AI' },
			{ label: 'Lists', value: '3' }
		],
		saved: [
			{
				rank: 1,
				name: 'Notion AI',
				slug: 'notion-ai',
				url: 'https://www.notion.so/product/ai',
				description: 'Workspace AI for planning and writing.',
				category: 'writing',
				useCases: ['founders'],
				bestFor: ['knowledge work'],
				pricingModel: 'freemium',
				affiliateAvailable: false,
				trustScore: 88,
				score: 94,
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
				useCases: ['marketers'],
				bestFor: ['research'],
				pricingModel: 'freemium',
				affiliateAvailable: false,
				trustScore: 90,
				score: 93,
				avatarUrl: 'https://www.perplexity.ai/favicon.ico',
				sourceIds: ['manual:perplexity']
			}
		] as Product[]
	};

	let activeTab = $state('Saved');
	const tabs = ['Saved', 'Lists'];
</script>

<svelte:head>
	<title>{mockUser.name} — Profile</title>
</svelte:head>

<main class="w-full max-w-[1040px] mx-auto px-6 py-12" in:fly={{ y: 20, duration: 600 }}>
	<div class="flex flex-col lg:flex-row gap-12 relative">
		<aside class="w-full lg:w-[320px] shrink-0">
			<div class="sticky top-24 flex flex-col gap-8">
				<div
					class="bg-surface border border-metal-100 rounded-sm p-6 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col items-center text-center"
				>
					<div class="size-20 bg-bg rounded-full border border-metal-100 overflow-hidden mb-4">
						<img src={mockUser.avatar} alt={mockUser.name} class="size-full object-cover" />
					</div>
					<h1 class="text-xl font-bold text-metal-900 font-heading mb-1">{mockUser.name}</h1>
					<p class="text-xs text-metal-500 font-body leading-relaxed max-w-[200px] mb-6">
						{mockUser.bio}
					</p>
				</div>

				<div
					class="bg-surface border border-metal-100 rounded-sm overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
				>
					<div class="grid grid-cols-3 divide-x divide-metal-100">
						{#each mockUser.stats as stat}
							<div class="p-4 flex flex-col items-center gap-1">
								<span
									class="text-[10px] text-metal-500 font-bold uppercase tracking-widest font-mono"
									>{stat.label}</span
								>
								<span class="text-lg font-bold text-metal-900 font-mono">{stat.value}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</aside>

		<div class="flex-1 min-w-0">
			<div
				class="flex items-center gap-8 border-b border-metal-100 mb-8 overflow-x-auto scrollbar-none"
			>
				{#each tabs as tab}
					<button
						class="pb-4 text-xs font-bold uppercase tracking-widest transition-all relative font-heading"
						class:text-metal-900={activeTab === tab}
						class:text-metal-500={activeTab !== tab}
						onclick={() => (activeTab = tab)}
					>
						{tab}
						{#if activeTab === tab}
							<div class="absolute bottom-0 left-0 w-full h-[3px] bg-accent"></div>
						{/if}
					</button>
				{/each}
			</div>

			<div class="flex flex-col gap-6">
				{#each mockUser.saved as product, i}
					<div
						class="transform transition-all hover:translate-x-1"
						in:fly={{ y: 20, duration: 400, delay: i * 100 }}
					>
						<ProductCard {product} index={i} />
					</div>
				{/each}
			</div>
		</div>
	</div>
</main>

<style>
	:global(.scrollbar-none::-webkit-scrollbar) {
		display: none;
	}
	:global(.scrollbar-none) {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
