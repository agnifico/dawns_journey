<script lang="ts">
	export let label: string;
	export let current: number;
	export let initial: number | undefined = undefined;
	export let color: string = '#ccc';
	export let decimals: number = 0;

	$: delta = initial !== undefined ? current - initial : 0;
	$: hasDelta = delta !== 0;
	$: deltaClass = delta > 0 ? 'positive' : delta < 0 ? 'negative' : '';
	$: displayValue = decimals > 0 ? current.toFixed(decimals) : Math.round(current);
</script>

<div class="stat-display" style="--stat-color: {color}">
	<span class="stat-label">{label}</span>
	<span class="stat-value" class:has-delta={hasDelta} class:positive={delta > 0} class:negative={delta < 0}>
		{displayValue}
		{#if hasDelta}
			<span class="delta {deltaClass}">
				{delta > 0 ? '+' : ''}{decimals > 0 ? delta.toFixed(decimals) : Math.round(delta)}
			</span>
		{/if}
	</span>
</div>

<style>
	.stat-display {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: .5rem;
		font-size: 0.75rem;
		font-family: var(--font-family-pixel, monospace);
		background-color: #00000080;
	}

	.stat-label {
		color: var(--stat-color, #ccc);
		opacity: 0.9;
	}

	.stat-value {
		color: #eee;
		/* font-weight: 600; */
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.stat-value.positive {
		color: #90ee90;
	}

	.stat-value.negative {
		color: #ff6b6b;
	}

	.delta {
		font-size: 0.65rem;
		padding: 1px 3px;
		border-radius: 3px;
		font-weight: 400;
	}

	.delta.positive {
		background: rgba(144, 238, 144, 0.2);
		color: #90ee90;
	}

	.delta.negative {
		background: rgba(255, 107, 107, 0.2);
		color: #ff6b6b;
	}
</style>