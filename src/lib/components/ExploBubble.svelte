<script lang="ts">
	export let name: string;
	export let level: number | undefined = undefined;
	export let hotkey: string | undefined = undefined;
</script>

<div class="eb {name.toLowerCase()}">
	<div class="eb-icon">
		<img src={`/images/${name.toLowerCase()}.png`} alt={name} />
	</div>
	<span class="eb-label">{name.toUpperCase()}</span>
	{#if level !== undefined}
		<span class="eb-count">{level}</span>
	{/if}
	{#if hotkey}
		<span class="eb-hotkey">{hotkey.toUpperCase()}</span>
	{/if}
</div>

<style>
	.eb {
		display: inline-flex;
		align-items: center;
		gap: 0;
		border-radius: 5px;
		overflow: hidden;
		font-family: var(--font-family-pixel);
		font-size: 8px;
		letter-spacing: 0.02em;
		white-space: nowrap;
		border: 1px solid rgba(0, 0, 0, 0.3);
	}

	.eb-icon {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		background: rgba(0, 0, 0, 0.25);
	}

	.eb-icon img {
		width: 16px;
		height: 16px;
		image-rendering: pixelated;
	}

	.eb-label {
		padding: 0 7px;
		line-height: 28px;
		height: 28px;
		display: flex;
		align-items: center;
	}

	.eb-count {
		padding: 0 7px;
		height: 28px;
		display: flex;
		align-items: center;
		background: rgba(0, 0, 0, 0.25);
		font-size: 9px;
		border-left: 1px solid rgba(0, 0, 0, 0.2);
	}

	.eb-hotkey {
		padding: 0 5px;
		height: 28px;
		display: flex;
		align-items: center;
		font-size: 6px;
		opacity: 0.5;
		border-left: 1px solid rgba(0, 0, 0, 0.15);
	}

	/* Element fills — darkened ~40% from raw game values */
	.fire  { background: #7a2610; color: #ffb898; border-color: #9a3618; }
	.water { background: #14425e; color: #90d0f8; border-color: #1a5878; }
	.earth { background: #1a4a28; color: #80d898; border-color: #226032; }
	.wind  { background: #0e5c68; color: #78e8f8; border-color: #147888; }
	.light { background: #5a4a08; color: #fce878; border-color: #786210; }
	.dark  { background: #2e1a50; color: #e8a8f8; border-color: #3e2468; }
</style>