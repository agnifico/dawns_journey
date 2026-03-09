<script lang="ts">
	import { eventScreen } from '$lib/stores/uiStore';
	import StatBar from './StatBar.svelte';
	import { playerStats, playerStore } from '$lib/stores/playerStore';

	// Import HUD elements
	import CoordinateDisplay from '$lib/components/ui/CoordinateDisplay.svelte';
	import TimeDisplay from '$lib/components/ui/TimeDisplay.svelte';
	import DPad from '$lib/components/ui/DPad.svelte';
	import WeaponWidget from './WeaponWidget.svelte';
	import Notification from '$lib/components/Notification.svelte';
	import RegionNotification from '../RegionNotification.svelte';
	import NewItemNotif from '../NewItemNotif.svelte';
	import MapEventNotif from '../MapEventNotif.svelte';
	import ChoiceMenu from './ChoiceMenu.svelte';
	import EventScreen from '../EventScreen.svelte';

	// Note: Draggability for trackers is a future task.
	// For now, they are positioned statically within the HUD.
</script>

<div class="map-hud-container">
	<div class="top-left">
		<CoordinateDisplay />
	</div>

	<div class="top-right">
		<TimeDisplay />
		<MapEventNotif />
	</div>

	<div class="bottom-left">
		<NewItemNotif />
		<!-- <Notification/> -->
		<div class="stat-bars">
			<StatBar current={$playerStats.hp} max={$playerStats.maxHp} color="#6a994e" />
			<StatBar current={$playerStats.auraShield} max={$playerStats.maxAuraShield} color="#a98467" />
		</div>
		<WeaponWidget />
	</div>
	<div class="bottom-center">
		<RegionNotification />
	</div>

	<div class="bottom-right">
		<DPad />
	</div>
	<div class="es-wrapper">
		<EventScreen />
		<!-- <DialogueBox /> -->
		{#if $eventScreen.type === 'npc' || ($eventScreen.type === 'location_event' && $eventScreen.data?.actions) || $eventScreen.type === 'resource' || ($eventScreen.type === 'enemy' && $eventScreen.data.isLegendary)}
			<ChoiceMenu />
		{/if}
	</div>
</div>


<style>
	.map-hud-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none; /* Parent container doesn't capture clicks */
		z-index: 10;
	}

	.es-wrapper {
		min-width: 200px;
		max-width: 400px;
		width: fit-content;
		/* padding: 1rem; */
		position: absolute;
		top: 1rem;
		left: 1rem;
	}

	.map-hud-container > * {
		pointer-events: all; /* But children do */
		position: absolute;
	}

	.top-left {
		top: 1rem;
		left: 1rem;
		z-index: 10;
		/* pointer-events: none; */
	}

	.bottom-center {
		top: 1rem;
		left: 50%;
		transform: translateX(-50%);
	}

	.stat-bars {
		display: flex;
		flex-direction: column;
		gap: 4px;
		background-color: rgba(0, 0, 0, 0.5);
		padding: 0.5rem;
		border-radius: 8px;
	}

	.top-right {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 1rem;
	}

	.bottom-left {
		bottom: 1rem;
		left: 1rem;
		display: flex;
		align-items: flex-end;
		gap: 1rem;
	}

	.bottom-right {
		bottom: 1rem;
		right: 1rem;
	}


	/* On mobile, the DPad is a separate block, not a HUD overlay */
	@media (max-width: 768px) {
		.bottom-left {
			display: none;
		}
		.top-left,
		.top-right {
			margin-top: 2rem;
		}
	}
</style>