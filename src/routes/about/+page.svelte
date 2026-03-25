<script lang="ts">
	import { fly } from 'svelte/transition';
</script>

<svelte:head>
	<title>About — VELO</title>
</svelte:head>

<main class="w-full max-w-[1080px] mx-auto px-6 pt-24 pb-24 flex flex-col items-center">
	<div class="w-full max-w-[600px] flex flex-col gap-8" in:fly={{ y: 20, duration: 600 }}>
		<div>
			<h1 class="text-4xl font-bold tracking-tight text-metal-900 mb-6 font-display">About VELO</h1>
			<p class="text-metal-500 text-lg leading-relaxed mb-6 font-body">
				VELO is a curated daily leaderboard for discovering high-signal open source projects. It is
				an exploration of "Terminal Brutalism" in web design, combining raw aesthetics with
				functional utility.
			</p>
			<p class="text-metal-500 text-lg leading-relaxed font-body">
				Every project listed on VELO is ranked based on a composite score representing rapid growth,
				community engagement, and code quality.
			</p>
		</div>

		<div class="border-t border-metal-100 pt-8 mt-8">
			<h2 class="text-xl font-bold tracking-tight text-metal-900 mb-4 font-display">
				How We Score
			</h2>
			<ul class="flex flex-col gap-3 font-body text-metal-500 text-sm">
				<li class="flex items-center gap-2">
					<span class="text-accent font-bold">40%</span> Stars Growth
				</li>
				<li class="flex items-center gap-2">
					<span class="text-accent font-bold">15%</span> Performance Language Bias (Rust, Go, Zig, etc.)
				</li>
				<li class="flex items-center gap-2">
					<span class="text-accent font-bold">15%</span> Forks
				</li>
				<li class="flex items-center gap-2">
					<span class="text-accent font-bold">10%</span> Topic Relevance
				</li>
				<li class="flex items-center gap-2">
					<span class="text-accent font-bold">10%</span> Description Quality
				</li>
				<li class="flex items-center gap-2">
					<span class="text-accent font-bold">10%</span> Contributors
				</li>
			</ul>
		</div>

		<div class="border-t border-metal-100 pt-8 mt-8">
			<h2 class="text-xl font-bold tracking-tight text-metal-900 mb-4 font-display">My Work</h2>
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<a href="https://anywork.dev" target="_blank" rel="noopener noreferrer" class="group">
					<div
						class="border border-metal-100 p-6 flex items-center justify-center h-24 transition-all duration-200 grayscale group-hover:grayscale-0 group-hover:scale-105 hover:shadow-[0_0_20px_rgba(0,230,118,0.3)]"
					>
						<span class="font-mono text-sm text-metal-500">anywork.dev</span>
					</div>
				</a>
				<a href="https://aira.interactive" target="_blank" rel="noopener noreferrer" class="group">
					<div
						class="border border-metal-100 p-6 flex items-center justify-center h-24 transition-all duration-200 grayscale group-hover:grayscale-0 group-hover:scale-105 hover:shadow-[0_0_20px_rgba(0,230,118,0.3)]"
					>
						<span class="font-mono text-sm text-metal-500">aira.interactive</span>
					</div>
				</a>
				<a href="https://algonabata.com" target="_blank" rel="noopener noreferrer" class="group">
					<div
						class="border border-metal-100 p-6 flex items-center justify-center h-24 transition-all duration-200 grayscale group-hover:grayscale-0 group-hover:scale-105 hover:shadow-[0_0_20px_rgba(0,230,118,0.3)]"
					>
						<span class="font-mono text-sm text-metal-500">algonabata.com</span>
					</div>
				</a>
			</div>
		</div>

		<div class="border-t border-metal-100 pt-8 mt-8">
			<h2 class="text-xl font-bold tracking-tight text-metal-900 mb-4 font-display">
				Featured Applications
			</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<a href="https://xenkio.com" target="_blank" rel="noopener noreferrer" class="group">
					<div
						class="border border-metal-100 p-6 flex items-center justify-center h-24 transition-all duration-200 grayscale group-hover:grayscale-0 group-hover:scale-105 hover:shadow-[0_0_20px_rgba(0,230,118,0.3)]"
					>
						<span class="font-mono text-sm text-metal-500">xenkio.com</span>
					</div>
				</a>
				<a href="https://typecode.com" target="_blank" rel="noopener noreferrer" class="group">
					<div
						class="border border-metal-100 p-6 flex items-center justify-center h-24 transition-all duration-200 grayscale group-hover:grayscale-0 group-hover:scale-105 hover:shadow-[0_0_20px_rgba(0,230,118,0.3)]"
					>
						<span class="font-mono text-sm text-metal-500">typecode.com</span>
					</div>
				</a>
			</div>
		</div>
	</div>
</main>
