<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Category — VELO</title>
</svelte:head>

<main class="max-w-[960px] mx-auto px-6 py-12">
	<h1 class="text-4xl font-semibold text-metal-900 font-heading">Category: {page.params.slug}</h1>
	<p class="mt-3 text-metal-500">Ranked tools for this category.</p>
</main>
