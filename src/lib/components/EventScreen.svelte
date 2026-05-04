<script lang="ts">
	import { get } from 'svelte/store';
	import { eventScreen, clearEvent } from '$lib/stores/uiStore';
	import { npcStore } from '$lib/stores/npcStore';
	import { resourceStore } from '$lib/stores/resourceStore';
	import { mapStore, landscapeImage } from '$lib/stores/mapStore'; // Import mapStore
	import { time } from '$lib/stores/timeStore';
	import { resourceNodeDefinitions } from '$lib/data/resourceNodeDefinitions';
	import StatBar from './ui/StatBar.svelte';
	import MasteryTag from './ui/MasteryTag.svelte';
	import Tooltip from './ui/Tooltip.svelte';
	import { derived } from 'svelte/store';
	import { goto } from '$app/navigation';
	import ElementTag from './ui/ElementTag.svelte';
	import ChoiceMenu from './ui/ChoiceMenu.svelte';
	import { elementBgs, elementColors } from '$lib/data/statDefinitions';
	import WRBadge from './WRBadge.svelte';
	import { playerStore } from '$lib/stores/playerStore';

	let npc;
	$: if ($eventScreen.type === 'npc' && $eventScreen.data?.npcId) {
		npc = $npcStore.globalNpcs[$eventScreen.data.npcId];
	} else {
		npc = null;
	}

	// Derived store for landscape image

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
			{#if $eventScreen.type === 'npc' && npc}
				<div
					class="npc-card"
					style:--npc-first-element-color={elementColors[npc.types[0].toLowerCase()]}
					style:--npc-first-element-bg={elementBgs[npc.types[0].toLowerCase()]}
					style:--npc-second-element-color={npc.types[1] ? elementColors[npc.types[1].toLowerCase()] : elementBgs[npc.types[0].toLowerCase()]}
					style:--npc-second-element-bg={npc.types[1] ? elementBgs[npc.types[1].toLowerCase()] : elementColors[npc.types[0].toLowerCase()]}
				>
						<button
							class="info-button"
							on:click={() => goto(`/journal/character/${npc.id}`)}
							title="View Character Info"
						>
							<img src="/game_icons/info.png" alt="Info" />
						</button>
					<button class="avatar-button" on:click={() => openLightbox(npc.image)}>
						<img src={$eventScreen.image} alt="NPC Avatar" class="npc-image" />
					</button>
					<div class="details">
						<div class="top">
							<div class="npc-name">{npc.name}</div>
							<!-- <div class="npc-title">{npc.title}</div> -->
						</div>
						<div class="mid">
							<div class="elements">
								{#if npc && npc.types}
									{#each npc.types as type}
										<ElementTag element={type} size="mini" />
									{/each}
								{/if}
							</div>
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
			{:else if $eventScreen.type === 'npc'}
				<p>Could not find NPC data.</p>
			{:else}
				<div class="image-container">
					{#if $eventScreen.image}
						<img
							src={$eventScreen.image}
							alt="Event"
							class:enemy-image={$eventScreen.type === 'enemy' || false}
							class:location-icon={$eventScreen.type === 'resource' ||
								$eventScreen.type === 'location_event'}
						/>
					{/if}
				</div>
				<div class="info-box">
					{#if $eventScreen.type === 'enemy' && $eventScreen.data}
						<h3 class:legendary={$eventScreen.data.isLegendary}>{$eventScreen.data.name}</h3>
						<div class="wr-details">
							<!-- <p>
								World Resonance: <span>{$eventScreen.data.resonanceRequirement}</span>
							</p> -->
							<WRBadge required={$eventScreen.data.resonanceRequirement} playerValue={$playerStore.worldResonance}/>
						</div>

						<!-- Encounter Result -->
						{#if $eventScreen.data.encounterResult}
							{@const r = $eventScreen.data.encounterResult}
							<div class="encounter-result">
								<!-- Outcome badge -->
								<div
									class="outcome-badge"
									class:win={r.outcome === 'win'}
									class:loss={r.outcome === 'loss'}
								>
									{#if r.outcome === 'win'}⚔ VICTORY{:else}✦ ESCAPED{/if}
								</div>

								<!-- Stats row -->
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

								<!-- Drops -->
								{#if r.outcome === 'win' && r.drops?.length > 0}
									<div class="drops">
										<span class="drops-label">DROPS</span>
										<div class="drops-grid">
											{#each r.drops as drop}
												<div class="drop-item">
													<img src={drop.item.image} alt={drop.item.name} class="drop-img" />
													<span class="drop-name">{drop.item.name}</span>
													{#if drop.quantity > 1}
														<span class="drop-qty">×{drop.quantity}</span>
													{/if}
												</div>
											{/each}
										</div>
									</div>
								{/if}

								<!-- Help link -->
								<!-- <a href="/help/combat" class="combat-help">How does combat work? →</a> -->
							</div>
						{/if}
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
	<!-- {#if $eventScreen.type === 'npc' || ($eventScreen.type === 'location_event' && $eventScreen.data?.actions) || $eventScreen.type === 'resource' || ($eventScreen.type === 'enemy' && $eventScreen.data.isLegendary) }
		<ChoiceMenu />
	{/if} -->
</div>

<style>
	.event-screen {
		position: relative;
		background-color: #75594b;
		/* padding: 1rem; */
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: white;
		min-height: 200px;
		min-width: 300px;
		box-sizing: border-box;
		overflow: hidden;
		gap: 1rem;
		border: 10px solid var(--surface-3);
		/* margin-left: 1.5rem; */
		border-radius: 0 0 9px 9px;
		/* overflow: hidden; */
		/* border-radius: 12px; */
		background-size: contain;
		background-position: bottom center;
	}
	.encounter-result {
		margin-top: 0.6rem;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* Outcome badge */
	.outcome-badge {
		text-align: center;
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.7rem;
		letter-spacing: 0.12em;
		padding: 0.3rem 0.6rem;
		border-radius: 4px;
		border: 1px solid;
	}
	.outcome-badge.win {
		color: #4ade80;
		border-color: #4ade8044;
		background: rgba(74, 222, 128, 0.08);
	}
	.outcome-badge.loss {
		color: #fbbf24;
		border-color: #fbbf2444;
		background: rgba(251, 191, 36, 0.08);
	}

	/* Stats row */
	.result-stats {
		display: flex;
		align-items: center;
		justify-content: space-between;
		/* flex-direction: column; */
		gap: 0.4rem;
		padding-right: 0.5rem;
	}
	.stat-pill {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.2rem 0.5rem;
		border-radius: 20px;
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.48rem;
	}
	.stat-pill.hp {
		background: rgba(248, 113, 113, 0.15);
		border: 1px solid rgba(248, 113, 113, 0.3);
	}
	.stat-pill.xp {
		background: rgba(144, 169, 85, 0.15);
		border: 1px solid rgba(144, 169, 85, 0.3);
	}
	.stat-icon {
		font-size: 0.5rem;
		opacity: 0.7;
	}
	.stat-label {
		color: #eee;
	}
	.stat-val {
		font-weight: bold;
		color: #eee;
	}
	.stat-pill.hp .stat-val {
		color: #f87171;
	}
	.stat-pill.xp .stat-val {
		color: #90a955;
	}

	.escape-reason {
		font-size: 0.48rem;
		color: #fbbf24;
		margin: 0;
		font-family: var(--font-family-pixel, monospace);
	}

	/* Drops */
	.drops {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.drops-label {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.4rem;
		letter-spacing: 0.12em;
		color: #aaaaaa;
	}
	.drops-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.drop-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 4px;
		padding: 0.2rem 0.4rem 0.2rem 0.25rem;
	}
	.drop-img {
		width: 16px;
		height: 16px;
		object-fit: contain;
		image-rendering: pixelated;
	}
	.drop-name {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.45rem;
		color: #ddd;
	}
	.drop-qty {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.42rem;
		color: #eee;
	}

	/* Help link */
	.combat-help {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.42rem;
		color: #60a5fa;
		text-decoration: none;
		opacity: 0.7;
		transition: opacity 0.15s;
		align-self: flex-end;
	}
	.combat-help:hover {
		opacity: 1;
	}
	.npc-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.container {
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.7);
		padding: 1rem;
		/* backdrop-filter: blur(2px); */
		display: flex;
		/* flex-direction: column; */
		padding-top: 2rem;
		flex-grow: 1;
		/* align-items: center; */
		/* justify-content: center; */
		/* margin: 1rem 0 auto 1rem; */
		/* gap: 2rem; */
	}

	.info-button {
		position: absolute;
		top: 148px;
		left: 148px;
		z-index: 3;
		background: none;
		background-color: color-mix(in srgb, #ffffff 30%, var(--npc-first-element-bg));
		border: none;
		padding: 2px;
		border-radius: 6px 0 6px 0;
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
		z-index: 2;
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
		img {
			max-width: 200px;
			max-height: 200px;
			object-fit: contain;
			image-rendering: pixelated;
		}
	}
	.npc-image,
	.enemy-image {
		width: 160px;
		height: 160px;
		border-radius: 8px;
		image-rendering: auto;
		border: 4px solid color-mix(in srgb, #ffffff 30%, var(--npc-first-element-bg));
		box-shadow: var(--npc-first-element-bg) 0 6px 0 3px, var(--npc-first-element-bg) 0 -0px 0 3px ;
	}
	.location-icon {
		width: 160px;
		height: 160px;
		object-fit: cover;
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
		text-shadow: black 1px 2px;
	}
	.wr-details {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0;
		span {
			color: rgb(245, 208, 117);
		}
		p {
			padding: 0;
			margin: 0;
			font-family: var(--font-family-pixel);
			font-size: 0.75rem;
			color: #e8e8e8;
		}
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
		background-color: var(--surface-2);
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
		/* gap: 2rem; */
		position: relative;

		.details {
			display: flex;
			flex-direction: column;
			/* gap: 1rem; */
			justify-content: flex-start;
			position: relative;
		}

		.top {
			z-index: 1;
			position: relative;
			top: 1rem;
			left: -1rem;
			padding-left: 1.5rem;
			padding-right: 1.5rem;
			padding-block: 0.5rem;
			width: fit-content;
			display: flex;
			flex-direction: column;
			font-family: var(--font-family-pixel);
			font-size: 1.3rem;
			font-weight: 600;
			color: var(--npc-first-element-color);
			background-color: var(--npc-first-element-bg);
			clip-path: polygon(0 0, 90% 0, 100% 100%, 0% 100%);
		}
		.npc-title {
			font-size: 0.75rem;
			font-family: var(--font-family-pixel);
			font-weight: 400;
		}

		.mid {
			margin-top: 1rem;
			/* border: 1px solid white; */
			display: flex;
			gap: 8px;
			/* align-items: flex-start; */
			/* justify-content: space-evenly; */
		}

		.bot {
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}

		.elements {
			margin-block: 0.25rem;
			margin-left: 0.25rem;
			display: flex;
			gap: 0.25rem;
		}

		.rank-meters {
			display: flex;
			flex-direction: column;
			justify-content: space-around;
			gap: 0.25rem;
			/* background-color: #555;
			width: fit-content;
			padding-right: .5rem;
			padding-block: .25rem; */
		}
		.rank-meter {
			display: flex;
			align-items: center;
			gap: 0.25rem;
			color: var(--npc-second-element-color);
			background-color: var(--npc-second-element-bg);
			box-shadow: #00000056 0 3px 0 2px;
			border-radius: 0 6px 6px 0;
			width: fit-content;
			padding: 0.25rem;
			padding-right: 1rem;
		}
		.rank-icon {
			width: 20px;
			height: 20px;
			/* background-color: aliceblue; */
			padding: 2px;
		}
	}
</style>
