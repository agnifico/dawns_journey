<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { game } from '$lib/game/game';
	import { playerStore } from '$lib/stores/playerStore';
	import { npcStore } from '$lib/stores/npcStore';
	import { mapStore } from '$lib/stores/mapStore';
	import { combatStore } from '$lib/stores/combatStore';
	import { dialogueStore } from '$lib/stores/dialogueStore';
	import {
		mobileInfoPanelView,
		switchToEventView,
		switchToLogView,
		showQuestTracker,
		showHomesteadTracker,
		showMessageBox,
		eventScreen
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

	let mainElement: HTMLElement;
	let isMobile = false;

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

	function handleKeyDown(event: KeyboardEvent) {
		if (get(combatStore).isInCombat) return;

		handleMovement(event.key);

		switch (event.key) {
			case ' ': // A button
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
		// Placeholder for context-sensitive action
	}

	function toggleMobileView() {
		if (get(mobileInfoPanelView) === 'log') {
			switchToEventView();
		} else {
			switchToLogView();
		}
	}
</script>

<main on:keydown={handleKeyDown} tabindex="0" bind:this={mainElement}>
	<CombatModal />
	{#if $showQuestTracker}
		<QuestTracker />
	{/if}
	{#if $showHomesteadTracker}
		<HomesteadStatus />
	{/if}

	{#if isMobile}
		<!-- Mobile layout remains unchanged for now -->
		<div class="game-view-container">
			{#if $mapStore.mapData && $playerStore.position}
				<MapDisplay mapData={$mapStore.mapData} player={$playerStore} />
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
					<CoordinateDisplay />
					{#if $mapStore.mapData && $playerStore.position}
						<MapDisplay mapData={$mapStore.mapData} player={$playerStore} />
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
		/* height: 100vh; */
		display: flex;
		border: none;
		outline: none;
	}
	.console-super {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		/* gap: 2rem; */
		padding-block: 1rem 2rem;
		padding-inline: 1rem;
		background-color: #e27a7a;
		border: 6px solid #00000056;
		box-shadow: #00000056 0 -12px 0 0px inset;
		box-sizing: border-box;
		border-radius: 24px;
		margin: 2rem auto 2rem 2rem;

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
		gap: .5rem;
	}

	.logo-button {
		border: none;
		margin: auto;
		width: 100%;
		aspect-ratio: 1;
		border-radius: 18px;
		box-sizing: border-box;
		background-color: var(--color-surface-2);
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
		background-color: var(--color-surface-1);
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
		width: 600px;
		height: 400px;
		background-color: #222;
		border: 3px solid var(--color-surface-2);
		box-sizing: border-box;
	}

	.message-log-wrapper {
		height: 150px;
		width: 600px;
		display: flex;
		border: 3px solid var(--color-surface-2);
		border-radius: 12px;
		overflow: hidden;
	}

	.right-panel {
		display: flex;
		gap: 1rem;
		flex-direction: column;
		width: 400px;
		/* height: 400px; */
		flex-shrink: 0;
		padding: 1rem;
		background-color: var(--color-surface-1);
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
