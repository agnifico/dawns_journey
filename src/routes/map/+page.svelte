<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { game } from '$lib/game/game';
	import { playerStore } from '$lib/stores/playerStore';
	import { npcStore } from '$lib/stores/npcStore';
	import { mapStore } from '$lib/stores/mapStore';
	import { combatStore } from '$lib/stores/combatStore';
    import { dialogueStore } from '$lib/stores/dialogueStore';
	import { mobileInfoPanelView, switchToEventView, switchToLogView } from '$lib/stores/uiStore';
	import MapDisplay from '$lib/components/MapDisplay.svelte';
	import MessageLog from '$lib/components/MessageLog.svelte';
	import EventScreen from '$lib/components/EventScreen.svelte';
	import MobileInfoPanel from '$lib/components/MobileInfoPanel.svelte';
	import CoordinateDisplay from '$lib/components/ui/CoordinateDisplay.svelte';
    import CombatModal from '$lib/components/CombatModal.svelte';
    import QuestTracker from '$lib/components/ui/QuestTracker.svelte';
    import HomesteadStatus from '$lib/components/ui/HomesteadStatus.svelte';
    import DialogueBox from '$lib/components/DialogueBox.svelte';

    let mainElement: HTMLElement;
    let isMobile = false;

	onMount(async () => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        isMobile = mediaQuery.matches;
        const handler = (e: { matches: boolean; }) => isMobile = e.matches;
        mediaQuery.addEventListener('change', handler);

		if (!get(playerStore).isInitialized) {
			await npcStore.initializeGlobalNpcs();
			await game.initializeGame();
			playerStore.update((p) => ({ ...p, isInitialized: true }));
		}
        mainElement.focus();

        return () => mediaQuery.removeEventListener('change', handler);
	});

	function handleKeyDown(event: KeyboardEvent) {
		if (get(combatStore).isInCombat) return;

        if (get(dialogueStore).isOpen) {
            handleMovement(event.key);
            return;
        }

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
    <QuestTracker />
    <HomesteadStatus />
    <DialogueBox />

	<div class="game-view-container">
		<CoordinateDisplay />
		{#if $mapStore.mapData && $playerStore.position}
			<MapDisplay mapData={$mapStore.mapData} player={$playerStore} />
		{:else}
			<p>Loading map...</p>
		{/if}
	</div>

    {#if isMobile}
        <!-- Mobile Bottom Bar -->
        <div class="mobile-bottom-bar">
            <div class="mobile-info-wrapper">
                <MobileInfoPanel />
            </div>
            <div class="mobile-controls">
                <div class="d-pad">
                    <button class="d-pad-up" on:click={() => handleMovement('ArrowUp')}>▲</button>
                    <button class="d-pad-left" on:click={() => handleMovement('ArrowLeft')}>◀</button>
                    <button class="d-pad-right" on:click={() => handleMovement('ArrowRight')}>▶</button>
                    <button class_="d-pad-down" on:click={() => handleMovement('ArrowDown')}>▼</button>
                </div>
                <div class="mobile-center-actions">
                    <button class="switch-view-button" on:click={toggleMobileView}>
                        {$mobileInfoPanelView === 'log' ? 'Event' : 'Log'}
                    </button>
                </div>
                <div class="action-buttons">
                    <button class="b-button">B</button>
                    <button class="a-button" on:click={handleActionButton}>A</button>
                </div>
            </div>
        </div>
    {:else}
        <!-- Desktop Right Panel -->
        <div class="right-panel">
            <div class="event-screen-wrapper">
                <EventScreen />
            </div>
            <div class="message-log-wrapper">
                <MessageLog />
            </div>
        </div>
    {/if}
</main>

<style>
	main {
		width: 100%;
		height: 100vh;
		display: flex;
		background-color: #111;
		outline: none;
	}
	.game-view-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		position: relative;
		width: 100%;
		margin: auto;
	}
	.right-panel {
		display: flex;
		flex-direction: column;
		width: 350px;
		flex-shrink: 0;
		background-color: #222;
		border-left: 1px solid #444;
		height: 100%;
	}

	.event-screen-wrapper {
		flex-shrink: 0;
		border-bottom: 1px solid #444;
		height: 40vh;
	}

	.message-log-wrapper {
		flex-grow: 1;
		height: 50vh;
		display: flex;
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
    
    @media (min-width: 769px) {
        .mobile-bottom-bar {
            display: none;
        }
    }

	@media (max-width: 768px) {
		main {
			flex-direction: column;
		}
		.right-panel {
			display: none;
		}
		.game-view-container {
			height: calc(100% - 280px);
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
		.d-pad {
			position: relative;
			width: 100px;
			height: 100px;
		}
		.d-pad button {
			position: absolute;
			width: 34px;
			height: 34px;
			background-color: rgba(255, 255, 255, 0.2);
			border: 1px solid rgba(255, 255, 255, 0.5);
			color: white;
			font-size: 1.2rem;
		}
		.d-pad-up {
			top: 0;
			left: 33px;
		}
		.d-pad-down {
			bottom: 0;
			left: 33px;
		}
		.d-pad-left {
			top: 33px;
			left: 0;
		}
		.d-pad-right {
			top: 33px;
			right: 0;
		}
		.mobile-center-actions {
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.switch-view-button {
			background-color: #444;
			color: white;
			border: 1px solid #666;
			padding: 8px 16px;
			border-radius: 5px;
			font-size: 1rem;
		}
		.action-buttons {
			display: flex;
			align-items: center;
		}
		.action-buttons button {
			width: 50px;
			height: 50px;
			border-radius: 50%;
			border: 1px solid rgba(255, 255, 255, 0.5);
			color: white;
			font-size: 1.2rem;
			font-weight: bold;
		}
		.a-button {
			background-color: rgba(220, 50, 50, 0.5);
			margin-left: 15px;
		}
		.b-button {
			background-color: rgba(50, 150, 220, 0.5);
		}
	}
</style>