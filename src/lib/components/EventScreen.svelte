<script lang="ts">
	import { eventScreen } from '$lib/stores/uiStore';
	import { npcStore } from '$lib/stores/npcStore';
    import { resourceStore } from '$lib/stores/resourceStore';
    import { mapStore } from '$lib/stores/mapStore';
    import { time } from '$lib/stores/timeStore';
    import { resourceNodeDefinitions } from '$lib/data/resourceNodeDefinitions';
	import StatBar from './ui/StatBar.svelte';
	import MasteryTag from './ui/MasteryTag.svelte';
    import Tooltip from './ui/Tooltip.svelte';
    import { derived } from 'svelte/store';

	let npc;
	$: if ($eventScreen.type === 'npc' && $eventScreen.data?.npcId) {
		npc = $npcStore.globalNpcs[$eventScreen.data.npcId];
	} else {
		npc = null;
	}

	// --- Component State ---
    let lightboxVisible = false;
    let lightboxImage = '';

    function openLightbox(imageUrl: string) {
        lightboxImage = imageUrl;
        lightboxVisible = true;
    }

    function closeLightbox() {
        lightboxVisible = false;
        lightboxImage = '';
    }

    const resourceNodeKey = derived(
        [eventScreen, mapStore],
        ([$eventScreen, $mapStore]) => {
            if ($eventScreen.type === 'resource' && $eventScreen.data) {
                const mapObject = $eventScreen.data;
                return `${$mapStore.currentMapId}-${mapObject.x}-${mapObject.y}`;
            }
            return null;
        }
    );

    const resourceNodeData = derived(
        [eventScreen],
        ([$eventScreen]) => {
            if ($eventScreen.type === 'resource' && $eventScreen.data) {
                return resourceNodeDefinitions[$eventScreen.data.resourceId];
            }
            return null;
        }
    );

    const resourceState = derived(
        [resourceNodeKey, resourceStore],
        ([$resourceNodeKey, $resourceStore]) => {
            if ($resourceNodeKey) {
                return $resourceStore.resourceNodeStates[$resourceNodeKey] || { currentGatherCount: 0, cooldownEndTime: 0 };
            }
            return { currentGatherCount: 0, cooldownEndTime: 0 };
        }
    );

    const remainingSteps = derived(
        [resourceState, time],
        ([$resourceState, $time]) => {
            return Math.max(0, $resourceState.cooldownEndTime - $time);
        }
    );

    const tooltipText = derived(
        [resourceState, remainingSteps, resourceNodeData],
        ([$resourceState, $remainingSteps, $resourceNodeData]) => {
            if (!$resourceNodeData) return '';

            const isDepleted = $resourceState.currentGatherCount >= $resourceNodeData.maxGathers;

            if (isDepleted) {
                if ($remainingSteps > 0) {
                    return `Respawns in ${$remainingSteps} steps.`;
                }
                return 'Ready to gather';
            }

            if ($resourceState.currentGatherCount > 0) {
                return 'Node active';
            }

            return 'Ready to gather';
        }
    );
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && closeLightbox()} />

