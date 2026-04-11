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
	import { showMessageBox, showQuestTracker, clearEvent, eventScreen } from '$lib/stores/uiStore';
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

	// ── Highlight toggle ──────────────────────────────────────────────────────
	let showHighlights = false;
	function toggleHighlight() {
		showHighlights = !showHighlights;
	}

	// ── Legendary enemy warning modal ─────────────────────────────────────────
	// When player tries to move away from a legendary enemy tile, we intercept
	// the first movement and show a confirmation. The pending move is stored and
	// applied if the player confirms (presses the direction again or clicks Yes).
	// Pressing Escape or clicking No cancels and keeps the player on the tile.
	let showLegendaryWarning = false;
	let pendingMove: { dx: number; dy: number } | null = null;

	function dismissLegendaryWarning() {
		showLegendaryWarning = false;
		pendingMove = null;
	}

	function confirmLegendaryMove() {
		if (pendingMove) {
			showLegendaryWarning = false;
			const { dx, dy } = pendingMove;
			pendingMove = null;
			game.movePlayer(dx, dy);
		}
	}

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

	// ── Step handler ──────────────────────────────────────────────────────────
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
				setTimeout(() => {
					mapStore.hideRegionNotification();
				}, 3000);
			}
			mapStore.update((s) => ({ ...s, landscape: regionInfo }));

			const interactionOccurred = await checkForTileInteraction();
			if (!interactionOccurred) checkForRandomEncounter();
		})();
		lastSteps = $playerStore.stepsTaken;
	}

	// ── NPC event screen auto-clear ───────────────────────────────────────────
	// When the event screen is showing an NPC and the player steps off their
	// tile, clear the screen. Runs reactively on position change.
	$: if ($eventScreen.type === 'npc' && $eventScreen.data?.npcId) {
		// clearEvent is already called on every step in the step handler above.
		// This block is intentionally minimal — the step handler's clearEvent()
		// followed by checkForTileInteraction() re-opens the event if player is
		// still on the NPC tile, and leaves it closed if they've moved away.
		// No additional reactive check needed here.
	}

	// ── Movement handler ──────────────────────────────────────────────────────
	function handleKeyDown(event: KeyboardEvent) {
		if (get(combatStore).isInCombat) return;

		if (event.key === 'h' || event.key === 'H') {
			toggleHighlight();
			return;
		}

		// Dismiss legendary warning with Escape
		if (showLegendaryWarning && event.key === 'Escape') {
			dismissLegendaryWarning();
			return;
		}

		// If warning is showing — any movement key confirms the move
		if (showLegendaryWarning) {
			const key = event.key;
			const isMove = [
				'ArrowUp',
				'ArrowDown',
				'ArrowLeft',
				'ArrowRight',
				'w',
				'a',
				's',
				'd'
			].includes(key);
			if (isMove) {
				event.preventDefault();
				confirmLegendaryMove();
			}
			return;
		}

		handleMovement(event.key);
	}

	function handleMovement(key: string) {
		let dx = 0,
			dy = 0;
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
		if (dx === 0 && dy === 0) return;

		// Check if current tile has a legendary enemy and player is moving away
		const screen = get(eventScreen);
		if (screen.type === 'enemy' && screen.data?.isLegendary) {
			// First move attempt — show warning, store the intended move
			showLegendaryWarning = true;
			pendingMove = { dx, dy };
			return;
		}

		game.movePlayer(dx, dy);
	}

	$: showTray = $showMessageBox || $showQuestTracker;
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<main on:keydown={handleKeyDown} tabindex="0" bind:this={mainElement}>
	<CombatModal />

	<!-- Legendary enemy warning modal -->
	{#if showLegendaryWarning}
		<div class="legendary-overlay" on:click|self={dismissLegendaryWarning}>
			<div class="legendary-modal">
				<p class="legendary-title">⚔ LEGENDARY ENEMY</p>
				<p class="legendary-body">A legendary enemy is here. Move away?</p>
				<div class="legendary-buttons">
					<button class="legendary-btn confirm" on:click={confirmLegendaryMove}>
						Yes, leave [D-PAD]
					</button>
					<button class="legendary-btn cancel" on:click={dismissLegendaryWarning}>
						No, stay [ESC]
					</button>
				</div>
			</div>
		</div>
	{/if}

	{#if isMobile}
		<MobileLayout />
	{:else}
		<div class="console">
			<LeftControlPanel />
			<div class="center-col">
				<div class="game-view-container">
					{#if $currentMapData && $playerStore.position}
						<MapHUD {showHighlights} onToggleHighlight={toggleHighlight} />
						<MapDisplay mapData={$currentMapData} player={$playerStore} {showHighlights} />
					{:else}
						<p>Loading map...</p>
					{/if}
				</div>
				{#if showTray}
					<div class="tray">
						{#if $showMessageBox}
							<div class="tray-message"><MessageLog /></div>
						{/if}
						{#if $showQuestTracker}
							<div class="tray-tracker"><QuestTracker /></div>
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
	.tray {
		display: flex;
		gap: 1rem;
		height: 180px;
		flex-shrink: 0;
	}
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
	.tray-tracker {
		flex-shrink: 0;
		width: 240px;
		border: 3px solid var(--surface-2);
		border-radius: 12px;
		overflow: hidden;
	}

	/* ── Legendary warning modal ── */
	.legendary-overlay {
		position: fixed;
		inset: 0;
		z-index: 900;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.6);
	}
	.legendary-modal {
		background-color: var(--surface-2);
		border: 3px solid #e07a5f;
		border-radius: 12px;
		padding: 1.5rem 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		font-family: 'Silkscreen', sans-serif;
		box-shadow: #e07a5f 0 -4px 0 2px inset;
		max-width: 320px;
		text-align: center;
	}
	.legendary-title {
		color: #e07a5f;
		font-size: 1rem;
		margin: 0;
		letter-spacing: 0.05em;
	}
	.legendary-body {
		color: var(--text-muted);
		font-size: 0.85rem;
		margin: 0;
	}
	.legendary-buttons {
		display: flex;
		gap: 0.5rem;
		width: 100%;
	}
	.legendary-btn {
		flex: 1;
		padding: 0.4rem 0.5rem 0.6rem;
		border: none;
		border-radius: 6px;
		font-family: 'Silkscreen', sans-serif;
		font-size: 0.75rem;
		cursor: pointer;
	}
	.legendary-btn.confirm {
		background-color: var(--surface-3);
		color: var(--text-muted);
		box-shadow: #00000056 0 -3px 0 3px inset;
	}
	.legendary-btn.confirm:hover {
		background-color: #51bfc1;
		color: #111;
	}
	.legendary-btn.cancel {
		background-color: color-mix(in srgb, #e07a5f 25%, var(--surface-3));
		color: #e07a5f;
		box-shadow: color-mix(in srgb, #e07a5f 40%, #000) 0 -3px 0 3px inset;
	}
	.legendary-btn.cancel:hover {
		background-color: #e07a5f;
		color: #111;
	}
	@media (max-width: 768px) {
		.console {
			display: none;
		}
	}
</style>
