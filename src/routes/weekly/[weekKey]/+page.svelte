<script lang="ts">
	import { page } from '$app/state';

	const title = $derived.by(() => `Weekly ${page.params.weekKey} — VELO`);
	const description = $derived.by(
		() => `Snapshot of ranking movement and trend data for week ${page.params.weekKey}.`
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="article" />
	<meta property="og:image" content="https://velo-428.pages.dev/og-image.svg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="https://velo-428.pages.dev/og-image.svg" />
</svelte:head>

<main class="max-w-[960px] mx-auto px-6 py-12">
	<h1 class="text-4xl font-semibold text-metal-900 font-heading">Weekly {page.params.weekKey}</h1>
	<p class="mt-3 text-metal-500">Snapshot of ranking movement and trend data.</p>
</main>
