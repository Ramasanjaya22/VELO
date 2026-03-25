<script lang="ts">
	import { page } from '$app/state';

	const categoryName = $derived.by(() =>
		page.params.slug
			.replace(/-/g, ' ')
			.replace(/\b\w/g, (char) => char.toUpperCase())
	);
</script>

<svelte:head>
	<title>{categoryName} — VELO</title>
	<meta
		name="description"
		content={`Ranked AI tools in the ${categoryName.toLowerCase()} category on VELO.`}
	/>
	<meta property="og:title" content={`${categoryName} — VELO`} />
	<meta
		property="og:description"
		content={`Ranked AI tools in the ${categoryName.toLowerCase()} category on VELO.`}
	/>
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://velo-428.pages.dev/og-image.svg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={`${categoryName} — VELO`} />
	<meta
		name="twitter:description"
		content={`Ranked AI tools in the ${categoryName.toLowerCase()} category on VELO.`}
	/>
	<meta name="twitter:image" content="https://velo-428.pages.dev/og-image.svg" />
</svelte:head>

<main class="max-w-[960px] mx-auto px-6 py-12">
	<h1 class="text-4xl font-semibold text-metal-900 font-heading">Category: {page.params.slug}</h1>
	<p class="mt-3 text-metal-500">Ranked tools for this category.</p>
</main>
