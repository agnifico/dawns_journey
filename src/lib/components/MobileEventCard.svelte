<script lang="ts">
	import { eventScreen, clearEvent } from '$lib/stores/uiStore';
	import { resourceStore } from '$lib/stores/resourceStore';
	import { mapStore } from '$lib/stores/mapStore';
	import { time } from '$lib/stores/timeStore';
	import { resourceNodeDefinitions } from '$lib/data/resourceNodeDefinitions';
	import { derived } from 'svelte/store';
	import MasteryTag from './ui/MasteryTag.svelte';
	import ChoiceMenu from './ui/ChoiceMenu.svelte';
    import type { ResourceNode, Enemy } from '$lib/types';

// Replace the derived stores with explicit casts:
const resourceNodeKey = derived([eventScreen, mapStore], ([$es, $ms]) => {
    if ($es.type === 'resource' && $es.data) {
        const data = $es.data as ResourceNode;
        return `${$ms.currentMapId}-${data.x}-${data.y}`;
    }
    return null;
});

const resourceNodeData = derived(eventScreen, ($es) => {
    if ($es.type === 'resource' && $es.data) {
        const data = $es.data as ResourceNode;
        return resourceNodeDefinitions[data.resourceId];
    }
    return null;
});

	const resourceState = derived([resourceNodeKey, resourceStore], ([$key, $rs]) => {
		if ($key) return $rs.resourceNodeStates[$key] || { currentGatherCount: 0, cooldownEndTime: 0 };
		return { currentGatherCount: 0, cooldownEndTime: 0 };
	});

	const remainingSteps = derived([resourceState, time], ([$rs, $t]) =>
		Math.max(0, $rs.cooldownEndTime - $t)
	);

	$: isEnemy = $eventScreen.type === 'enemy';
	$: isResource = $eventScreen.type === 'resource';
    $: isLegendary = isEnemy && ($eventScreen.data as Enemy)?.isLegendary;
    $: isVisible = isEnemy || isResource;
</script>

