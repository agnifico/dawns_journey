<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { get } from 'svelte/store';
	import { game } from '$lib/game/game';
	import { playerStore } from '$lib/stores/playerStore';
	import { npcStore } from '$lib/stores/npcStore';
	import { mapStore, currentMapData } from '$lib/stores/mapStore';
	import { time } from '$lib/stores/timeStore';
	import { combatStore } from '$lib/stores/combatStore';
	import { dialogueStore } from '$lib/stores/dialogueStore';
	import { checkForTileInteraction } from '$lib/services/InteractionService';
	import { checkForRandomEncounter } from '$lib/services/EncounterService';
	import { processBuffs } from '$lib/services/BuffService';
	import * as AchievementService from '$lib/services/AchievementService';
	import { getRegionForPosition } from '$lib/services/MapService';
	import {
		mobileInfoPanelView,
		switchToEventView,
		switchToLogView,
		showQuestTracker,
		showHomesteadTracker,
		showMessageBox,
		eventScreen,
		clearEvent
	} from '$lib/stores/uiStore';
	import MapDisplay from '$lib/components/MapDisplay.svelte';
	import MessageLog from '$lib/components/MessageLog.svelte';
	import EventScreen from '$lib/components/EventScreen.svelte';
	import MobileInfoPanel from '$lib/components/MobileInfoPanel.svelte';
	import CoordinateDisplay from '$lib/components/ui/CoordinateDisplay.svelte';
	import CombatModal from '$lib/components/CombatModal.svelte';
	import QuestTracker from '$lib/components/ui/QuestTracker.svelte';
	import HomesteadStatus from '$lib/components/ui/HomesteadStatus.svelte';
	// import DialogueBox from '$lib/components/DialogueBox.svelte';
	import LeftControlPanel from '$lib/components/LeftControlPanel.svelte';
	import { validateAllData } from '$lib/services/ValidationService';
	import { questStore } from '$lib/stores/questStore';
	import ChoiceMenu from '$lib/components/ui/ChoiceMenu.svelte';
	import TimeDisplay from '$lib/components/ui/TimeDisplay.svelte';
	import MapHUD from '$lib/components/ui/MapHUD.svelte';
	import RegionNotification from '$lib/components/RegionNotification.svelte';

	let mainElement: HTMLElement;
	let isMobile = false;
	let lastSteps = $playerStore.stepsTaken;

	onMount(async () => {
		const mediaQuery = window.matchMedia('(max-width: 768px)');
		isMobile = mediaQuery.matches;
		const handler = (e: { matches: boolean }) => (isMobile = e.matches);
		mediaQuery.addEventListener('change', handler);

		if (!get(playerStore).isInitialized) {
			await npcStore.initializeGlobalNpcs();
			validateAllData(get(questStore), get(npcStore));
			await game.initializeGame();
			playerStore.update((p) => ({ ...p, isInitialized: true }));
		}
		mainElement.focus();

		return () => mediaQuery.removeEventListener('change', handler);
	});

	$: if ($playerStore.stepsTaken > lastSteps) {
		(async () => {
			const player = get(playerStore);
			const mapData = get(currentMapData);
			if (!mapData) return;

			// Process buffs
			const nextTime = get(time) + 1;
			const buffedPlayer = processBuffs(player, nextTime);
			playerStore.update((p) => ({ ...p, ...buffedPlayer }));

			// Update time and other stores
			time.update((t) => t + 1);
			AchievementService.checkMilestone('steps');
			mapStore.setPlayerPosition(player.position.x, player.position.y);
			clearEvent();

			// Region-related logic
			const regionInfo = getRegionForPosition(player.position, mapData);
			if (regionInfo && get(mapStore).landscape?.id !== regionInfo.id) {
				mapStore.showRegionNotification(regionInfo.name);
				setTimeout(() => {
					mapStore.hideRegionNotification();
				}, 3000);
			}
			mapStore.update((s) => ({ ...s, landscape: regionInfo }));

			// Check for interactions and encounters
			const interactionOccurred = await checkForTileInteraction();
			if (!interactionOccurred) {
				checkForRandomEncounter();
			}
		})();
		lastSteps = $playerStore.stepsTaken;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (get(combatStore).isInCombat) return;

		handleMovement(event.key);

		switch (event.key) {
			case ' ': // A button
			case 'z':
				handleActionButton();
				break;
		}
	}

	function handleMovement(key: string) {
		let dx = 0;
		let dy = 0;

		switch (key) {
			case 'ArrowUp':
			case 'w':
				dy = -1;
				break;
			case 'ArrowDown':
			case 's':
				dy = 1;
				break;
			case 'ArrowLeft':
			case 'a':
				dx = -1;
				break;
			case 'ArrowRight':
			case 'd':
				dx = 1;
				break;
		}

		if (dx !== 0 || dy !== 0) {
			game.movePlayer(dx, dy);
		}
	}

	function handleActionButton() {
		checkForTileInteraction();
	}

	function toggleMobileView() {
		if (get(mobileInfoPanelView) === 'log') {
			switchToEventView();
		} else {
			switchToLogView();
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<main on:keydown={handleKeyDown} tabindex="0" bind:this={mainElement}>
	<CombatModal />
	<!-- <RegionNotification /> -->
	<!-- {#if $showQuestTracker}
		<QuestTracker />
	{/if}
	{#if $showHomesteadTracker}
		<HomesteadStatus />
	{/if} -->

	{#if isMobile}
		<!-- Mobile layout remains unchanged for now -->
		<div class="game-view-container">
			{#if $currentMapData && $playerStore.position}
				<MapDisplay mapData={$currentMapData} player={$playerStore} />
			{:else}
				<p>Loading map...</p>
			{/if}
		</div>
		<div class="mobile-bottom-bar">
			<div class="mobile-info-wrapper">
				<MobileInfoPanel />
			</div>
			<div class="mobile-controls">
				<!-- Mobile controls -->
			</div>
		</div>
	{:else}
		<div class="console-super">
			<div class="console">
				<!-- Desktop Layout -->
				<div class="left-panel">
					<button class="logo-button"><TimeDisplay /></button>
					<LeftControlPanel />
				</div>

				<div class="center-panel">
					<div class="game-view-container">
						<!-- <CoordinateDisplay /> -->
						{#if $currentMapData && $playerStore.position}
						<MapHUD/>
							<MapDisplay mapData={$currentMapData} player={$playerStore} />
						{:else}
							<p>Loading map...</p>
						{/if}
					</div>
					{#if $showMessageBox}
						<div class="message-log-wrapper">
							<MessageLog />
						</div>
					{/if}
				</div>

				<div class="right-panel">
					<EventScreen />
					<!-- <DialogueBox /> -->
					{#if $eventScreen.type === 'npc' || ($eventScreen.type === 'location_event' && $eventScreen.data?.actions) || $eventScreen.type === 'resource' || ($eventScreen.type === 'enemy' && $eventScreen.data.isLegendary)}
						<ChoiceMenu />
					{/if}
				</div>
			</div>
			<!-- <p>Dawn's Journey (c)</p> -->
		</div>
	{/if}
</main>

<style>
	main {
		position: relative;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		display: flex;
		border: none;
		outline: none;
	}
	.console-super {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-block: 1rem 2rem;
		padding-inline: 1rem;
		background-color: #e27a7a;
		border: 6px solid #00000056;
		box-shadow: #00000056 0 -12px 0 0px inset;
		box-sizing: border-box;
		border-radius: 24px;
		margin: auto;
		/* flex-grow: 1; */

		p {
			position: absolute;
			bottom: 2rem;
			left: 50%;
			font-family: var(--font-family-main);
		}
	}

	.console {
		display: flex;
		align-items: flex-start;
		overflow: hidden;
		gap: 1rem;
	}

	.left-panel {
		width: fit-content;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.logo-button {
		border: none;
		margin: auto;
		width: 100%;
		aspect-ratio: 1;
		border-radius: 18px;
		box-sizing: border-box;
		background-color: var(--surface-2);
		box-sizing: border-box;
		border: 6px solid #00000056;
		box-sizing: border-box;
		color: var(--color-primary);
		font-weight: 600;
	}

	.center-panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		box-sizing: border-box;
		background-color: var(--surface-1);
		padding-bottom: 2rem;
		border: 6px solid #00000056;
		box-shadow: #00000056 0 -12px 0 0px inset;
		box-sizing: border-box;
		border-radius: 24px;
	}

	.game-view-container {
		border-radius: 12px;
		overflow: hidden;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 800px;
		height: 400px;
		background-color: #222;
		border: 3px solid var(--surface-2);
		box-sizing: border-box;
	}

	.message-log-wrapper {
		height: 150px;
		width: 600px;
		display: flex;
		border: 3px solid var(--surface-2);
		border-radius: 12px;
		overflow: hidden;
	}

	.right-panel {
		display: flex;
		gap: 1rem;
		flex-direction: column;
		width: 400px;
		flex-shrink: 0;
		padding: 1rem;
		background-color: var(--surface-1);
		padding-bottom: 2rem;
		border: 6px solid #00000056;
		box-shadow: #00000056 0 -12px 0 0px inset;
		border-radius: 24px;
		/* box-sizing: border-box; */
	}

	/* --- MOBILE STYLES --- */
	.mobile-bottom-bar {
		display: none; /* Hide old/mobile panels on desktop */
	}

	@media (max-width: 768px) {
		main {
			flex-direction: column;
			justify-content: flex-start;
			align-items: stretch;
			gap: 0;
		}
		.left-panel,
		.center-panel {
			display: none; /* Hide new desktop layout on mobile */
		}

		.game-view-container {
			width: 100%;
			height: calc(100% - 280px);
			border: none;
		}

		.mobile-bottom-bar {
			display: flex;
			flex-direction: column;
			width: 100%;
			height: 280px;
			background-color: #1a1a1a;
			flex-shrink: 0;
			position: absolute;
			bottom: 0;
		}
		.mobile-info-wrapper {
			height: 160px;
			width: 100%;
			border-bottom: 1px solid #444;
		}
		.mobile-controls {
			height: 120px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0 20px;
			box-sizing: border-box;
		}
		/* ... other mobile styles can be added here ... */
	}
</style>
