<script lang="ts">
	/**
	 * CurrencyBar — sticky strip at the top of the inventory page.
	 * Reads argentum from player.argentum (direct field).
	 * Reads arena_gold, arena_silver, time_point from inventory stackables.
	 * Reads levelUpPoints from player.levelUpPoints.
	 */
	import { playerStore } from '$lib/stores/playerStore';
	import { countInventoryItem } from '$lib/services/InventoryService';

	const CURRENCY_DEFS = [
		{ id: 'argentum',        label: 'Argentum',      icon: '/general/argentum.png',       direct: 'argentum' },
		{ id: 'arena_gold',      label: 'Arena Gold',    icon: '/general/arena_gold.png',      direct: null },
		{ id: 'arena_silver',    label: 'Arena Silver',  icon: '/general/arena_silver.png',    direct: null },
		{ id: 'time_point',      label: 'Time Points',   icon: '/general/time_point.png',      direct: null },
		{ id: 'level_up_point',  label: 'Level Points',  icon: '/general/level_up_point.png',  direct: 'levelUpPoints' },
	] as const;

	$: currencies = CURRENCY_DEFS.map(c => ({
		...c,
		amount: c.direct
			? (($playerStore as any)[c.direct] ?? 0)
			: countInventoryItem($playerStore.inventory, c.id)
	}));
</script>

<div class="currency-bar">
	{#each currencies as c}
		<div class="currency-chip" title={c.label}>
			<img src={c.icon} alt={c.label}
				on:error={(e) => (e.currentTarget as HTMLImageElement).style.display = 'none'}
			/>
			<span class="currency-label">{c.label}</span>
			<span class="currency-amount">{c.amount.toLocaleString()}</span>
		</div>
	{/each}
</div>

<style>
	.currency-bar {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		padding: 6px 1rem;
		background: rgba(0,0,0,0.4);
		border-bottom: 1px solid rgba(200,169,110,0.1);
		position: sticky;
		top: 0;
		z-index: 10;
	}
	.currency-chip {
		display: flex;
		align-items: center;
		gap: 5px;
		background: rgba(26,20,10,0.8);
		border: 1px solid rgba(200,169,110,0.18);
		border-radius: 6px;
		padding: 3px 10px 4px 6px;
		box-shadow: #00000056 0 -2px 0 0 inset;
	}
	.currency-chip img {
		width: 22px;
		height: 22px;
		image-rendering: pixelated;
		flex-shrink: 0;
	}
	.currency-label {
		font-family: var(--font-family-pixel);
		font-size: 0.5rem;
		color: rgba(200,169,110,0.4);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.currency-amount {
		font-family: var(--font-family-pixel);
		font-size: 0.9rem;
		color: #c8a96e;
		min-width: 12px;
	}
</style>