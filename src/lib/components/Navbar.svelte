<script lang="ts">
	import { Icon } from 'svelte-icon';
	import layersIcon from '$lib/icons/layers.svg?raw';
</script>

<header class="site-header sticky top-0 z-50 flex h-16 w-full justify-center border-b border-metal-100 bg-bg/88">
	<div class="flex h-full w-full max-w-[1240px] items-center justify-between px-6">
		<a href="/" class="flex items-center gap-4 text-metal-900 group">
			<div class="logo-mark size-10 shrink-0 border border-metal-900 bg-metal-900 flex items-center justify-center transition-all duration-300 group-hover:-translate-y-[1px]">
				<Icon data={layersIcon} size="18px" color="currentColor" />
			</div>
			<h1 class="logo-title text-xl font-bold tracking-[-0.08em] font-display">VELO</h1>
		</a>

		<div class="flex items-center gap-6">
			<nav class="hidden items-center gap-5 text-sm font-medium text-metal-500 md:flex">
				<a href="/" class="nav-link nav-link-active">Today</a>
				<a href="/best-for/freelancers" class="nav-link">Best For</a>
				<a href="/archive" class="nav-link">Archive</a>
				<a href="/about" class="nav-link">About</a>
			</nav>

			<a
				href="/submit"
				class="submit-cta flex h-10 items-center justify-center rounded-sm border border-metal-900 bg-accent px-5 text-sm font-medium text-metal-900 transition-all hover:-translate-y-[1px] hover:bg-accent-dim active:translate-y-0"
			>
				Submit tool
			</a>
		</div>
	</div>
</header>

<style>
	.site-header {
		backdrop-filter: blur(8px);
		background-color: color-mix(in srgb, var(--bg) 88%, transparent);
	}

	.logo-mark {
		color: var(--accent);
	}

	.logo-title {
		color: var(--metal-900);
	}

	.group:hover .logo-title {
		color: var(--accent-dim);
	}

	.nav-link {
		position: relative;
		transition: color 180ms ease;
	}

	.nav-link:hover {
		color: var(--metal-900);
	}

	.nav-link::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: -0.2rem;
		width: 100%;
		height: 1px;
		background: linear-gradient(90deg, var(--accent), transparent);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 180ms ease;
	}

	.nav-link:hover::after {
		transform: scaleX(1);
	}

	.nav-link-active {
		color: var(--metal-900);
	}

	.nav-link-active::after {
		transform: scaleX(1);
	}

	.submit-cta {
		box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
	}

	.submit-cta:hover {
		box-shadow: 3px 3px 0px var(--accent);
	}
</style>
