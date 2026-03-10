<script lang="ts">
	import { eventScreen, showEventScreen } from '$lib/stores/uiStore';
	import StatBar from './StatBar.svelte';
	import { playerStats } from '$lib/stores/playerStore';

	import CoordinateDisplay from '$lib/components/ui/CoordinateDisplay.svelte';
	import TimeDisplay from '$lib/components/ui/TimeDisplay.svelte';
	import DPad from '$lib/components/ui/DPad.svelte';
	import WeaponWidget from './WeaponWidget.svelte';
	import RegionNotification from '../RegionNotification.svelte';
	import NewItemNotif from '../NewItemNotif.svelte';
	import MapEventNotif from '../MapEventNotif.svelte';
	import ChoiceMenu from './ChoiceMenu.svelte';
	import EventScreen from '../EventScreen.svelte';

	// ── Draggable EventScreen ────────────────────────────────────────────────
	// Constrained to the parent .map-hud-container bounds.
	let esEl: HTMLElement;
	let dragging = false;
	let dragOffsetX = 0;
	let dragOffsetY = 0;
	let esX = 16;   // initial left
	let esY = 16;   // initial top

	function onDragStart(e: MouseEvent) {
		// Only drag on the header, not on buttons
		if ((e.target as HTMLElement).closest('button')) return;
		dragging = true;
		dragOffsetX = e.clientX - esX;
		dragOffsetY = e.clientY - esY;
		e.preventDefault();
	}

	function onDragMove(e: MouseEvent) {
		if (!dragging || !esEl) return;
		const parent = esEl.parentElement!;
		const pr = parent.getBoundingClientRect();
		const er = esEl.getBoundingClientRect();
		esX = Math.min(Math.max(0, e.clientX - dragOffsetX - pr.left), pr.width  - er.width);
		esY = Math.min(Math.max(0, e.clientY - dragOffsetY - pr.top),  pr.height - er.height);
	}

	function onDragEnd() { dragging = false; }

	// Reset position when event changes so it re-docks to top-left
	$: if ($eventScreen.type) { esX = 16; esY = 16; }

	$: showChoiceMenu =
		$eventScreen.type === 'npc' ||
		($eventScreen.type === 'location_event' && $eventScreen.data?.actions) ||
		$eventScreen.type === 'resource' ||
		($eventScreen.type === 'enemy' && $eventScreen.data?.isLegendary);
</script>

<svelte:window on:mousemove={onDragMove} on:mouseup={onDragEnd} />

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

	<!-- Draggable EventScreen — only shown when $showEventScreen is true -->
	{#if $showEventScreen}
		<div
			class="es-wrapper"
			class:dragging
			style="left: {esX}px; top: {esY}px;"
			bind:this={esEl}
		>
			<!-- Drag handle strip -->
			<div class="drag-handle" on:mousedown={onDragStart} role="presentation">
				<span class="drag-dots">⠿</span>
			</div>
			<EventScreen />
			{#if showChoiceMenu}
				<ChoiceMenu />
			{/if}
		</div>
	{/if}
</div>

<style>
	.map-hud-container {
		position: absolute;
		top: 0; left: 0;
		width: 100%; height: 100%;
		pointer-events: none;
		z-index: 10;
	}

	.map-hud-container > * {
		pointer-events: all;
		position: absolute;
	}

	/* ── Draggable event panel ── */
	.es-wrapper {
		min-width: 200px;
		max-width: 400px;
		width: fit-content;
		position: absolute;
		/* border-radius: 12px; */
		overflow: hidden;
		box-shadow: 0 8px 24px rgba(0,0,0,0.5);
		user-select: none;
		/* Smooth snap back on event change */
		transition: left 0.15s ease, top 0.15s ease;
	}

	.es-wrapper.dragging {
		transition: none;
		cursor: grabbing;
		opacity: 0.95;
	}

	.drag-handle {
		height: 18px;
		background: rgba(0,0,0,0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: grab;
		border-bottom: 1px solid rgba(255,255,255,0.06);
	}

	.drag-handle:active { cursor: grabbing; }

	.drag-dots {
		font-size: 0.7rem;
		color: rgba(255,255,255,0.25);
		letter-spacing: 2px;
	}

	/* ── Fixed HUD zones ── */
	.top-left  { top: 1rem; left: 1rem; z-index: 10; }
	.top-right {
		top: 1rem; right: 1rem;
		display: flex; flex-direction: column; align-items: flex-end; gap: 1rem;
	}
	.bottom-center {
		top: 1rem; left: 50%; transform: translateX(-50%);
	}
	.bottom-left {
		bottom: 1rem; left: 1rem;
		display: flex; align-items: flex-end; gap: 1rem;
	}
	.bottom-right { bottom: 1rem; right: 1rem; }

	.stat-bars {
		display: flex; flex-direction: column; gap: 4px;
		background-color: rgba(0,0,0,0.5);
		padding: 0.5rem; border-radius: 8px;
	}

	@media (max-width: 768px) {
		.bottom-left { display: none; }
		.top-left, .top-right { margin-top: 2rem; }
	}
</style>