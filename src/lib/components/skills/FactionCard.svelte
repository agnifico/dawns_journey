<script lang="ts">
	// FactionCard.svelte
	// One faction: rank, progress toward the next rank, and that rank's rewards.

	import type { Faction } from '$lib/types';
	import { factions as factionData } from '$lib/data/factions';
	import { getItemById } from '$lib/services/InventoryService';

	export let faction: Faction;
	export let score: number;
	export let rank: number;
	export let color = '#c8a96e';

	$: next = faction.ranks[rank];
	$: maxed = !next;
	$: pct = next ? Math.min(100, (Math.max(0, score) / next.scoreThreshold) * 100) : 100;
	$: itemRewards = (next?.rewards ?? []).filter((r) => r.type === 'item') as {
		type: 'item';
		itemId: string;
		quantity: number;
	}[];
	$: rivals = (faction.rivalFactions ?? []).map((r) => factionData[r.factionId]?.name ?? r.factionId);
</script>

<article class="faction-card" style="--faction: {color}">
	<div class="head">
		<img class="icon" src={faction.icon} alt="" />
		<div class="head-main">
			<h3 class="name">{faction.name}</h3>
			<span class="rank">Rank {rank}{maxed ? ' · Max' : ''}</span>
		</div>
	</div>

	<div class="bar" title={next ? `${Math.max(0, score)} / ${next.scoreThreshold}` : 'Max rank'}>
		<div class="fill" style="width: {pct}%"></div>
		<span class="bar-text">{next ? `${Math.max(0, score)} / ${next.scoreThreshold}` : 'Max rank'}</span>
	</div>

	{#if itemRewards.length > 0}
		<div class="rewards">
			<span class="label">Rank {rank + 1}</span>
			{#each itemRewards as r}
				<span class="reward" title={getItemById(r.itemId)?.name ?? r.itemId}>
					<img src={getItemById(r.itemId)?.image} alt="" />{r.quantity}×
				</span>
			{/each}
		</div>
	{/if}

	{#if rivals.length > 0}
		<div class="rivals">Rivals: {rivals.join(', ')}</div>
	{/if}
</article>

<style>
	.faction-card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 10px 12px;
		border-radius: 8px;
		background: rgb(18, 18, 18);
		border: 1px solid color-mix(in srgb, var(--faction) 30%, transparent);
	}
	.head {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.icon {
		width: 32px;
		height: 32px;
		image-rendering: pixelated;
		flex-shrink: 0;
	}
	.head-main {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.name {
		margin: 0;
		font-family: var(--font-family-pixel);
		font-size: 0.95rem;
		font-weight: 400;
		color: var(--faction);
	}
	.rank {
		font-family: var(--font-family-pixel);
		font-size: 0.65rem;
		color: rgba(228, 216, 190, 0.7);
	}
	.bar {
		position: relative;
		height: 14px;
		border: 1px solid black;
		border-radius: 3px;
		background: color-mix(in srgb, var(--faction) 15%, black);
	}
	.fill {
		height: 100%;
		border-radius: 2px;
		background: var(--faction);
	}
	.bar-text {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-family-pixel);
		font-size: 0.6rem;
		color: rgba(255, 255, 255, 0.9);
		text-shadow: 1px 1px 0 black;
	}
	.rewards {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
	}
	.label {
		font-family: var(--font-family-pixel);
		font-size: 0.55rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgba(200, 169, 110, 0.5);
	}
	.reward {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		font-family: var(--font-family-pixel);
		font-size: 0.7rem;
		color: #e4d8be;
	}
	.reward img {
		width: 18px;
		height: 18px;
		image-rendering: pixelated;
	}
	.rivals {
		font-family: var(--font-family-pixel);
		font-size: 0.55rem;
		color: rgba(228, 216, 190, 0.45);
	}
</style>
