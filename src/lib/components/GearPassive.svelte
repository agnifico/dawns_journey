<script lang="ts">
	export let weaponName: string;
	export let passiveName: string;
	export let description: string;
	export let icon: string;
	export let view: 'normal' | 'mini' = 'normal';
</script>

<div class="gear-passive">
	{#if view !== 'mini'}
		<div class="gp-icon">
			<img src={icon} alt={weaponName} />
		</div>
	{/if}
	<div class="gp-body">
		{#if view !== 'mini'}
			<span class="gp-weapon">{weaponName} : {passiveName}</span>
		{:else}
			<span class="gp-weapon">{passiveName}</span>
		{/if}
		<!-- <span class="gp-name">{passiveName}</span> -->
		<span class="gp-desc">{description}</span>
	</div>
</div>

<style>
	.gear-passive {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 11px 13px 17px;
		border-radius: 8px;
		background: rgba(60, 160, 90, 0.12);
		background: rgba(68, 68, 68, 0.12);
		/* border: 1px solid rgba(83, 162, 105, 0.4); */
		border: 1px solid rgba(60, 160, 90, 0.28);
		box-shadow: #00000056 0 -6px 0 3px inset;
		align-items: center;
	}

	.gp-icon {
		width: 42px;
		height: 42px;
		min-width: 42px;
		border-radius: 6px;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(60, 160, 90, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.gp-icon img {
		width: 28px;
		height: 28px;
		image-rendering: pixelated;
	}

	.gp-body {
		display: flex;
		flex-direction: column;
		gap: 3px;
		flex: 1;
	}

	.gp-weapon {
		font-family: var(--font-family-pixel);
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgba(60, 180, 90, 0.5);
	}

	.gp-name {
		font-family: var(--font-family-pixel);
		font-size: 0.92rem;
		font-weight: 600;
		color: #50c878;
		line-height: 1.2;
	}

	.gp-desc {
		font-family: var(--font-family-pixel);
		font-size: 0.78rem;
		color: var(--text-muted);
		line-height: 1.5;
		margin-top: 2px;
	}
</style>
