<script lang="ts">
	export let value: number | undefined = undefined;
	export let required: number | undefined = undefined;
	export let playerValue: number | undefined = undefined;

	$: isRequiredMode = required !== undefined;
	$: isLocked = isRequiredMode && playerValue !== undefined && playerValue < required!;
	$: displayNumber = isRequiredMode ? required : value;
	$: label = isRequiredMode ? 'REQUIRES WR' : 'WORLD RESONANCE';
</script>

<div class="wr-badge" class:locked={isLocked}>
	<span class="wr-badge-label">◈ {label}</span>
	<span class="wr-badge-num">{displayNumber}</span>
	{#if isLocked}
		<span class="wr-lock-icon">✕</span>
	{/if}
</div>

<style>
	.wr-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 12px;
		border-radius: 6px;
		background: rgba(200, 169, 110, 0.10);
		border: 1px solid rgba(200, 169, 110, 0.25);
		font-family: var(--font-family-pixel);
		white-space: nowrap;
	}

	.wr-badge-label {
		font-size: 0.75rem;
		letter-spacing: 0.08em;
		color: #8a7048;
	}

	.wr-badge-num {
		background: #c8a96e;
		color: #1a1006;
		padding: 2px 8px;
		border-radius: 3px;
		font-size: 0.75rem;
		font-weight: 700;
	}

	.wr-lock-icon {
		font-size: 0.75rem;
		color: #c06050;
		margin-left: 2px;
	}

	/* Locked — red family, fully legible */
	.locked {
		background: rgba(180, 50, 40, 0.10);
		border-color: rgba(200, 80, 60, 0.30);
	}

	.locked .wr-badge-label {
		color: #a06050;
	}

	.locked .wr-badge-num {
		background: #8a2a1a;
		color: #ffb8a0;
	}
</style>