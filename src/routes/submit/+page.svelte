<script lang="ts">
	import { fly } from 'svelte/transition';

	let repoUrl = $state('');

	const githubLogo = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-6"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>`;
</script>

<svelte:head>
	<title>Submit — VELO</title>
</svelte:head>

<main class="w-full max-w-[1080px] mx-auto px-6 pt-[120px] pb-24 flex flex-col items-center">
	<div class="w-full max-w-[480px]" in:fly={{ y: 20, duration: 600 }}>
		<h1 class="text-2xl font-bold tracking-tight text-metal-900 mb-2 font-heading">
			Submit Tool
		</h1>
		<p class="text-metal-500 mb-10 text-lg font-body">
			Paste a public AI tool URL to add it to the leaderboard.
		</p>

		<div class="flex flex-col gap-8">
			<div class="relative">
				<div
					class="absolute left-6 top-1/2 -translate-y-1/2 text-metal-500 pointer-events-none"
				>
					<span class="material-symbols-outlined text-[20px]">link</span>
				</div>
				<input
					bind:value={repoUrl}
					type="text"
					placeholder="https://example.com/tool"
					class="w-full h-[56px] pl-14 pr-6 bg-surface border border-metal-100 rounded-sm font-medium text-metal-900 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-metal-500 font-body"
				/>
			</div>

			{#if repoUrl.includes('http')}
				<div
					class="bg-surface border border-metal-100 rounded-sm p-8 flex flex-col gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
					transition:fly={{ y: 20, duration: 400 }}
				>
					<div class="flex items-center gap-4">
						<div class="size-10 bg-bg rounded-sm flex items-center justify-center overflow-hidden border border-metal-100">
							<span class="text-metal-900">
								{@html githubLogo}
							</span>
						</div>
						<div class="flex flex-col">
							<span class="text-metal-900 font-bold text-lg font-heading">
								{repoUrl.replace(/^https?:\/\//, '') || 'tool'}
							</span>
							<div class="flex items-center gap-1 text-metal-500 text-xs font-mono uppercase tracking-widest font-bold">
								<span class="material-symbols-outlined text-[14px]">star</span>
								<span>214K</span>
							</div>
						</div>
					</div>
					<p class="text-metal-500 text-sm leading-relaxed font-body">
						Short tool description goes here.
					</p>
				</div>

				<button
					class="w-full h-[48px] bg-metal-900 text-white rounded-sm font-bold text-sm uppercase tracking-widest hover:bg-metal-700 active:bg-accent active:text-metal-900 transition-all font-heading"
				>
					Submit to Leaderboard
				</button>
			{/if}
		</div>

		<!-- submission guidelines -->
		<div class="w-full mt-32 pt-16 border-t border-metal-100 grid grid-cols-1 md:grid-cols-3 gap-12 font-body text-sm text-metal-500">
			<div class="flex flex-col gap-4">
				<h4 class="text-metal-900 font-bold font-heading uppercase tracking-widest text-[11px]">Transparency</h4>
				<p>Submit public tools with a clear landing page, pricing, and trust signals.</p>
			</div>
			<div class="flex flex-col gap-4">
				<h4 class="text-metal-900 font-bold font-heading uppercase tracking-widest text-[11px]">Utility First</h4>
				<p>Our scoring algorithm favors tools with clear use cases, trust, and affiliate readiness.</p>
			</div>
			<div class="flex flex-col gap-4">
				<h4 class="text-metal-900 font-bold font-heading uppercase tracking-widest text-[11px]">Active Curation</h4>
				<p>Duplicates are automatically merged. If the tool is already listed, your submission will be treated as a signal.</p>
			</div>
		</div>
	</div>
</main>
