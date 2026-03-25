<script lang="ts">
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import { Icon } from 'svelte-icon';
	import crownIcon from '$lib/icons/crown.svg?raw';
	import searchIcon from '$lib/icons/search.svg?raw';
	import boltIcon from '$lib/icons/bolt.svg?raw';
	import layersIcon from '$lib/icons/layers.svg?raw';
	import type { Tool } from '$lib/types';

	let { data }: { data: { segment: string; title: string; description: string; recommendations: Tool[]; filters: { primary: string[]; category: Array<{ label: string; count: number }>; pricing: Array<{ label: string; count: number }>; signals: Array<{ label: string; count: number }> }; highlights: { total: number; affiliateReady: number; freeTrial: number; topCategory: string } } } = $props();

	function toolHref(tool: Tool): string {
		return `/tool/${encodeURIComponent(tool.slug ?? tool.name.toLowerCase().replace(/\s+/g, '-'))}`;
	}

	function compareHref(tool: Tool, target: Tool): string {
		const left = tool.slug ?? tool.name.toLowerCase().replace(/\s+/g, '-');
		const right = target.slug ?? target.name.toLowerCase().replace(/\s+/g, '-');
		return `/compare/${encodeURIComponent(`${left}-vs-${right}`)}`;
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
					<p class="text-[10px] uppercase tracking-[0.3em] text-metal-500 font-mono">Best for</p>
					<p class="text-sm text-metal-500 capitalize">{data.segment.replace(/-/g, ' ')}</p>
				</div>
			</div>

			<header class="space-y-4">
				<div class="flex flex-wrap gap-2">
					<span class="badge-chip badge-chip-hero">
						<Icon data={crownIcon} size="12px" color="currentColor" />
						<span>{data.segment.replace(/-/g, ' ')}</span>
					</span>
					<span class="badge-chip badge-chip-accent">selected</span>
					<span class="badge-chip">ranked tools</span>
					<span class="badge-chip">client work</span>
				</div>

				<h1 class="max-w-4xl text-[clamp(2.3rem,4.8vw,4.8rem)] leading-[0.94] tracking-[-0.05em] text-metal-900 font-heading">
					{data.title}
				</h1>
				<p class="max-w-2xl text-base lg:text-lg text-metal-500 leading-relaxed">
					{data.description}
					For freelancers, the list favors tools that help you pitch better, write faster, and ship with less friction.
				</p>
			</header>
		</div>

		<div class="grid gap-4 self-start">
			<div class="border border-metal-100 bg-surface rounded-sm p-5">
				<div class="flex items-center justify-between">
					<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">Summary</p>
					<Icon data={boltIcon} size="14px" color="var(--metal-500)" />
				</div>
				<div class="mt-4 grid grid-cols-2 gap-3">
					<div class="rounded-sm border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] p-3">
						<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">Tools</p>
						<p class="mt-2 text-lg font-heading text-metal-900">{data.highlights.total}</p>
					</div>
					<div class="rounded-sm border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] p-3">
						<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">Affiliate ready</p>
						<p class="mt-2 text-lg font-heading text-metal-900">{data.highlights.affiliateReady}</p>
					</div>
					<div class="rounded-sm border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] p-3">
						<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">Free / trial</p>
						<p class="mt-2 text-lg font-heading text-metal-900">{data.highlights.freeTrial}</p>
					</div>
					<div class="rounded-sm border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] p-3">
						<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">Top category</p>
						<p class="mt-2 text-lg font-heading text-metal-900 capitalize">{data.highlights.topCategory}</p>
					</div>
				</div>
				<div class="mt-4 flex flex-wrap gap-2">
					{#each data.filters.primary as filter}
						<span class="badge-chip badge-chip-accent">selected · {filter}</span>
					{/each}
					{#each data.filters.signals as signal}
						<span class="badge-chip">{signal.label} · {signal.count}</span>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<section class="mt-8 grid gap-4 xl:grid-cols-[1.2fr_0.9fr_0.9fr]">
		<div class="border border-metal-100 bg-surface rounded-sm p-5">
			<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">Category fit</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each data.filters.category as category}
					<span class="badge-chip">{category.label} · {category.count}</span>
				{/each}
			</div>
		</div>

		<div class="border border-metal-100 bg-surface rounded-sm p-5">
			<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">Pricing fit</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each data.filters.pricing as pricing}
					<span class="badge-chip">{pricing.label} · {pricing.count}</span>
				{/each}
			</div>
		</div>

		<div class="border border-metal-100 bg-surface rounded-sm p-5">
			<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">Signal mix</p>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each data.filters.signals as signal}
					<span class="badge-chip badge-chip-accent">{signal.label} · {signal.count}</span>
				{/each}
			</div>
		</div>
	</section>

	<section class="mt-8 grid gap-8 xl:grid-cols-[1.12fr_0.88fr]">
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-xs uppercase tracking-[0.3em] text-metal-500 font-mono">Top recommendation</h2>
				<span class="text-xs uppercase tracking-[0.2em] text-metal-500 font-mono">primary CTA first</span>
			</div>

			{#if data.recommendations[0]}
				{@const tool = data.recommendations[0]}
				<div class="block border border-metal-900 bg-metal-900 text-surface rounded-sm p-6 lg:p-7 shadow-[6px_6px_0px_var(--accent)] transition-all hover:-translate-y-[2px]">
					<div class="flex items-start justify-between gap-4">
						<div class="min-w-0">
							<div class="flex flex-wrap gap-2">
								<span class="badge-hero">{tool.category ?? 'general'}</span>
								{#if tool.pricingModel}
									<span class="badge-hero">{tool.pricingModel}</span>
								{/if}
								{#if tool.bestFor?.length}
									<span class="badge-hero">{tool.bestFor[0]}</span>
								{/if}
								{#if tool.affiliateAvailable}
									<span class="badge-hero badge-hero-accent">affiliate</span>
								{/if}
							</div>
							<h3 class="mt-4 text-3xl lg:text-4xl font-heading">{tool.name}</h3>
							<p class="mt-3 max-w-2xl text-surface/80 leading-relaxed">{tool.description}</p>
						</div>
						<div class="shrink-0 text-right">
							<p class="text-[10px] uppercase tracking-[0.25em] text-metal-300 font-mono">score</p>
							<p class="text-4xl font-mono font-bold text-accent">{tool.score ?? tool.trustScore ?? 0}</p>
						</div>
					</div>
					<div class="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] font-mono">
						<a href={toolHref(tool)} class="badge-hero">View tool</a>
						<a href={compareHref(tool, data.recommendations[1] ?? tool)} class="badge-hero">Compare</a>
						{#if tool.affiliateAvailable}
							<span class="badge-hero badge-hero-accent">Promotion visible</span>
						{/if}
					</div>
				</div>
			{/if}
		</div>

		<aside class="space-y-4">
			<div class="border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] rounded-sm p-4">
				<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">Monetization</p>
				<p class="mt-2 text-sm text-metal-500">
					Affiliate and promotion surfaces live here, clearly separated from ranking.
				</p>
				<div class="mt-4 flex items-center justify-between rounded-sm border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] px-3 py-2">
					<span class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">Promo block</span>
					<span class="text-sm font-mono font-bold text-metal-900">Active</span>
				</div>
			</div>

			<div class="border border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--metal-100)_6%)] rounded-sm p-4">
				<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">Disclosure</p>
				<p class="mt-2 text-sm text-metal-500">
					Some cards may contain affiliate links. Ranking priority remains independent.
				</p>
			</div>
		</aside>
	</section>

	<section class="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
		{#each data.recommendations as tool, index}
			<a
				href={toolHref(tool)}
				class={`group border border-metal-100 bg-surface rounded-sm p-5 transition-all hover:-translate-y-[2px] hover:border-metal-900 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] active:scale-[0.995] ${index === 0 ? 'xl:col-span-2' : ''}`}
			>
				<div class="flex items-start justify-between gap-4">
					<div class="min-w-0">
						<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">#{index + 1}</p>
						<h3 class="mt-1 text-xl font-semibold text-metal-900 font-heading">{tool.name}</h3>
						<p class="mt-2 text-sm text-metal-500">{tool.description}</p>
					</div>
					<p class="text-2xl font-mono font-bold text-metal-900">{tool.score ?? tool.trustScore ?? 0}</p>
				</div>

				<div class="mt-4 flex flex-wrap gap-2">
					<span class="badge-chip">{tool.category ?? 'general'}</span>
					{#if tool.bestFor?.length}
						<span class="badge-chip">{tool.bestFor[0]}</span>
					{/if}
					{#if tool.pricingModel}
						<span class="badge-chip">{tool.pricingModel}</span>
					{/if}
					{#if tool.affiliateAvailable}
						<span class="badge-chip badge-chip-accent">affiliate</span>
					{/if}
				</div>

				<div class="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] font-mono text-metal-500">
					<span>View</span>
					<span>{tool.category ?? 'general'}</span>
				</div>

				{#if data.recommendations[index + 1]}
					<div class="mt-4 border-t border-metal-100 pt-4">
						<div class="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-mono text-metal-900">
							<span>Compare</span>
							<span aria-hidden="true">→</span>
						</div>
					</div>
				{/if}
			</a>
		{/each}
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
