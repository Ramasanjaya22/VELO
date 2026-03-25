<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { Icon } from 'svelte-icon';
	import layersIcon from '$lib/icons/layers.svg?raw';
	import crownIcon from '$lib/icons/crown.svg?raw';
	import boltIcon from '$lib/icons/bolt.svg?raw';

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	const asciiWordmark = ['╦ ╦╔═╗╔╗    ╔═╗', '║ ║╠═╝╠╩╗   ╠╦╝', '╚═╝╩  ╚═╝───╩╚═'];
</script>

<header class="sticky top-0 z-50 bg-bg/90 backdrop-blur-sm border-b border-metal-100 h-16 w-full flex justify-center">
	<div class="w-full max-w-[1240px] px-6 flex items-center justify-between h-full">
		<a href="/" class="flex items-center gap-4 text-metal-900 group">
			<div class="size-10 border border-metal-100 bg-surface rounded-sm flex items-center justify-center shrink-0 group-hover:border-metal-900 transition-colors">
				<Icon data={layersIcon} size="18px" color="currentColor" />
			</div>
			{#if mounted}
				<div class="flex flex-col gap-0 scale-75 origin-left group-hover:text-accent transition-colors" in:fly={{ x: -10, duration: 400 }}>
					{#each asciiWordmark as line}
						<pre class="font-mono leading-none m-0 text-[10px]">{line}</pre>
					{/each}
				</div>
			{/if}
			<h1 class="text-xl font-bold tracking-[-0.02em] font-display">VELO</h1>
		</a>

		<div class="flex items-center gap-6">
			<nav class="hidden md:flex items-center gap-4 text-sm font-medium text-metal-500">
				<a href="/" class="inline-flex items-center gap-2 hover:text-metal-900 transition-colors">
					<Icon data={layersIcon} size="14px" color="currentColor" />
					Today
				</a>
				<a href="/best-for/freelancers" class="inline-flex items-center gap-2 hover:text-metal-900 transition-colors">
					<span class="size-5 inline-flex items-center justify-center"><Icon data={crownIcon} size="12px" color="currentColor" /></span>
					Best For
				</a>
				<a href="/archive" class="inline-flex items-center gap-2 hover:text-metal-900 transition-colors">
					<span class="size-5 inline-flex items-center justify-center">
						<Icon data={boltIcon} size="12px" color="currentColor" />
					</span>
					Bookmarks
				</a>
				<a href="/about" class="hover:text-metal-900 transition-colors">About</a>
			</nav>

			<a
				href="/submit"
				class="flex items-center justify-center rounded-sm bg-metal-900 text-white h-10 px-6 font-medium text-sm transition-colors hover:bg-metal-700 active:bg-accent active:text-metal-900"
			>
				Submit
			</a>
		</div>
	</div>
</header>

<style>
	.sticky {
		backdrop-filter: blur(8px);
		background-color: rgba(250, 250, 250, 0.8);
	}
</style>