{#if lightboxVisible}
    <div class="lightbox" on:click={closeLightbox}>
        <img src={lightboxImage} alt="NPC Full Image" />
        <button class="close-button" on:click|stopPropagation={closeLightbox}>X</button>
    </div>
{/if}

<div class="event-screen">
	{#if $eventScreen.type === 'none'}
		<div class="placeholder"></div>
	{:else}
		<!-- Image Container -->
		<div class="image-container">
			{#if $eventScreen.image}
                {#if $eventScreen.type === 'npc'}
                    <button class="avatar-button" on:click={() => openLightbox($eventScreen.data.fullImage)}>
                        <img src={$eventScreen.image} alt="NPC Avatar" class="npc-image" />
                    </button>
                {:else}
                    <img
                        src={$eventScreen.image}
                        alt="Event"
                        class:npc-image={$eventScreen.type === 'npc' || $eventScreen.type === 'enemy'}
                    />
                {/if}
			{/if}
		</div>

		<!-- Info Box (for all types) -->
		<div class="info-box">
			{#if npc}
				<h3>{npc.name}</h3>
				<div class="rank-meters">
					<div class="rank-meter">
						<img src="/game_icons/sword_rank.png" alt="Sword Rank" class="rank-icon" />
						<StatBar current={npc.swordRank} max={npc.swordRanks.length} color="pink" />
					</div>
					<div class="rank-meter">
						<img src="/game_icons/heart_rank.png" alt="Heart Rank" class="rank-icon" />
						<StatBar current={npc.heartRank} max={npc.heartRanks.length} color="white" />
					</div>
				</div>
			{:else if $eventScreen.type === 'enemy' && $eventScreen.data}
				<h3>{$eventScreen.data.name}</h3>
				<div class="mastery-requirements">
					{#each Object.entries($eventScreen.data.masteryRequirements || {}) as [element, level]}
						<MasteryTag {element} {level} />
					{/each}
				</div>
			{:else if $eventScreen.type === 'item_found' && $eventScreen.data}
			<h3>{$eventScreen.data.item.name}</h3>
			<p>You found x{$eventScreen.data.quantity}</p>
            {:else if $eventScreen.type === 'resource' && $resourceNodeData}
                <h3>{$resourceNodeData.name}</h3>
                <div class="resource-info">
                    <div class="pip-bar-container">
                        {#each { length: 10 } as _, i}
                            <div class="pip" class:active={i < (10 - Math.ceil(($resourceState.currentGatherCount / $resourceNodeData.maxGathers) * 10))}></div>
                        {/each}
                    </div>
                    <Tooltip text={$tooltipText}>
                        <div class="cooldown-info">
                            <img src="/game_icons/stopwatch.png" alt="Cooldown" class="cooldown-icon" />
                            <span>{$remainingSteps > 0 ? $remainingSteps : $resourceNodeData.cooldown * 50}</span>
                        </div>
                    </Tooltip>
                </div>
			{:else if $eventScreen.type === 'location_event' && $eventScreen.data}
				<h3>{$eventScreen.data.name}</h3>
                <p>{$eventScreen.data.shortDesc}</p>
			{/if}
		</div>

	{/if}
</div>

<style>
    .lightbox {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .lightbox img {
        max-width: 90%;
        max-height: 90%;
    }
    .close-button {
        position: absolute;
        top: 20px;
        right: 20px;
        background: none;
        border: none;
        color: white;
        font-size: 2rem;
        cursor: pointer;
    }
    .avatar-button {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
    }

	.event-screen {
		background-color: #75594b;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: white;
		height: 260px;
		height: 100%;
		box-sizing: border-box;
		gap: 1rem;
        background-color: var(--surface-3);
	}
	.placeholder {
		min-height: 150px;
	}
	.image-container {
		width: 100%;
		min-height: 150px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		image-rendering: pixelated;
	}
	.npc-image,
	.enemy-image {
		width: 150px;
		height: 150px;
		border: 3px solid white;
		border-radius: 8px;
		box-shadow: #222 4px 4px;
	}
	.info-box {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		text-align: center;
		min-height: 60px;
	}
	.info-box h3 {
		margin: 0;
		font-family: var(--font-family-main);
        font-family: "Silkscreen";
        font-weight: normal;
	}
	.rank-meters {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.rank-meter {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8em;
	}
	.rank-icon {
		width: 20px;
		height: 20px;
	}
	.mastery-requirements {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		justify-content: center;
	}
    .resource-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }
    .pip-bar-container {
        display: flex;
        gap: 2px;
    }

    .pip {
        width: 8px;
        height: 10px;
        background-color: #555;
    }

    .pip.active {
        background-color: #4ade80;
    }
    .cooldown-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .cooldown-icon {
        width: 16px;
        height: 16px;
    }
</style>