<div class="event-card" class:visible={isVisible} class:legendary={isLegendary}>
	{#if isVisible}
		<button class="dismiss-btn" on:click={clearEvent}>✕</button>
		<div class="card-inner">
			{#if $eventScreen.image}
				<div class="card-image" class:pixelated={isEnemy}>
					<img src={$eventScreen.image} alt="event" />
					{#if isLegendary}<div class="legendary-glow"></div>{/if}
				</div>
			{/if}
			<div class="card-info">
				{#if isEnemy && $eventScreen.data}
					<p class="card-label">{isLegendary ? '⚠ LEGENDARY' : 'ENCOUNTER'}</p>
					<p class="card-name" class:legendary-name={isLegendary}>{$eventScreen.data.name}</p>
					{#if $eventScreen.data.masteryRequirements}
						<div class="mastery-row">
							{#each Object.entries($eventScreen.data.masteryRequirements) as [element, level]}
								<MasteryTag {element} {level} />
							{/each}
						</div>
					{/if}
					{@const r = $eventScreen.data.encounterResult}
					<div class="encounter-result">
						<div class="outcome-badge" class:win={r.outcome === 'win'} class:loss={r.outcome === 'loss'}>
							{#if r.outcome === 'win'}⚔ VICTORY{:else}✦ ESCAPED{/if}
						</div>
						<div class="result-stats">
							<div class="stat-pill hp">
								<span class="stat-icon">♥</span>
								<span class="stat-label">HP Lost</span>
								<span class="stat-val">−{r.hpLost}</span>
							</div>
							{#if r.outcome === 'win'}
								<div class="stat-pill xp">
									<span class="stat-icon">★</span>
									<span class="stat-label">XP</span>
									<span class="stat-val">+{r.xpGained}</span>
								</div>
							{/if}
							{#if r.outcome === 'loss' && r.reason}
								<p class="escape-reason">{r.reason}</p>
							{/if}
						</div>
						{#if r.outcome === 'win' && r.drops?.length > 0}
							<div class="drops">
								<span class="drops-label">DROPS</span>
								<div class="drops-grid">
									{#each r.drops as drop}
										<div class="drop-item">
											<img src={drop.item.image} alt={drop.item.name} class="drop-img" />
											<span class="drop-name">{drop.item.name}</span>
											{#if drop.quantity > 1}<span class="drop-qty">×{drop.quantity}</span>{/if}
										</div>
									{/each}
								</div>
							</div>
						{/if}
						<a href="/help/combat" class="combat-help">How does combat work? →</a>
					</div>
				{:else if isResource && $resourceNodeData}
					<p class="card-label">RESOURCE</p>
					<p class="card-name">{$resourceNodeData.name}</p>
					<div class="pip-row">
						{#each { length: 10 } as _, i}
							<div class="pip" class:active={i < 10 - Math.ceil(($resourceState.currentGatherCount / $resourceNodeData.maxGathers) * 10)}></div>
						{/each}
					</div>
					{#if $remainingSteps > 0}
						<p class="cooldown">⏱ {$remainingSteps} steps</p>
					{/if}
				{/if}
			</div>
		</div>
		{#if isLegendary || isResource}
			<div class="card-actions"><ChoiceMenu /></div>
		{/if}
	{/if}
</div>

<style>
	.event-card {
		position: absolute;
		top: 200px;
		left: 50%;
		transform: translateX(-50%) translateY(-12px);
		z-index: 60;
		width: min(320px, 90vw);
		background-color: var(--surface-2, #2a2a2a);
		border: 3px solid var(--color-secondary, #8b6f5e);
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.2s ease, transform 0.2s ease;
		overflow: hidden;
	}
	.event-card.visible {
		opacity: 1;
		pointer-events: all;
		transform: translateX(-50%) translateY(0);
	}
	.event-card.legendary {
		border-color: gold;
		box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(255,215,0,0.3);
	}
	.dismiss-btn {
		position: absolute;
		top: 6px; right: 8px;
		background: none; border: none;
		color: #888; font-size: 0.9rem;
		cursor: pointer; padding: 2px 4px; z-index: 1;
	}
	.dismiss-btn:hover { color: white; }
	.card-inner {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
	}
	.card-image {
		flex-shrink: 0;
		width: 64px; height: 64px;
		border-radius: 8px; overflow: hidden;
		border: 2px solid rgba(255,255,255,0.1);
		position: relative;
		background: rgba(0,0,0,0.3);
		display: flex; align-items: center; justify-content: center;
	}
	.card-image img { width: 100%; height: 100%; object-fit: contain; }
	.card-image.pixelated img { image-rendering: pixelated; }
	.legendary-glow {
		position: absolute; inset: 0;
		background: radial-gradient(circle, rgba(255,215,0,0.2), transparent 70%);
		pointer-events: none;
	}
	.card-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
	.card-label {
		font-family: var(--font-family-pixel);
		font-size: 0.55rem; letter-spacing: 0.12em;
		color: var(--color-secondary, #a98467); margin: 0;
	}
	.card-name {
		font-family: var(--font-family-pixel);
		font-size: 0.9rem; color: white; margin: 0;
		white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
	}
	.card-name.legendary-name { color: gold; }
	.mastery-row { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 2px; }
	.pip-row { display: flex; gap: 2px; margin-top: 3px; }
	.pip { width: 7px; height: 9px; background-color: #444; border-radius: 1px; }
	.pip.active { background-color: var(--color-buff, #6a994e); }
	.cooldown { font-family: monospace; font-size: 0.65rem; color: #aaa; margin: 2px 0 0; }
	.card-actions { border-top: 1px solid rgba(255,255,255,0.06); }
	.card-actions :global(.interaction-menu) { padding: 8px 10px 12px; border-radius: 0 0 9px 9px; }
	.card-actions :global(button) { padding: 0.5rem 0.75rem; font-size: 0.8rem; min-height: 40px; }

	.encounter-result {
		display: flex; flex-direction: column; gap: 0.4rem;
		margin-top: 2px;
	}
	.outcome-badge {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.6rem; letter-spacing: 0.12em;
		text-align: center; padding: 0.25rem 0.5rem;
		border-radius: 4px; border: 1px solid;
	}
	.outcome-badge.win  { color: #4ade80; border-color: #4ade8044; background: rgba(74,222,128,0.08); }
	.outcome-badge.loss { color: #fbbf24; border-color: #fbbf2444; background: rgba(251,191,36,0.08); }
	.result-stats { display: flex; gap: 0.35rem; flex-wrap: wrap; }
	.stat-pill {
		display: flex; align-items: center; gap: 0.2rem;
		padding: 0.15rem 0.4rem; border-radius: 20px;
		font-family: var(--font-family-pixel, monospace); font-size: 0.5rem;
	}
	.stat-pill.hp { background: rgba(248,113,113,0.15); border: 1px solid rgba(248,113,113,0.3); }
	.stat-pill.xp { background: rgba(144,169,85,0.15);  border: 1px solid rgba(144,169,85,0.3); }
	.stat-icon  { font-size: 0.45rem; opacity: 0.7; }
	.stat-label { color: #888; }
	.stat-val   { font-weight: bold; color: #eee; }
	.stat-pill.hp .stat-val { color: #f87171; }
	.stat-pill.xp .stat-val { color: #90a955; }
	.escape-reason { font-family: var(--font-family-pixel, monospace); font-size: 0.5rem; color: #fbbf24; margin: 0; }
	.drops { display: flex; flex-direction: column; gap: 0.25rem; }
	.drops-label { font-family: var(--font-family-pixel, monospace); font-size: 0.42rem; letter-spacing: 0.12em; color: #666; }
	.drops-grid { display: flex; flex-wrap: wrap; gap: 0.35rem; }
	.drop-item {
		display: flex; align-items: center; gap: 0.2rem;
		background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
		border-radius: 4px; padding: 0.15rem 0.35rem 0.15rem 0.2rem;
	}
	.drop-img  { width: 14px; height: 14px; object-fit: contain; image-rendering: pixelated; }
	.drop-name { font-family: var(--font-family-pixel, monospace); font-size: 0.45rem; color: #ddd; }
	.drop-qty  { font-family: var(--font-family-pixel, monospace); font-size: 0.42rem; color: #888; }
	.combat-help {
		font-family: var(--font-family-pixel, monospace); font-size: 0.42rem;
		color: #60a5fa; text-decoration: none; opacity: 0.7;
		transition: opacity 0.15s; align-self: flex-end;
	}
	.combat-help:hover { opacity: 1; }
</style>