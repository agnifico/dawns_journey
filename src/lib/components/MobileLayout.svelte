<script lang="ts">
	import { goto } from '$app/navigation';
	import { eventScreen, clearEvent, showMessageBox } from '$lib/stores/uiStore';
	import { currentMapData } from '$lib/stores/mapStore';
	import { playerStore, playerStats } from '$lib/stores/playerStore';
	import { questStore } from '$lib/stores/questStore';
	import { game } from '$lib/game/game';

	import MapDisplay from '$lib/components/MapDisplay.svelte';
	import MapHUD from '$lib/components/ui/MapHUD.svelte';
	import MessageLog from '$lib/components/MessageLog.svelte';
	import StatBar from '$lib/components/ui/StatBar.svelte';
	import QuestTracker from '$lib/components/ui/QuestTracker.svelte';
	import MobileEventCard from '$lib/components/MobileEventCard.svelte';
	import MobileEventPanel from '$lib/components/MobileEventPanel.svelte';
	import NewItemNotif from './NewItemNotif.svelte';
	import TileMessagePanel from '$lib/components/TileMessagePanel.svelte';
	import DialogueBox from './DialogueBox.svelte';

	let hasUnread = false;

	// --- Movement ---
	function handleMove(dx: number, dy: number) {
		game.movePlayer(dx, dy);
	}

	// --- Event type routing ---
	$: isCardEvent = $eventScreen.type === 'enemy' || $eventScreen.type === 'resource';
	$: isPanelEvent = $eventScreen.type === 'npc';

	// --- Drawers ---
	let questDrawerOpen = false;
	let logDrawerOpen = false;

	// Quest drawer closes on card/panel events; log stays open
	$: if (isCardEvent || isPanelEvent) questDrawerOpen = false;

	// --- DPad opacity ---
	let dpadActive = false;
	let dpadTimer: ReturnType<typeof setTimeout>;

	function onDpadTouch() {
		dpadActive = true;
		clearTimeout(dpadTimer);
		dpadTimer = setTimeout(() => (dpadActive = false), 3000);
	}

	// --- Nav ---
	type Tab = 'map' | 'inventory' | 'journal' | 'shop' | 'settings';
	let activeTab: Tab = 'map';

	function navigate(path: string, tab: Tab) {
		activeTab = tab;
		goto(path);
	}

	$: activeQuestCount = Object.values($questStore.quests).filter(
		(q) => q.state === 'ACTIVE' || q.state === 'REPORT_PENDING'
	).length;
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="mobile-root"
	on:pointerdown={() => {
		if (dpadActive) {
			clearTimeout(dpadTimer);
			dpadTimer = setTimeout(() => (dpadActive = false), 2000);
		}
	}}
