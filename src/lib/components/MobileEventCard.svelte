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
					<div class="encounter-result">
						<div class="outcome">
							<span class="outcome-label">Outcome:</span>
							<span class="outcome-value" class:win={$eventScreen.data.encounterResult.outcome === 'win'} class:loss={$eventScreen.data.encounterResult.outcome === 'loss'}>
								{$eventScreen.data.encounterResult.outcome}
							</span>
						</div>
						<div class="result-details">
							<p>HP Lost: {$eventScreen.data.encounterResult.hpLost}</p>
							{#if $eventScreen.data.encounterResult.outcome === 'win'}
								<p>XP Gained: {$eventScreen.data.encounterResult.xpGained}</p>
								{#if $eventScreen.data.encounterResult.drops.length > 0}
									<div class="drops">
										<p>Drops:</p>
										<ul>
											{#each $eventScreen.data.encounterResult.drops as drop}
												<li>{drop.item.name} x{drop.quantity}</li>
											{/each}
										</ul>
									</div>
								{/if}
							{:else}
								<p class="reason">{$eventScreen.data.encounterResult.reason}</p>
							{/if}
						</div>
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
</style>