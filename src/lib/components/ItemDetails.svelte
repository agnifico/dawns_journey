<script lang="ts">
	import type { Item } from '$lib/types';
	import { game } from '$lib/game/game';
	import Stat from './Stat.svelte';
	import InstantEffectDisplay from './ui/InstantEffectDisplay.svelte';
	import BuffDisplay from './ui/BuffDisplay.svelte';
	import MasteryDisplay from './ui/MasteryDisplay.svelte';
	import ElementTag from './ui/ElementTag.svelte';

	export let item: Item | null;
</script>

{#if item}
	<div class="item-details-panel">
		<div class="header">
			<h3>{item.name}</h3>
			<div class="elements">
				{#if item.type === 'weapon'}
					<ElementTag element={item.element} size="mini"/>
				{/if}
			</div>
		</div>
		<p class="description">{item.description}</p>
		{#if item.type === 'weapon' && item.mastery}
			<MasteryDisplay mastery={item.mastery} elements={[item.element]} size="mini"/>
		{/if}
		{#if item.stats && item.stats.length > 0}
			<div class="stats-grid">
				{#each item.stats as stat}
					<div class="stat-line">
						<Stat statId={stat.name} value={stat.value} />
					</div>
				{/each}
			</div>
		{/if}
		{#if item.effects && item.effects.length > 0}
			<p class="effects-label">Effects:</p>
			<ul class="effects-list">
				{#if item.effects && item.effects.length > 0}
					{#each item.effects as effect (Object.keys(effect)[0])}
						<InstantEffectDisplay {effect} />
					{/each}
				{/if}
				{#if item.activeEffects && item.activeEffects.length > 0}
					{#each item.activeEffects as effect (effect.id)}
						<BuffDisplay {effect} />
					{/each}
				{/if}
			</ul>
		{/if}
	</div>
{/if}

<style>
	.item-details-panel {
        border-radius: 15px 15px 15px 0;
		position: absolute;
		left: 100%;
		bottom: 100%;
		flex-grow: 1;
		width: fit-content;
		height: fit-content;
		background-color: #222;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-start;
		z-index: 9;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: top;
        width: 100%;
		/* gap: 1em; */
	}

	.header h3 {
		margin: 0;
		color: var(--text-item-name);
		font-family: var(--font-family-main);
		font-size: 1.5rem;
		font-weight: 400;
		flex-grow: 1;
	}

	.description {
		font-family: var(--font-family-pixel);
		font-size: 0.8rem;
		color: var(--color-text-muted);
		color: var(--text-muted);
		flex-grow: 1;
		overflow-y: auto;
		padding-top: 0.5em;
	}

	.item-details-panel .stats-grid {
		display: grid;
		grid-template-columns: auto auto;
		gap: 0.2em 1em;
		font-size: 0.8em;
		color: #eee;
	}

	.item-details-panel .buttons {
		display: flex;
		gap: 0.5em;
		margin-top: 0.5em;
	}
</style>
