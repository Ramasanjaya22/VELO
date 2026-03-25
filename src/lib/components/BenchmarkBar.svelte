<script lang="ts">
	interface BenchmarkItem {
		label: string;
		score: number;
		isThisTool?: boolean;
	}

	interface Props {
		items: BenchmarkItem[];
		maxScore?: number;
	}

	let { items, maxScore = 100 }: Props = $props();

	function getBarWidth(score: number): string {
		return `${(score / maxScore) * 100}%`;
	}

	function getDelta(item: BenchmarkItem, allItems: BenchmarkItem[]): string {
		if (!item.isThisTool && allItems.length > 0) {
			const thisTool = allItems.find((i) => i.isThisTool);
			if (thisTool) {
				const delta = item.score - thisTool.score;
				return delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);
			}
		}
		return '';
	}
</script>

<div class="benchmark-bar">
	<div class="benchmark-track">
		{#each items as item}
			<div class="benchmark-item" class:is-this-tool={item.isThisTool}>
				<div class="benchmark-label-row">
					<span class="benchmark-label">{item.label}</span>
					<span class="benchmark-score">{item.score.toFixed(1)}</span>
					{#if !item.isThisTool && getDelta(item, items)}
						<span
							class="benchmark-delta"
							class:positive={item.score > (items.find((i) => i.isThisTool)?.score ?? 0)}
						>
							({getDelta(item, items)})
						</span>
					{/if}
				</div>
				<div class="benchmark-bar-track">
					<div
						class="benchmark-bar-fill"
						class:is-this-tool={item.isThisTool}
						style="width: {getBarWidth(item.score)}"
					></div>
					{#if item.isThisTool}
						<div class="benchmark-marker" style="left: {getBarWidth(item.score)}"></div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.benchmark-bar {
		width: 100%;
	}

	.benchmark-item {
		margin-bottom: 1rem;
	}

	.benchmark-item:last-child {
		margin-bottom: 0;
	}

	.benchmark-label-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.35rem;
	}

	.benchmark-label {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		font-family: var(--font-mono);
		color: var(--metal-500);
	}

	.benchmark-score {
		font-size: 0.85rem;
		font-family: var(--font-mono);
		font-weight: 700;
		color: var(--metal-900);
	}

	.benchmark-delta {
		font-size: 0.65rem;
		font-family: var(--font-mono);
		color: var(--metal-500);
	}

	.benchmark-delta.positive {
		color: var(--accent-dim);
	}

	.benchmark-bar-track {
		position: relative;
		height: 0.5rem;
		background: var(--metal-100);
		border-radius: 0.125rem;
		overflow: visible;
	}

	.benchmark-bar-fill {
		height: 100%;
		background: var(--metal-300);
		border-radius: 0.125rem;
		transition: width 600ms ease-out;
	}

	.benchmark-bar-fill.is-this-tool {
		background: linear-gradient(
			90deg,
			var(--accent-dim),
			color-mix(in srgb, var(--accent-dim) 55%, var(--metal-900))
		);
	}

	.benchmark-marker {
		position: absolute;
		top: -3px;
		width: 2px;
		height: calc(100% + 6px);
		background: var(--metal-900);
		transform: translateX(-50%);
	}
</style>