>
	<!-- ============================================================
	     MAP AREA — always present, events float above it
	     ============================================================ -->
	<div class="map-area">
		{#if $currentMapData && $playerStore.position}
			<!-- <MapHUD /> -->
			<NewItemNotif />
			<MapDisplay mapData={$currentMapData} player={$playerStore} />
			<!-- <DialogueBox /> -->
		{:else}
			<div class="loading">Loading map...</div>
		{/if}

		<!-- HP strip top-left -->
		<div class="hp-strip">
			<div class="hp-bars">
				<StatBar current={$playerStats.hp} max={$playerStats.maxHp} color="#6a994e" />
				<StatBar
					current={$playerStats.auraShield}
					max={$playerStats.maxAuraShield}
					color="#a98467"
				/>
			</div>
		</div>

		<!-- Quest strip top-right -->
		{#if activeQuestCount > 0}
			<button
				class="quest-strip"
				on:click={() => {
					questDrawerOpen = !questDrawerOpen;
				}}
			>
				<img src="/game_icons/expression_confused.png" alt="quest" class="quest-strip-icon" />
				<span>{activeQuestCount} Quest{activeQuestCount > 1 ? 's' : ''}</span>
				<span class="chevron">{questDrawerOpen ? '▼' : '▲'}</span>
			</button>
		{/if}

		<!-- Floating card events (enemy, resource) — sits above map, below DPad -->
		<MobileEventCard />
		<TileMessagePanel mapMode={true} bind:hasUnread />
		<!-- Panel events (npc, location) — bottom sheet -->
		<MobileEventPanel />

		<!-- Quest drawer -->
		<div class="drawer quest-drawer" class:open={questDrawerOpen}>
			<div class="drawer-handle" on:click={() => (questDrawerOpen = false)}>
				<span>Active Quests</span><span>▼</span>
			</div>
			<div class="drawer-content"><QuestTracker /></div>
		</div>

		<!-- Message log drawer — no backdrop, stays open until manually closed -->
		<div class="drawer log-drawer" class:open={logDrawerOpen}>
			<div class="drawer-handle" on:click={() => (logDrawerOpen = false)}>
				<span>Message Log</span><span>▼</span>
			</div>
			<div class="drawer-content log-content"><MessageLog /></div>
		</div>

		<!-- Quest backdrop only (not log) -->
		{#if questDrawerOpen}
			<div
				class="drawer-backdrop"
				on:click={() => (questDrawerOpen = false)}
				role="presentation"
			></div>
		{/if}

		<!-- DPad — highest z, opacity fades when idle -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="dpad-float" class:active={dpadActive} on:pointerdown|stopPropagation={onDpadTouch}>
			<div class="dpad-grid">
				<button class="dp-btn up" on:click={() => handleMove(0, -1)}>▲</button>
				<button class="dp-btn left" on:click={() => handleMove(-1, 0)}>◀</button>
				<button class="dp-btn right" on:click={() => handleMove(1, 0)}>▶</button>
				<button class="dp-btn down" on:click={() => handleMove(0, 1)}>▼</button>
			</div>
		</div>

		<!-- Log FAB bottom-left -->
		<button
			class="log-fab"
			on:click={() => {
				logDrawerOpen = !logDrawerOpen;
				questDrawerOpen = false;
				hasUnread = false;
			}}
			title="Messages"
		>
			<img src="/game_icons/message.png" alt="Log" />
			{#if hasUnread}
				<span class="fab-dot"></span>
			{/if}
		</button>
	</div>

	<!-- ============================================================
	     BOTTOM NAV — always visible
	     ============================================================ -->
	<nav class="bottom-nav">
		<button
			class="nav-btn"
			class:active={activeTab === 'map'}
			on:click={() => navigate('/map', 'map')}
			><img src="/game_icons/map.png" alt="Map" /><span>Map</span></button
		>
		<button
			class="nav-btn"
			class:active={activeTab === 'inventory'}
			on:click={() => navigate('/inventory', 'inventory')}
			><img src="/game_icons/inventory.png" alt="Inventory" /><span>Bag</span></button
		>
		<button
			class="nav-btn"
			class:active={activeTab === 'journal'}
			on:click={() => navigate('/journal', 'journal')}
			><img src="/game_icons/journal.png" alt="Journal" /><span>Journal</span></button
		>
		<button
			class="nav-btn"
			class:active={activeTab === 'shop'}
			on:click={() => navigate('/shop', 'shop')}
			><img src="/game_icons/shop.png" alt="Shop" /><span>Shop</span></button
		>
		<button
			class="nav-btn"
			class:active={activeTab === 'settings'}
			on:click={() => navigate('/settings', 'settings')}
			><img src="/game_icons/settings.png" alt="Settings" /><span>Menu</span></button
		>
	</nav>
</div>

<style>
	.mobile-root {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background-color: #111;
		overflow: hidden;
	}

	.map-area {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #aaa;
		font-family: monospace;
	}

	/* HP strip */
	.hp-strip {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 20;
		padding: 6px 10px;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.65), transparent);
		pointer-events: none;
	}
	.hp-bars {
		display: flex;
		flex-direction: column;
		gap: 3px;
		max-width: 160px;
	}

	/* Quest strip */
	.quest-strip {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 21;
		display: flex;
		align-items: center;
		gap: 6px;
		background-color: rgba(0, 0, 0, 0.65);
		color: #facc15;
		border: none;
		padding: 5px 10px;
		font-family: var(--font-family-pixel);
		font-size: 0.65rem;
		cursor: pointer;
		border-bottom-left-radius: 8px;
	}
	.quest-strip-icon {
		width: 14px;
		height: 14px;
	}
	.chevron {
		font-size: 0.6rem;
		color: #aaa;
	}

	/* ---- DPad ---- */
	.dpad-float {
		position: absolute;
		bottom: 6rem;
		right: 1rem;
		z-index: 100; /* king of the stack */
		opacity: 0.2;
		filter: saturate(0) blur(5px) brightness(0.7);
		transition: all 0.4s ease;
	}

	.dpad-float.active {
		opacity: 1;
		filter: none;
	}

	.dpad-grid {
		display: grid;
		grid-template-columns: repeat(3, 52px);
		grid-template-rows: repeat(3, 52px);
		gap: 5px;
	}

	.dp-btn {
		background-color: var(--surface-1);
		border: 3px solid var(--color-secondary);
		color: white;
		font-size: 1.4rem;
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		-webkit-tap-highlight-color: transparent;
		border-radius: 6px;
		text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
		box-shadow:
			inset 0 30px 30px -15px rgba(255, 255, 255, 0.1),
			inset 0 0 0 1px rgba(255, 255, 255, 0.3),
			0 3px 0 var(--surface-2),
			0 3px 2px rgba(0, 0, 0, 0.2),
			0 5px 10px rgba(0, 0, 0, 0.1);
		transition: 150ms all ease-in-out;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.dp-btn:active {
		transform: translateY(3px);
		box-shadow:
			inset 0 0 0 1px rgba(255, 255, 255, 0.15),
			inset 0 1px 20px rgba(0, 0, 0, 0.1),
			0 0 0 var(--surface-2);
	}

	/* Your diagonal layout, preserved exactly */
	.dp-btn.up {
		grid-area: 1 / 3 / 2 / 4;
	}
	.dp-btn.left {
		grid-area: 2 / 2 / 3 / 3;
	}
	.dp-btn.right {
		grid-area: 2 / 3 / 3 / 4;
	}
	.dp-btn.down {
		grid-area: 3 / 3 / 4 / 4;
	}

	/* Kill MapHUD's own DPad */

	/* Strip DialogueBox of its own positioning since we're containing it */
	.dialogue-wrapper :global(.dialogue-box) {
		position: static !important;
		border-radius: 8px;
	}

	.map-area :global(.bottom-right) {
		display: none;
	}

	/* Log FAB */
	.log-fab {
		position: relative; /* ensure dot positions relative to fab */
	}
	.fab-dot {
		position: absolute;
		top: 2px;
		right: 2px;
		width: 8px;
		height: 8px;
		background: #e63946;
		border-radius: 50%;
		border: 1.5px solid #111;
		pointer-events: none;
	}
	.log-fab img {
		width: 32px;
		height: 32px;
	}

	/* Drawers */
	.drawer {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 50;
		background-color: var(--surface-3, #1a1a1a);
		border-top: 2px solid #444;
		transform: translateY(100%);
		transition: transform 0.25s ease;
		border-radius: 16px 16px 0 0;
		display: flex;
		flex-direction: column;
		max-height: 55%;
	}
	.drawer.open {
		transform: translateY(0);
	}

	.drawer-handle {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 16px;
		border-bottom: 1px solid #333;
		font-family: var(--font-family-pixel);
		font-size: 0.75rem;
		color: #aaa;
		cursor: pointer;
		flex-shrink: 0;
	}
	.drawer-content {
		flex: 1;
		overflow-y: auto;
		min-height: 0;
	}
	.log-content {
		display: flex;
		flex-direction: column;
	}

	.drawer-backdrop {
		position: absolute;
		inset: 0;
		z-index: 49;
		background: transparent;
	}

	.quest-drawer {
		max-height: 45%;
	}
	.log-drawer {
		max-height: 60%;
		/* Log sits below DPad z-index but DPad still usable above it */
		z-index: 45;
	}

	/* Bottom nav */
	.bottom-nav {
		flex-shrink: 0;
		display: flex;
		height: 58px;
		background-color: var(--color-secondary, #2d2d2d);
		border-top: 3px solid rgba(0, 0, 0, 0.4);
		box-shadow: 0 -4px 0 rgba(0, 0, 0, 0.3) inset;
	}
	.nav-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		background: none;
		border: none;
		cursor: pointer;
		color: #888;
		font-family: var(--font-family-pixel);
		font-size: 0.55rem;
		transition: color 0.15s;
		-webkit-tap-highlight-color: transparent;
		padding: 4px 0;
	}
	.nav-btn img {
		width: 22px;
		height: 22px;
		opacity: 0.6;
		transition: opacity 0.15s;
	}
	.nav-btn.active {
		color: #fff;
	}
	.nav-btn.active img {
		opacity: 1;
	}
	.nav-btn:active {
		background-color: rgba(255, 255, 255, 0.05);
	}
</style>
