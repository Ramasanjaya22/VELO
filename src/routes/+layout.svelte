<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Toast from '$lib/components/Toast.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<meta
		name="robots"
		content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
	/>
	<link rel="canonical" href="https://velo-428.pages.dev/" />
</svelte:head>

<div class="bg-bg min-h-screen antialiased flex flex-col font-body">
	<Navbar />
	{@render children()}
	<Toast />

	<footer
		class="mt-auto border-t border-metal-100 bg-[color-mix(in_srgb,var(--surface)_94%,var(--accent)_6%)] px-4 py-6 sm:px-6 lg:px-8"
	>
		<div class="mx-auto max-w-[1280px]">
			<div
				class="footer-shell grid gap-4 overflow-hidden rounded-sm border border-metal-100 bg-surface lg:grid-cols-[0.85fr_1.15fr]"
			>
				<div
					class="footer-copy flex min-h-[19rem] flex-col justify-between gap-10 p-6 sm:p-8 lg:min-h-[28rem] lg:p-10"
				>
					<div class="space-y-5">
						<p
							class="footer-kicker text-[10px] uppercase tracking-[0.35em] text-metal-500 font-mono"
						>
							Curated AI tools directory
						</p>
						<p class="footer-wordmark">VELO</p>
						<p class="footer-tagline max-w-xl text-sm text-metal-500 sm:text-base">
							Fast discovery. Clean ranking. Minimal noise.
						</p>
					</div>

					<div class="space-y-3">
						<p class="text-[10px] uppercase tracking-[0.25em] text-metal-500 font-mono">Sitemap</p>
						<div class="grid gap-2 text-sm text-metal-700">
							<a href="/" class="footer-link">Home / Trending</a>
							<a href="/archive" class="footer-link">Archive</a>
							<a href="/best-for/freelancers" class="footer-link">Best For Freelancers</a>
							<a href="/about" class="footer-link">About</a>
							<a href="/submit" class="footer-link">Submit Tool</a>
						</div>
					</div>
				</div>

				<div
					class="footer-hero relative min-h-[20rem] overflow-hidden bg-[color-mix(in_srgb,var(--surface)_88%,var(--accent)_12%)] lg:min-h-[28rem]"
				>
					<div class="footer-hero-media">
						<picture>
							<source srcset="/hero-image/hero-image_4x.webp" media="(min-width: 1400px)" />
							<source srcset="/hero-image/hero-image_3x.webp" media="(min-width: 1024px)" />
							<source srcset="/hero-image/hero-image_2x.webp" media="(min-width: 640px)" />
							<img
								src="/hero-image/hero-image_1x.webp"
								alt="VELO curated AI tools directory hero visual"
								class="footer-hero-image"
								loading="lazy"
								decoding="async"
							/>
						</picture>
					</div>
					<div class="footer-hero-overlay"></div>
					<div class="footer-hero-label">
						<span class="footer-hero-line"></span>
						<span class="footer-hero-text">Editorial visual</span>
					</div>
				</div>
			</div>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		background-color: var(--bg);
	}

	.footer-link {
		position: relative;
		width: fit-content;
		font-family: var(--font-heading);
		font-size: clamp(1rem, 1.4vw, 1.1rem);
		letter-spacing: -0.03em;
		transition:
			color 180ms ease,
			transform 180ms ease;
	}

	.footer-link:hover {
		color: var(--metal-900);
		transform: translateX(2px);
	}

	.footer-link::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: -1px;
		width: 100%;
		height: 1px;
		background: linear-gradient(90deg, var(--accent), transparent);
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 180ms ease;
	}

	.footer-link:hover::after {
		transform: scaleX(1);
	}

	.footer-shell {
		box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
	}

	.footer-copy {
		position: relative;
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--surface) 98%, var(--accent) 2%),
				var(--surface)
			),
			var(--surface);
	}

	.footer-copy::after {
		content: '';
		position: absolute;
		inset: auto 0 0 0;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent,
			color-mix(in srgb, var(--accent) 35%, transparent),
			transparent
		);
	}

	.footer-hero-media {
		position: absolute;
		inset: 0;
	}

	.footer-hero-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		filter: saturate(0.9) contrast(1.03);
	}

	.footer-hero-overlay {
		content: '';
		position: absolute;
		inset: 0;
		background:
			linear-gradient(180deg, color-mix(in srgb, var(--surface) 10%, transparent), transparent 28%),
			linear-gradient(180deg, transparent 42%, color-mix(in srgb, var(--bg) 92%, transparent));
		pointer-events: none;
	}

	.footer-hero-label {
		position: absolute;
		left: 1rem;
		bottom: 1rem;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.55rem 0.7rem;
		border: 1px solid color-mix(in srgb, var(--metal-900) 12%, transparent);
		background: color-mix(in srgb, var(--surface) 78%, transparent);
		backdrop-filter: blur(6px);
		border-radius: 0.125rem;
	}

	.footer-hero-line {
		width: 1.8rem;
		height: 1px;
		background: linear-gradient(90deg, var(--accent), transparent);
	}

	.footer-hero-text {
		font-family: var(--font-mono);
		font-size: 0.62rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--metal-700);
	}

	.footer-wordmark {
		font-family: var(--font-heading);
		font-size: clamp(4rem, 8vw, 6.5rem);
		line-height: 0.88;
		font-weight: 700;
		letter-spacing: -0.09em;
		color: var(--metal-900);
	}

	.footer-tagline {
		max-width: 28rem;
	}

	@media (max-width: 1024px) {
		.footer-copy {
			min-height: auto;
		}
	}
</style>
