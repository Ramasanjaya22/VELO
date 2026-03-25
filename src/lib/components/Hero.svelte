<script lang="ts">
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	let mounted = $state(false);
	let lineIndex = $state(0);

	onMount(() => {
		mounted = true;
		const interval = setInterval(() => {
			lineIndex = (lineIndex + 1) % 3;
		}, 800);
		return () => clearInterval(interval);
	});

	const asciiWordmark = ['╦ ╦╔═╗╔╗    ╔═╗', '║ ║╠═╝╠╩╗   ╠╦╝', '╚═╝╩  ╚═╝───╩╚═'];

	const asciiCursor = '█';
</script>

{#if mounted}
	<header class="hero" in:fly={{ y: 20, duration: 600 }}>
		<h1 class="sr-only">VELO - GitHub Trending Ranked</h1>
		<div class="ascii-container" aria-hidden="true">
			{#each asciiWordmark as line, i (i)}
				<pre class="ascii-line" style="animation-delay: {i * 100}ms">{line}</pre>
			{/each}
			<span class="cursor" class:blink={true}>{asciiCursor}</span>
		</div>

		<p class="tagline">github trending. ranked. fast.</p>

		<div class="meta-bar" aria-label="Data source information">
			<span class="meta-item">source: github</span>
			<span class="meta-dot"></span>
			<span class="meta-item">frequency: weekly</span>
			<span class="meta-dot"></span>
			<span class="meta-item">curated: ai-scored</span>
		</div>
	</header>
{/if}

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.hero {
		text-align: left;
		padding: clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem) 2rem;
		max-width: 900px;
		margin: 0 auto;
		position: relative;
	}

	.ascii-container {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0;
		margin-bottom: clamp(1rem, 3vw, 1.5rem);
		position: relative;
	}

	.ascii-line {
		font-family: var(--font-mono);
		font-size: clamp(1.2rem, 4vw, 2.2rem);
		line-height: 1.2;
		color: var(--metal-900);
		margin: 0;
		letter-spacing: 0.02em;
		opacity: 0;
		animation: reveal 0.4s ease-out forwards;
	}

	@keyframes reveal {
		from {
			opacity: 0;
			transform: translateX(-8px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.cursor {
		font-family: var(--font-mono);
		font-size: clamp(1.2rem, 4vw, 2.2rem);
		color: var(--accent-dim);
		margin-left: 0.1em;
		animation: blink 1s step-end infinite;
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0;
		}
	}

	.tagline {
		font-family: var(--font-body);
		font-size: clamp(0.8rem, 2vw, 1rem);
		color: var(--metal-500);
		margin: clamp(0.5rem, 2vw, 1rem) 0 clamp(1.5rem, 4vw, 2.5rem);
		letter-spacing: 0.15em;
		text-transform: lowercase;
		font-weight: 400;
	}

	.meta-bar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-family: var(--font-mono);
		font-size: clamp(0.55rem, 1.5vw, 0.7rem);
		color: var(--metal-300);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.meta-dot {
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: var(--metal-300);
	}

	@media (max-width: 640px) {
		.hero {
			text-align: left;
			padding: 2rem 1rem 1.5rem;
		}

		.ascii-container {
			align-items: flex-start;
		}

		.meta-bar {
			flex-wrap: wrap;
			gap: 0.5rem;
		}

		.meta-dot {
			display: none;
		}
	}
</style>
