<script lang="ts">
	import { eventScreen, showEventScreen } from '$lib/stores/uiStore';
	import StatBar from './StatBar.svelte';
	import { getFirstInventoryItem, useItem } from '$lib/services/InventoryService';
	import { playerStore, playerStats } from '$lib/stores/playerStore';

	import CoordinateDisplay from '$lib/components/ui/CoordinateDisplay.svelte';
	import TimeDisplay from '$lib/components/ui/TimeDisplay.svelte';
	import DPad from '$lib/components/ui/DPad.svelte';
	import WeaponWidget from './WeaponWidget.svelte';
	import RegionNotification from '../RegionNotification.svelte';
	import NewItemNotif from '../NewItemNotif.svelte';
	import MapEventNotif from '../MapEventNotif.svelte';
	import ChoiceMenu from './ChoiceMenu.svelte';
	import EventScreen from '../EventScreen.svelte';
	import { toastStore } from '$lib/stores/toastStore';
	import HPBar from '../HPBar.svelte';

	// ── Highlight toggle ─────────────────────────────────────────────────────
	// MapDisplay exposes `toggleHighlight` and `showHighlights` via bind:this.
	// MapHUD receives them as props so the button can reflect current state.
	export let showHighlights: boolean = false;
	export let onToggleHighlight: () => void = () => {};

	$: bread = getFirstInventoryItem($playerStore.inventory, 'bread');
	$: breadCount = $playerStore.inventory.filter((i) => i.id === 'bread').length;

	// ── Draggable EventScreen ────────────────────────────────────────────────
	let esEl: HTMLElement;
	let dragging = false;
	let dragOffsetX = 0;
	let dragOffsetY = 0;
	let esX = 16;
	let esY = 16;

	function onDragStart(e: MouseEvent) {
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

	// $: if ($eventScreen.type) { esX = 16; esY = 16; }

	$: showChoiceMenu =
		$eventScreen.type === 'npc' ||
		($eventScreen.type === 'location_event' && $eventScreen.data?.actions) ||
		$eventScreen.type === 'resource' ||
		($eventScreen.type === 'enemy' && $eventScreen.data?.isLegendary);
</script>

<svelte:window on:mousemove={onDragMove} on:mouseup={onDragEnd} />

<div class="map-hud-container">

	<!-- Top-left: coordinates + highlight toggle -->
	<div class="top-left">
		<button
			class="highlight-toggle"
			class:active={showHighlights}
			on:click={onToggleHighlight}
			title="Toggle entity highlights (H)"
		>
			<span class="toggle-icon">{showHighlights ? '◉' : '◎'}</span>
			<span class="toggle-label">Points of Interest (H)</span>
		</button>
		<CoordinateDisplay />
	</div>

	<div class="top-right">
		<div class="row-flex">
			<TimeDisplay />
			<div class="stat-bars">
				<HPBar type="hp"   current={$playerStats.hp}          max={$playerStats.maxHp}          />
				<HPBar type="aura" current={$playerStats.auraShield}   max={$playerStats.maxAuraShield}  />
			</div>
		</div>
		<MapEventNotif />
	</div>

	<div class="bottom-left">
		<NewItemNotif />
	</div>

	<div class="top-center">
		<RegionNotification />
	</div>

	<div class="bottom-center">
		<WeaponWidget />
		<button
			class="bread"
			on:click={() => {
				const bread = getFirstInventoryItem($playerStore.inventory, 'bread');
				if (bread?.instanceId) {
					useItem(bread.instanceId);
					toastStore.success('Ate some Bread. Helth maxx!!');
				} else toastStore.warning("OH FUCK WE'RE OUT OF BREAD!! GET SOME BREAD!");
			}}
		>
			<img src="/general/bread.png" alt="" />
		</button>
	</div>

	<div class="bottom-right">
		<DPad />
	</div>

	{#if $showEventScreen}
		<div class="es-wrapper" class:dragging style="left: {esX}px; top: {esY}px;" bind:this={esEl}>
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

	/* ── Highlight toggle button ── */
	.highlight-toggle {
		display: flex;
		align-items: center;
		gap: 5px;
		margin-top: 6px;
		padding: 4px 8px 4px 6px;
		background: rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 6px;
		color: rgba(255, 255, 255, 0.55);
		font-size: 10px;
		font-family: monospace;
		letter-spacing: 0.5px;
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
	}
	.highlight-toggle:hover {
		background: rgba(0, 0, 0, 0.7);
		color: rgba(255, 255, 255, 0.85);
		border-color: rgba(255, 255, 255, 0.25);
	}
	.highlight-toggle.active {
		background: rgba(99, 202, 255, 0.15);
		border-color: rgba(99, 202, 255, 0.5);
		color: rgba(99, 202, 255, 0.9);
	}
	.toggle-icon {
		font-size: 12px;
		line-height: 1;
	}
	.toggle-label {
		text-transform: uppercase;
	}

	/* ── Bread button ── */
	.bread {
		position: relative;
		aspect-ratio: 1;
		background-color: transparent;
		border: none;
		padding: 0;
		border-radius: 0;
		&:hover {
			background-color: var(--color-primary);
			border-radius: 12px;
		}
	}

	/* ── Draggable event panel ── */
	.es-wrapper {
		min-width: 200px;
		max-width: 400px;
		width: fit-content;
		position: absolute;
		user-select: none;
		transition: left 0.15s ease, top 0.15s ease;
	}
	.es-wrapper.dragging {
		transition: none;
		cursor: grabbing;
		opacity: 0.95;
	}
	.drag-handle {
		height: 18px;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: grab;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}
	.drag-handle:active { cursor: grabbing; }
	.drag-dots {
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.25);
		letter-spacing: 2px;
	}

	/* ── Fixed HUD zones ── */
	.row-flex {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.top-left {
		top: 1rem; left: 1rem;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
	.top-right {
		top: 1rem; right: 1rem;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 1rem;
	}
	.top-center {
		top: 1rem;
		left: 50%;
		transform: translateX(-50%);
	}
	.bottom-center {
		display: flex;
		gap: 1rem;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
	}
	.bottom-left {
		bottom: 1rem; left: 1rem;
		display: flex;
		align-items: flex-end;
		gap: 1rem;
	}
	.bottom-right {
		bottom: 1rem; right: 1rem;
	}
	.stat-bars {
		display: flex;
		flex-direction: column;
		gap: 4px;
		background-color: rgba(0, 0, 0, 0.5);
		padding: 0.5rem;
		border-radius: 8px;
		width: 200px;
	}

	@media (max-width: 768px) {
		.bottom-left { display: none; }
		.top-left, .top-right { margin-top: 2rem; }
	}
</style>