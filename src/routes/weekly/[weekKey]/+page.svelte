<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Weekly — VELO</title>
</svelte:head>

<main class="max-w-[960px] mx-auto px-6 py-12">
	<h1 class="text-4xl font-semibold text-metal-900 font-heading">Weekly {page.params.weekKey}</h1>
	<p class="mt-3 text-metal-500">Snapshot of ranking movement and trend data.</p>
</main>
