<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Icon } from 'svelte-icon';
	import crownIcon from '$lib/icons/crown.svg?raw';
	import layersIcon from '$lib/icons/layers.svg?raw';
	import boltIcon from '$lib/icons/bolt.svg?raw';
	import type { Tool } from '$lib/types';

	let { data }: { data: { left: Tool | null; right: Tool | null; slug: string; title: string; description: string } } = $props();

	function toolHref(tool: Tool): string {
		return `/tool/${encodeURIComponent(tool.slug ?? tool.name.toLowerCase().replace(/\s+/g, '-'))}`;
	}

	function badgeFor(tool: Tool | null): string[] {
		if (!tool) return ['not found'];
		const items = [tool.category ?? 'general'];
		if (tool.bestFor?.length) items.push(tool.bestFor[0]);
		if (tool.pricingModel) items.push(tool.pricingModel);
		if (tool.affiliateAvailable) items.push('affiliate');
		return items;
	}
</script>

<svelte:head>
	<title>{data.title} — VELO</title>
	<meta name="description" content={data.description} />
</svelte:head>

<main class="max-w-[1280px] mx-auto px-6 py-8 lg:py-12" in:fly={{ y: 12, duration: 280 }}>
	<section class="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
		<div class="space-y-5">
			<div class="inline-flex items-center gap-3 border border-metal-100 bg-surface px-4 py-3 rounded-sm">
				<div class="size-10 border border-metal-900 bg-metal-900 text-surface rounded-sm flex items-center justify-center">
					<Icon data={layersIcon} size="18px" color="currentColor" />
				</div>
				<div>
					<p class="text-[10px] uppercase tracking-[0.3em] text-metal-500 font-mono">Compare</p>
					<p class="text-sm text-metal-500">High-intent tool decision page</p>
				</div>
			</div>

			<header class="space-y-4">
				<div class="flex flex-wrap gap-2">
					<span class="badge-chip badge-chip-hero">
						<Icon data={crownIcon} size="12px" color="currentColor" />
						<span>comparison</span>
					</span>
					<span class="badge-chip badge-chip-accent">selected</span>
					<span class="badge-chip badge-chip-accent">side-by-side</span>
					<span class="badge-chip">conversion-first</span>
				</div>

				<h1 class="max-w-4xl text-[clamp(2.3rem,4.8vw,4.8rem)] leading-[0.94] tracking-[-0.05em] text-metal-900 font-heading">
					{data.title}
				</h1>
				<p class="max-w-2xl text-base lg:text-lg text-metal-500 leading-relaxed">{data.description}</p>
			</header>
		</div>

		<div class="grid gap-4 self-start">
			<div class="border border-metal-100 bg-surface rounded-sm p-5">
				<div class="flex items-center justify-between">
					<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">Summary</p>
					<Icon data={boltIcon} size="14px" color="var(--metal-500)" />
				</div>
				<div class="mt-4 grid grid-cols-2 gap-3">
					<div class="rounded-sm border border-metal-100 bg-bg p-3">
						<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">Left</p>
						<p class="mt-2 text-lg font-heading text-metal-900">{data.left?.name ?? 'Not found'}</p>
					</div>
					<div class="rounded-sm border border-metal-100 bg-bg p-3">
						<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">Right</p>
						<p class="mt-2 text-lg font-heading text-metal-900">{data.right?.name ?? 'Not found'}</p>
					</div>
				</div>
			</div>

			<div class="border border-metal-100 bg-surface rounded-sm p-5">
				<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">Decision path</p>
				<p class="mt-2 text-sm text-metal-500">
					Choose the tool that matches your intent, then jump straight into its detail page.
				</p>
			</div>
		</div>
	</section>

	<section class="mt-8 grid gap-4 xl:grid-cols-2">
		{#each [data.left, data.right] as tool, index}
			<div class="border border-metal-100 bg-surface rounded-sm p-5">
				<div class="flex items-start justify-between gap-4">
					<div class="min-w-0">
						<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">{index === 0 ? 'Left side' : 'Right side'}</p>
						<h2 class="mt-1 text-2xl font-heading text-metal-900">{tool?.name ?? 'Tool not found'}</h2>
						<p class="mt-2 text-sm text-metal-500">
							{tool?.description ?? 'No data was matched for this comparison slug.'}
						</p>
					</div>
					{#if tool}
						<p class="text-3xl font-mono font-bold text-metal-900">{tool.score ?? tool.trustScore ?? 0}</p>
					{/if}
				</div>

				<div class="mt-4 flex flex-wrap gap-2">
					{#each badgeFor(tool) as badge}
						<span class="badge-chip {badge === 'not found' ? '' : 'badge-chip-accent'}">{badge}</span>
					{/each}
				</div>

				{#if tool}
					<div class="mt-5 flex flex-wrap gap-3">
						<a href={toolHref(tool)} class="badge-chip badge-chip-accent">View tool</a>
						{#if tool.affiliateAvailable}
							<span class="badge-chip badge-chip-accent">Promotion visible</span>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</section>

	<section class="mt-8 grid gap-4 lg:grid-cols-3">
		<div class="border border-metal-100 bg-surface rounded-sm p-5">
			<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">What to compare</p>
			<p class="mt-2 text-sm text-metal-500">
				Category, pricing, best-for, and affiliate readiness are the fastest signals for choosing a tool.
			</p>
		</div>
		<div class="border border-metal-100 bg-surface rounded-sm p-5">
			<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">Monetization</p>
			<p class="mt-2 text-sm text-metal-500">
				Promotion is allowed, but clearly separated from ranking and comparison logic.
			</p>
		</div>
		<div class="border border-metal-100 bg-surface rounded-sm p-5">
			<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">Next step</p>
			<p class="mt-2 text-sm text-metal-500">
				Open the tool detail page for deeper evaluation and related alternatives.
			</p>
		</div>
	</section>

	<section class="mt-8 border border-metal-100 bg-surface rounded-sm p-5">
		<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">Disclosure</p>
		<p class="mt-2 text-sm text-metal-500">
			Some comparison links may be affiliate-linked. Rank and compare logic remain separate from promotion.
		</p>
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

	.badge-chip-accent {
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent) 18%, var(--surface));
		color: var(--metal-900);
	}
</style>
