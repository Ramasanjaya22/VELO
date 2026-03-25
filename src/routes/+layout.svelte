<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();
</script>

<div class="bg-bg min-h-screen antialiased flex flex-col font-body">
	<Navbar />
	{@render children()}

	<footer class="mt-auto border-t border-metal-100 py-12 px-6">
		<div class="max-w-[1080px] mx-auto text-center">
			<pre class="font-mono text-[8px] text-metal-300 mb-4 inline-block text-left"
				>╦ ╦╔═╗╔╗    ╔═╗
║ ║╠═╝╠╩╗   ╠╦╝
╚═╝╩  ╚═╝───╩╚═</pre>
			<p class="text-[11px] text-metal-500 uppercase tracking-[0.2em] font-medium">
				AI tools ranked. Minimal by design.
			</p>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		background-color: var(--bg);
	}
</style>
