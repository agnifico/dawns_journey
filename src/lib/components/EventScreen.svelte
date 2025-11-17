<script lang="ts">
	import { eventScreenStore } from '$lib/stores/eventScreenStore';
	import { npcStore } from '$lib/stores/npcStore';
	import { playerStore } from '$lib/stores/playerStore';
    import { resourceStore } from '$lib/stores/resourceStore';
    import { mapStore } from '$lib/stores/mapStore';
    import { time } from '$lib/stores/timeStore';
	import { items as allItems } from '$lib/data/items';
    import { resourceNodeDefinitions } from '$lib/data/resourceNodeDefinitions';
	import * as CombatService from '$lib/services/CombatService';
    import * as LocationEventService from '$lib/services/LocationEventService';
	import StatBar from './ui/StatBar.svelte';
	import MasteryTag from './ui/MasteryTag.svelte';
    import Tooltip from './ui/Tooltip.svelte';
    import { derived } from 'svelte/store';
    import type { EventAction } from '$lib/types';

	let npc;
	$: if ($eventScreenStore.type === 'npc' && $eventScreenStore.data?.npcId) {
		npc = $npcStore.globalNpcs[$eventScreenStore.data.npcId];
	} else {
		npc = null;
	}

	// --- Component State ---
	let isGivingItem = false;
	let selectedItemId: string | null = null;
	let selectedQuantity: number = 1;
	let maxQuantity = 1;
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

	// --- Item Selection Logic ---
	const itemMap = new Map(allItems.map((item) => [item.id, item]));
	let generalInventoryItems = [];
	$: {
		generalInventoryItems = $playerStore.inventory
			.map((invItem) => ({
				...invItem,
				details: itemMap.get(invItem.itemId)
			}))
			.filter((item) => item.details && item.details.type === 'general');

		if (!selectedItemId && generalInventoryItems.length > 0) {
			selectedItemId = generalInventoryItems[0].itemId;
		}
	}

	$: {
		if (selectedItemId) {
			const selectedInvItem = generalInventoryItems.find((i) => i.itemId === selectedItemId);
			maxQuantity = selectedInvItem ? selectedInvItem.amount : 1;
			if (selectedQuantity > maxQuantity) {
				selectedQuantity = maxQuantity;
			}
		}
	}

    const resourceNodeKey = derived(
        [eventScreenStore, mapStore],
        ([$eventScreenStore, $mapStore]) => {
            if ($eventScreenStore.type === 'resource' && $eventScreenStore.data) {
                const mapObject = $eventScreenStore.data;
                return `${$mapStore.currentMapId}-${mapObject.x}-${mapObject.y}`;
            }
            return null;
        }
    );

    const resourceNodeData = derived(
        [eventScreenStore],
        ([$eventScreenStore]) => {
            if ($eventScreenStore.type === 'resource' && $eventScreenStore.data) {
                return resourceNodeDefinitions[$eventScreenStore.data.resourceId];
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

	// --- Button Handlers ---
	function handleTalk() {
		if (npc) npcStore.interactTalk(npc.id);
	}

	function handleConnect() {
		if (npc) npcStore.interactConnect(npc.id);
	}

	function handleChallenge() {
		if (npc && npc.isCombatant) {
			CombatService.startCombat(npc);
		}
	}

	function handleGiveConfirm() {
		if (!npc || !selectedItemId || selectedQuantity <= 0) return;
		npcStore.giveItem(npc.id, selectedItemId, selectedQuantity);
		isGivingItem = false; // Close the give UI
	}

    function handleEventAction(action: EventAction) {
        if (action.effects) {
            LocationEventService.triggerEventEffect(action.effects, $eventScreenStore.data.message);
        }
    }
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && closeLightbox()} />

{#if lightboxVisible}
    <div class="lightbox" on:click={closeLightbox}>
        <img src={lightboxImage} alt="NPC Full Image" />
        <button class="close-button" on:click|stopPropagation={closeLightbox}>X</button>
    </div>
{/if}

<div class="event-screen">
	{#if $eventScreenStore.type === 'none'}
		<div class="placeholder"></div>
	{:else}
		<!-- Image Container -->
		<div class="image-container">
			{#if $eventScreenStore.image}
                {#if $eventScreenStore.type === 'npc'}
                    <button class="avatar-button" on:click={() => openLightbox($eventScreenStore.data.fullImage)}>
                        <img src={$eventScreenStore.image} alt="NPC Avatar" class="npc-image" />
                    </button>
                {:else}
                    <img
                        src={$eventScreenStore.image}
                        alt="Event"
                        class:npc-image={$eventScreenStore.type === 'npc' || $eventScreenStore.type === 'enemy'}
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
						<StatBar current={npc.swordRank} max={npc.swordRanks.length} color="#9ca3af" />
					</div>
					<div class="rank-meter">
						<img src="/game_icons/heart_rank.png" alt="Heart Rank" class="rank-icon" />
						<StatBar current={npc.heartRank} max={npc.heartRanks.length} color="#f472b6" />
					</div>
				</div>
			{:else if $eventScreenStore.type === 'enemy' && $eventScreenStore.data}
				<h3>{$eventScreenStore.data.name}</h3>
				<div class="mastery-requirements">
					{#each Object.entries($eventScreenStore.data.masteryRequirements || {}) as [element, level]}
						<MasteryTag {element} {level} />
					{/each}
				</div>
			{:else if $eventScreenStore.type === 'item_found' && $eventScreenStore.data}
			<h3>{$eventScreenStore.data.item.name}</h3>
			<p>You found x{$eventScreenStore.data.quantity}</p>
            {:else if $eventScreenStore.type === 'resource' && $resourceNodeData}
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
			{:else if $eventScreenStore.type === 'location_event' && $eventScreenStore.data}
				<h3>{$eventScreenStore.data.name}</h3>
                <p>{$eventScreenStore.data.shortDesc}</p>
			{/if}
		</div>

		<!-- Interaction Area -->
		<div class="interaction-area">
			{#if npc}
				{#if isGivingItem}
					<!-- Give Item UI -->
					<div class="give-item-ui">
						{#if generalInventoryItems.length > 0}
							<div class="form-group">
								<select id="item-select" bind:value={selectedItemId}>
									{#each generalInventoryItems as invItem}
										<option value={invItem.itemId}
											>{invItem.details.name} (x{invItem.amount})</option
										>
									{/each}
								</select>
								<input
									id="quantity-input"
									type="number"
									min="1"
									max={maxQuantity}
									bind:value={selectedQuantity}
								/>
							</div>
							<div class="give-confirm-buttons">
								<button on:click={handleGiveConfirm}>Give</button>
								<button on:click={() => (isGivingItem = false)}>Cancel</button>
							</div>
						{:else}
							<p>You have no general items to give.</p>
							<button on:click={() => (isGivingItem = false)}>Back</button>
						{/if}
					</div>
				{:else}
					<!-- Default Action Buttons -->
					<div class="interaction-buttons">
						<button on:click={handleTalk}>Talk</button>
						<button
							on:click={handleConnect}
							class:highlight={npc.heartState === 'READY_FOR_RANK_UP'}
						>
							<img src="/game_icons/expression_alerted.png" alt="!!" />
							Connect
						</button>
						<button on:click={handleChallenge} disabled={!npc.isCombatant}>Challenge</button>
						<button on:click={() => (isGivingItem = true)}>Give Item</button>
					</div>
				{/if}
            {:else if $eventScreenStore.type === 'location_event' && $eventScreenStore.data.actions}
                <div class="interaction-buttons">
                    {#each $eventScreenStore.data.actions as action}
                        <button on:click={() => handleEventAction(action)}>
                            {action.text}
                        </button>
                    {/each}
                </div>
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
		background-color: #111;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: white;
		height: 360px;
		box-sizing: border-box;
		gap: 1rem;
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
		font-family: 'Silkscreen';
	}
	.rank-meters {
		display: flex;
		gap: 1rem;
	}
	.rank-meter {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8em;
	}
	.rank-icon {
		width: 16px;
		height: 16px;
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
	.interaction-area {
		width: 100%;
		max-width: 250px;
		min-height: 80px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.interaction-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		width: 100%;
	}
	.interaction-buttons button {
		padding: 0.25rem;
		font-size: 0.9rem;
		background-color: #333;
		border: 1px solid #555;
		color: white;
		font-family: 'Silkscreen', sans-serif;
		img {
			visibility: hidden;
		}
	}
	.interaction-buttons button:disabled {
		background-color: #222;
		color: #666;
		cursor: not-allowed;
	}
	.interaction-buttons button.highlight {
		color: #facc15;
		font-weight: bold;
		border-color: #facc15;
		img {
			visibility: visible;
		}
	}
	.give-item-ui {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.give-item-ui .form-group {
		display: flex;
		gap: 0.5rem;
	}
	.give-item-ui select {
		flex-grow: 1;
	}
	.give-item-ui input {
		width: 60px;
	}
	.give-confirm-buttons {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
	}
</style>
