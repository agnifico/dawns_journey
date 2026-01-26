<script lang="ts">
	import { get } from 'svelte/store';
	import { eventScreen, clearEvent } from '$lib/stores/uiStore';
	import { npcStore } from '$lib/stores/npcStore';
	import { resourceStore } from '$lib/stores/resourceStore';
	import { mapStore } from '$lib/stores/mapStore'; // Import mapStore
	import { time } from '$lib/stores/timeStore';
	import { resourceNodeDefinitions } from '$lib/data/resourceNodeDefinitions';
	import { triggerEventEffect } from '$lib/services/LocationEventService';
	import StatBar from './ui/StatBar.svelte';
	import MasteryTag from './ui/MasteryTag.svelte';
	import Tooltip from './ui/Tooltip.svelte';
	import { derived } from 'svelte/store';
	import { goto } from '$app/navigation';
	import DialogueBox from '$lib/components/DialogueBox.svelte';
	import ElementTag from './ui/ElementTag.svelte';
	// import ChoiceMenu from './ui/ChoiceMenu.svelte';

	let npc;
	$: if ($eventScreen.type === 'npc' && $eventScreen.data?.npcId) {
		npc = $npcStore.globalNpcs[$eventScreen.data.npcId];
	} else {
		npc = null;
	}

	// Derived store for landscape image
	const landscapeImage = derived(mapStore, ($mapStore) => {
		const { mapData, playerX, playerY } = $mapStore;
		if (!mapData) return '';

		let currentLandscape: string | undefined;

		// Find matching landscape
		for (const landscape of mapData.landscapes) {
			if (
				playerX >= landscape.x &&
				playerX < landscape.x + landscape.width &&
				playerY >= landscape.y &&
				playerY < landscape.y + landscape.height
			) {
				currentLandscape = landscape.landscape;
				break;
			}
		}

		// Use default if no specific landscape found
		const landscapeId = currentLandscape || mapData.defaultLandscape;
		// Construct image path (assuming images are in /static/locations/ and are .jpg)
		// I will assume .jpg for now, but if some are .png, this logic might need to be more sophisticated.
		// For now, based on the directory listing, most landscapes are .jpg
		return landscapeId ? `/locations/${landscapeId}.jpg` : '';
	});

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

	function handleAction(action) {
		const eventData = $eventScreen.data;
		triggerEventEffect(eventData.id, action.effects, action.responseMessage || eventData.message);
		clearEvent();
	}

	const resourceNodeKey = derived([eventScreen, mapStore], ([$eventScreen, $mapStore]) => {
		if ($eventScreen.type === 'resource' && $eventScreen.data) {
			const mapObject = $eventScreen.data;
			return `${$mapStore.currentMapId}-${mapObject.x}-${mapObject.y}`;
		}
		return null;
	});

	const resourceNodeData = derived([eventScreen], ([$eventScreen]) => {
		if ($eventScreen.type === 'resource' && $eventScreen.data) {
			return resourceNodeDefinitions[$eventScreen.data.resourceId];
		}
		return null;
	});

	const resourceState = derived(
		[resourceNodeKey, resourceStore],
		([$resourceNodeKey, $resourceStore]) => {
			if ($resourceNodeKey) {
				return (
					$resourceStore.resourceNodeStates[$resourceNodeKey] || {
						currentGatherCount: 0,
						cooldownEndTime: 0
					}
				);
			}
			return { currentGatherCount: 0, cooldownEndTime: 0 };
		}
	);

	const remainingSteps = derived([resourceState, time], ([$resourceState, $time]) => {
		return Math.max(0, $resourceState.cooldownEndTime - $time);
	});

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

<div
	class="event-screen"
	style:background-image="url({$landscapeImage})"
	style:background-size="cover"
