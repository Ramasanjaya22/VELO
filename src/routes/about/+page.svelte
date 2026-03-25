<script lang="ts">
	import { fly } from 'svelte/transition';

	const workLinks = [
		{
			href: 'https://anywork.dev',
			label: 'anywork.dev',
			subtitle: 'AI Integration',
			icon: '/logos/anywork.svg'
		},
		{
			href: 'https://www.airainteractive.com',
			label: 'aira.interactive.com',
			subtitle: '3D Web Interactive',
			icon: 'https://www.airainteractive.com/icons/favicon-aira/favicon.ico'
		},
		{
			href: 'https://allgonabata.com',
			label: 'allgonabata.com',
			subtitle: 'Custom B2B Digital Creative Agency',
			icon: 'https://allgonabata.com/wp-content/uploads/2025/02/cropped-G-Profile-32x32.png'
		}
	];

	const featuredApplications = [
		{
			href: 'https://xenkio.com',
			label: 'Xenkio',
			subtitle: 'Featured application',
			icon: '/logos/xenkio.svg'
		},
		{
			href: 'https://typecade.com',
			label: 'Typecade',
			subtitle: 'Featured application',
			icon: '/logos/typecade.png'
		}
	];
</script>

<svelte:head>
	<title>About — VELO</title>
	<meta
		name="description"
		content="About VELO, the curated AI tools directory with clear ranking signals and minimal noise."
	/>
	<meta property="og:title" content="About — VELO" />
	<meta
		property="og:description"
		content="About VELO, the curated AI tools directory with clear ranking signals and minimal noise."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://velo-428.pages.dev/og-image.svg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="About — VELO" />
	<meta
		name="twitter:description"
		content="About VELO, the curated AI tools directory with clear ranking signals and minimal noise."
	/>
	<meta name="twitter:image" content="https://velo-428.pages.dev/og-image.svg" />
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
				{#each workLinks as work}
					<a href={work.href} target="_blank" rel="noopener noreferrer" class="group">
						<div
							class="border border-metal-100 p-6 flex flex-col items-center justify-center gap-3 h-24 transition-all duration-200 grayscale group-hover:grayscale-0 group-hover:scale-105 hover:shadow-[0_0_20px_rgba(0,230,118,0.3)]"
						>
							<img
								src={work.icon}
								alt={work.label}
								class="w-6 h-6 object-contain"
								loading="lazy"
								referrerpolicy="no-referrer"
							/>
							<div class="flex flex-col items-center leading-tight">
								<span class="font-mono text-sm text-metal-500">{work.label}</span>
								<span class="text-xs text-metal-500">{work.subtitle}</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>

		<div class="border-t border-metal-100 pt-8 mt-8">
			<div class="flex items-end justify-between gap-4 mb-4">
				<div>
					<p class="text-[10px] uppercase tracking-[0.3em] text-metal-500 font-mono">
						Featured Applications
					</p>
					<h2 class="mt-2 text-xl font-bold tracking-tight text-metal-900 font-display">
						Selected work and product highlights
					</h2>
				</div>
				<p class="max-w-[220px] text-sm text-metal-500 leading-relaxed">
					Small set of applications I want to keep visible without turning the page into a gallery.
				</p>
			</div>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{#each featuredApplications as app}
					<a href={app.href} target="_blank" rel="noopener noreferrer" class="group">
						<div
							class="border border-metal-100 bg-surface p-5 flex items-center gap-4 transition-all duration-200 hover:border-metal-900 hover:-translate-y-[1px] hover:shadow-[6px_6px_0px_var(--accent-dim)]"
						>
							<div
								class="size-12 border border-metal-100 bg-bg flex items-center justify-center rounded-sm overflow-hidden"
							>
								<img
									src={app.icon}
									alt={app.label}
									class="w-6 h-6 object-contain"
									loading="lazy"
									referrerpolicy="no-referrer"
								/>
							</div>
							<div class="min-w-0">
								<p class="text-[10px] uppercase tracking-[0.2em] text-metal-500 font-mono">
									{app.subtitle}
								</p>
								<p class="mt-1 text-base font-semibold text-metal-900">{app.label}</p>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</div>
</main>
