<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { game } from '$lib/game/game';
	import { playerStore } from '$lib/stores/playerStore';
	import { npcStore } from '$lib/stores/npcStore';
	import { mapStore, currentMapData } from '$lib/stores/mapStore';
	import { time } from '$lib/stores/timeStore';
	import { combatStore } from '$lib/stores/combatStore';
	import { checkForTileInteraction } from '$lib/services/InteractionService';
	import { checkForRandomEncounter } from '$lib/services/EncounterService';
	import { processBuffs } from '$lib/services/BuffService';
	import * as AchievementService from '$lib/services/AchievementService';
	import { getRegionForPosition } from '$lib/services/MapService';
	import { showMessageBox, showQuestTracker, clearEvent } from '$lib/stores/uiStore';
	import MapDisplay from '$lib/components/MapDisplay.svelte';
	import MessageLog from '$lib/components/MessageLog.svelte';
	import QuestTracker from '$lib/components/ui/QuestTracker.svelte';
	import CombatModal from '$lib/components/CombatModal.svelte';
	import LeftControlPanel from '$lib/components/LeftControlPanel.svelte';
	import { validateAllData } from '$lib/services/ValidationService';
	import { questStore } from '$lib/stores/questStore';
	import MapHUD from '$lib/components/ui/MapHUD.svelte';
	import MobileLayout from '$lib/components/MobileLayout.svelte';

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

			const nextTime = get(time) + 1;
			const buffedPlayer = processBuffs(player, nextTime);
			playerStore.update((p) => ({ ...p, ...buffedPlayer }));

			time.update((t) => t + 1);
			AchievementService.checkMilestone('steps');
			mapStore.setPlayerPosition(player.position.x, player.position.y);
			clearEvent();

			const regionInfo = getRegionForPosition(player.position, mapData);
			if (regionInfo && get(mapStore).landscape?.id !== regionInfo.id) {
				mapStore.showRegionNotification(regionInfo.name);
				setTimeout(() => { mapStore.hideRegionNotification(); }, 3000);
			}
			mapStore.update((s) => ({ ...s, landscape: regionInfo }));

			const interactionOccurred = await checkForTileInteraction();
			if (!interactionOccurred) checkForRandomEncounter();
		})();
		lastSteps = $playerStore.stepsTaken;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (get(combatStore).isInCombat) return;
		handleMovement(event.key);
	}

	function handleMovement(key: string) {
		let dx = 0, dy = 0;
		switch (key) {
			case 'ArrowUp':   case 'w': dy = -1; break;
			case 'ArrowDown': case 's': dy =  1; break;
			case 'ArrowLeft': case 'a': dx = -1; break;
			case 'ArrowRight':case 'd': dx =  1; break;
		}
		if (dx !== 0 || dy !== 0) game.movePlayer(dx, dy);
	}

	// Tray is visible if either toggle is on
	$: showTray = $showMessageBox || $showQuestTracker;
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<main on:keydown={handleKeyDown} tabindex="0" bind:this={mainElement}>
	<CombatModal />

	{#if isMobile}
		<MobileLayout />
	{:else}
		<div class="console">
			<LeftControlPanel />

			<div class="center-col">
				<div class="game-view-container">
					{#if $currentMapData && $playerStore.position}
						<MapHUD />
						<MapDisplay mapData={$currentMapData} player={$playerStore} />
					{:else}
						<p>Loading map...</p>
					{/if}
				</div>

				<!-- Tray only renders if at least one panel is toggled on -->
				{#if showTray}
					<div class="tray">
						{#if $showMessageBox}
							<div class="tray-message">
								<MessageLog />
							</div>
						{/if}
						{#if $showQuestTracker}
							<div class="tray-tracker">
								<QuestTracker />
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</main>

<style>
	main {
		position: fixed;
		inset: 0;
		display: flex;
		outline: none;
		overflow: hidden;
	}

	.console {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		padding-bottom: 2rem;
		box-sizing: border-box;
		background-color: var(--surface-1);
		border: 6px solid #00000056;
		box-shadow: #00000056 0 -12px 0 0px inset;
		border-radius: 24px;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.center-col {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		flex: 1;
		min-width: 0;
		overflow: hidden;
	}

	/* Map grows to fill everything the tray doesn't take */
	.game-view-container {
		flex: 1;
		min-height: 0;
		border-radius: 12px;
		overflow: hidden;
		position: relative;
		background-color: #222;
		border: 3px solid var(--surface-2);
		box-sizing: border-box;
	}

	/* Tray: fixed height, items side by side */
	.tray {
		display: flex;
		gap: 1rem;
		height: 180px;
		flex-shrink: 0;
	}

	/* MessageLog stretches to fill remaining tray width */
	.tray-message {
		flex: 1;
		min-width: 0;
		min-height: 0;
		border: 3px solid var(--surface-2);
		border-radius: 12px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	/* QuestTracker fixed width */
	.tray-tracker {
		flex-shrink: 0;
		width: 240px;
		border: 3px solid var(--surface-2);
		border-radius: 12px;
		overflow: hidden;
	}

	@media (max-width: 768px) {
		.console { display: none; }
	}
</style>