>
	{#if $eventScreen.type === 'none'}
		<div class="placeholder"></div>
	{:else}
		<div class="container">
			{#if $eventScreen.type === 'npc'}
				<div class="npc-card">
					<button class="avatar-button" on:click={() => openLightbox(npc.image)}>
						<img src={$eventScreen.image} alt="NPC Avatar" class="npc-image" />
					</button>
					<div class="details">
						<div class="top">
							<div class="npc-name">{npc.name}</div>
							<div class="npc-title">{npc.title}</div>
							
						</div>
						<div class="mid">
							<div class="elements">
								{#each npc.types as type}
									<ElementTag element={type} />
								{/each}
							</div>
							<button
								class="info-button"
								on:click={() => goto(`/journal/character/${npc.id}`)}
								title="View Character Info"
							>
								<img src="/game_icons/info.png" alt="Info" />
							</button>
						</div>
						<div class="bot">
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
						</div>
					</div>
				</div>
			{:else}
				<div class="image-container">
					{#if $eventScreen.image}
						<img
							src={$eventScreen.image}
							alt="Event"
							class:npc-image={false || $eventScreen.type === 'enemy'}
						/>
					{/if}
				</div>
				<div class="info-box">
					{#if $eventScreen.type === 'enemy' && $eventScreen.data}
						<h3 class:legendary={$eventScreen.data.isLegendary}>{$eventScreen.data.name}</h3>
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
									<div
										class="pip"
										class:active={i <
											10 -
												Math.ceil(
													($resourceState.currentGatherCount / $resourceNodeData.maxGathers) * 10
												)}
									></div>
								{/each}
							</div>
							<Tooltip text={$tooltipText}>
								<div class="cooldown-info">
									<img src="/game_icons/stopwatch.png" alt="Cooldown" class="cooldown-icon" />
									<span
										>{$remainingSteps > 0 ? $remainingSteps : $resourceNodeData.cooldown * 50}</span
									>
								</div>
							</Tooltip>
						</div>
					{:else if $eventScreen.type === 'location_event' && $eventScreen.data}
						<h3>{$eventScreen.data.name}</h3>
						<p>{$eventScreen.data.shortDesc}</p>
						<!-- {#if $eventScreen.data.actions && $eventScreen.data.actions.length > 0}
                    <div class="actions">
                        {#each $eventScreen.data.actions as action}
                            <button class="action-button" on:click={() => handleAction(action)}>
                                {action.text}
                            </button>
                        {/each}
                    </div>
                {/if} -->
					{/if}
				</div>
			{/if}
		</div>
	{/if}
	<DialogueBox />
	<!-- {#if $eventScreen.type === 'npc' || ($eventScreen.type === 'location_event' && $eventScreen.data?.actions) || $eventScreen.type === 'resource' || ($eventScreen.type === 'enemy' && $eventScreen.data.isLegendary) }
		<ChoiceMenu />
	{/if} -->
</div>

<style>
	.npc-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.container {
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(2px);
		display: flex;
		flex-direction: column;
		padding-top: 2rem;
		/* align-items: center; */
		/* justify-content: center; */
		/* margin: 1rem 0 auto 1rem; */
		/* gap: 2rem; */
	}

	.info-button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.info-button img {
		width: 16px;
		height: 16px;
		image-rendering: pixelated;
	}
	.info-button:hover {
		filter: brightness(1.2);
	}

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
		z-index: 1001;
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
		position: relative;
		background-color: #75594b;
		/* padding: 1rem; */
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: white;
		height: 400px;
		box-sizing: border-box;
		gap: 1rem;
		border: 3px solid var(--color-surface-2);
		border-radius: 12px;
		overflow: hidden;
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
		max-width: 200px;
		max-height: 200px;
		object-fit: contain;
		image-rendering: pixelated;
	}
	.npc-image,
	.enemy-image {
		width: 150px;
		height: 150px;
		border-radius: 8px;
		image-rendering: auto;
		border: 3px solid var(--color-primary);
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
		font-family: 'Silkscreen';
		font-weight: normal;
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
		background-color: var(--color-buff);
	}
	.cooldown-info {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 0.5rem;
		background-color: var(--color-surface-2);
		padding: 4px 8px 4px 4px;
	}
	.cooldown-icon {
		width: 20px;
		height: 20px;
	}
	.legendary {
		color: gold;
	}

	.npc-card {
		display: flex;
		margin: 2rem auto;
		gap: 2rem;

		.details {
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}

		.top {
			display: flex;
			font-family: var(--font-family-pixel);
			font-size: 1.3rem;
			font-weight: 600;
		}

		.mid {
			display: flex;
			gap: 8px;
			align-items: flex-start;
			justify-content: space-between;
		}

		.bot {
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}

		.elements {
			display: flex;
			gap: 0.5rem;
		}

		.rank-meters {
			display: flex;
			flex-direction: column;
			justify-content: space-around;
			gap: .5rem;
			/* background-color: #555;
			width: fit-content;
			padding-right: .5rem;
			padding-block: .25rem; */
		}
		.rank-meter {
			display: flex;
			align-items: center;
			gap: 0.25rem;
			/* background-color: #555; */
		}
		.rank-icon {
			width: 20px;
			height: 20px;
			/* background-color: aliceblue; */
			padding: 2px;
		}
	}
</style>
