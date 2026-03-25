<script lang="ts">
	interface Props {
		scores: {
			demandScore: number;
			affiliateReadinessScore: number;
			conversionFitScore: number;
			trustScore: number;
			useCaseRelevanceScore: number;
			contentOpportunityScore: number;
			differentiationScore: number;
		};
		benchmark?: number;
		size?: number;
	}

	let { scores, benchmark = 0, size = 280 }: Props = $props();

	const labels = ['Demand', 'Affiliate', 'Conversion', 'Trust', 'Use Case', 'Content', 'Diff'];

	const values = $derived([
		scores.demandScore,
		scores.affiliateReadinessScore,
		scores.conversionFitScore,
		scores.trustScore,
		scores.useCaseRelevanceScore,
		scores.contentOpportunityScore,
		scores.differentiationScore
	]);

	const center = $derived(size / 2);
	const maxRadius = $derived(size / 2 - 40);
	const angleStep = $derived((2 * Math.PI) / 7);
	const startAngle = -Math.PI / 2;

	function polarToCartesian(value: number, index: number) {
		const angle = startAngle + index * angleStep;
		const radius = (value / 100) * maxRadius;
		return {
			x: center + radius * Math.cos(angle),
			y: center + radius * Math.sin(angle)
		};
	}

	const points = $derived(values.map((v, i) => polarToCartesian(v, i)));
	const polygonPoints = $derived(points.map((p) => `${p.x},${p.y}`).join(' '));

	// Grid circles at 25%, 50%, 75%, 100%
	const gridLevels = [25, 50, 75, 100];
</script>

<div class="radar-chart">
	<svg width={size} height={size} viewBox="0 0 {size} {size}">
		<!-- Grid circles -->
		{#each gridLevels as level}
			{@const r = (level / 100) * maxRadius}
			<circle cx={center} cy={center} {r} fill="none" stroke="var(--metal-100)" stroke-width="1" />
		{/each}

		<!-- Axis lines -->
		{#each values as _, i}
			{@const endpoint = polarToCartesian(100, i)}
			<line
				x1={center}
				y1={center}
				x2={endpoint.x}
				y2={endpoint.y}
				stroke="var(--metal-100)"
				stroke-width="1"
			/>
		{/each}

		<!-- Benchmark circle (if provided) -->
		{#if benchmark > 0}
			{@const r = (benchmark / 100) * maxRadius}
			<circle
				cx={center}
				cy={center}
				{r}
				fill="none"
				stroke="var(--metal-300)"
				stroke-width="1"
				stroke-dasharray="4 4"
			/>
		{/if}

		<!-- Score polygon -->
		<polygon
			points={polygonPoints}
			fill="var(--accent-dim)"
			fill-opacity="0.25"
			stroke="var(--accent-dim)"
			stroke-width="2"
		/>

		<!-- Data points -->
		{#each points as point, i}
			<circle
				cx={point.x}
				cy={point.y}
				r="4"
				fill="var(--accent-dim)"
				stroke="var(--surface)"
				stroke-width="2"
			/>
		{/each}

		<!-- Labels -->
		{#each labels as label, i}
			{@const pos = polarToCartesian(100, i)}
			{@const offsetX = pos.x > center ? 8 : pos.x < center ? -8 : 0}
			{@const offsetY = pos.y > center ? 8 : pos.y < center ? -8 : 0}
			<text
				x={pos.x + offsetX}
				y={pos.y + offsetY}
				text-anchor={pos.x > center ? 'start' : pos.x < center ? 'end' : 'middle'}
				dominant-baseline="middle"
				font-size="10"
				font-family="var(--font-mono)"
				fill="var(--metal-500)"
			>
				{label}
			</text>
		{/each}
	</svg>
</div>

<style>
	.radar-chart {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
