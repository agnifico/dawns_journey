<script lang="ts">
	import { goto } from '$app/navigation';
	import { eventScreen, clearEvent, showMessageBox } from '$lib/stores/uiStore';
	import { currentMapData } from '$lib/stores/mapStore';
	import { playerStore, playerStats } from '$lib/stores/playerStore';
	import { questStore } from '$lib/stores/questStore';
	import { questTrackerState, toggleQuestTracker, toggleSummarised } from '$lib/stores/uiStore';

	import MapDisplay from '$lib/components/MapDisplay.svelte';
	import MapHUD from '$lib/components/ui/MapHUD.svelte';
	import EventScreen from '$lib/components/EventScreen.svelte';
	import ChoiceMenu from '$lib/components/ui/ChoiceMenu.svelte';
	import MessageLog from '$lib/components/MessageLog.svelte';
	import StatBar from '$lib/components/ui/StatBar.svelte';
	import QuestTracker from '$lib/components/ui/QuestTracker.svelte';
	import { game } from '$lib/game/game';

	function handleMove(dx: number, dy: number) {
		game.movePlayer(dx, dy);
	}

	// Whether the event panel is active
	$: isEventActive = $eventScreen.type !== 'none';

	// Whether choice menu should show
	$: showChoiceMenu =
		$eventScreen.type === 'npc' ||
		($eventScreen.type === 'location_event' && $eventScreen.data?.actions) ||
		$eventScreen.type === 'resource' ||
		($eventScreen.type === 'enemy' && $eventScreen.data?.isLegendary);

	// Pull-up drawer states
	let questDrawerOpen = false;
	let logDrawerOpen = false;

	// Active bottom nav tab
	type Tab = 'map' | 'inventory' | 'journal' | 'shop' | 'settings';
	let activeTab: Tab = 'map';

	function navigate(path: string, tab: Tab) {
		activeTab = tab;
		goto(path);
	}

	// Count active quests for badge
	$: activeQuestCount = Object.values($questStore.quests).filter(
		(q) => q.state === 'ACTIVE' || q.state === 'REPORT_PENDING'
	).length;

	// New messages badge — count unread (we'll just show if any messages exist)
	// Close drawers when event opens
	$: if (isEventActive) {
		questDrawerOpen = false;
		logDrawerOpen = false;
	}
</script>

<div class="mobile-root">
	<!-- ============================================================
	     EXPLORATION MODE (default)
	     ============================================================ -->
	{#if !isEventActive}
		<!-- Full-screen map -->
		<div class="map-area">
			{#if $currentMapData && $playerStore.position}
				<MapHUD />
				<MapDisplay mapData={$currentMapData} player={$playerStore} />
			{:else}
				<div class="loading">Loading map...</div>
			{/if}

			<!-- HP bar strip across top of map -->
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

			<!-- Quest strip at top (tap to expand) -->
			{#if activeQuestCount > 0}
				<button
					class="quest-strip"
					on:click={() => {
						questDrawerOpen = !questDrawerOpen;
						logDrawerOpen = false;
					}}
				>
					<img src="/game_icons/expression_confused.png" alt="quest" class="quest-strip-icon" />
					<span>{activeQuestCount} Active Quest{activeQuestCount > 1 ? 's' : ''}</span>
					<span class="chevron">{questDrawerOpen ? '▼' : '▲'}</span>
				</button>
			{/if}
		</div>

		<!-- Quest Drawer (slides up from bottom of map area) -->
		<div class="drawer quest-drawer" class:open={questDrawerOpen}>
			<div class="drawer-handle" on:click={() => (questDrawerOpen = false)}>
				<span>Active Quests</span>
				<span>▼</span>
			</div>
			<div class="drawer-content">
				<QuestTracker />
			</div>
		</div>

		<!-- Message log drawer (slides up) -->
		<div class="drawer log-drawer" class:open={logDrawerOpen}>
			<div class="drawer-handle" on:click={() => (logDrawerOpen = false)}>
				<span>Message Log</span>
				<span>▼</span>
			</div>
			<div class="drawer-content log-content">
				<MessageLog />
			</div>
		</div>

		<!-- Backdrop for drawers -->
		{#if questDrawerOpen || logDrawerOpen}
			<div
				class="drawer-backdrop"
				on:click={() => {
					questDrawerOpen = false;
					logDrawerOpen = false;
				}}
				role="presentation"
			></div>
		{/if}

		<!-- Floating DPad (bottom right) — desktop style buttons -->
		<div class="dpad-float">
			<div class="dpad-grid">
				<button class="dp-btn up" on:click={() => handleMove(0, -1)}>▲</button>
				<button class="dp-btn left" on:click={() => handleMove(-1, 0)}>◀</button>
				<div class="dp-center"></div>
				<button class="dp-btn right" on:click={() => handleMove(1, 0)}>▶</button>
				<button class="dp-btn down" on:click={() => handleMove(0, 1)}>▼</button>
			</div>
		</div>

		<!-- Log button (bottom left floating) -->
		<button
			class="log-fab"
			on:click={() => {
				logDrawerOpen = !logDrawerOpen;
				questDrawerOpen = false;
			}}
			title="Messages"
		>
			<img src="/game_icons/message.png" alt="Log" />
		</button>

	<!-- ============================================================
	     EVENT MODE (when an event is active)
	     ============================================================ -->
	{:else}
		<div class="event-area">
			<!-- Event screen fills the top portion -->
			<div class="event-screen-wrapper">
				<EventScreen />
			</div>

			<!-- Choice menu fills bottom -->
			{#if showChoiceMenu}
				<div class="choice-menu-wrapper">
					<ChoiceMenu />
				</div>
			{/if}

			<!-- Floating back button — bottom left, thumb-reachable -->
			<button class="back-fab" on:click={clearEvent} title="Back to map">
				◀
			</button>
		</div>
	{/if}

	<!-- ============================================================
	     BOTTOM NAV BAR (always visible)
	     ============================================================ -->
	<nav class="bottom-nav">
		<button
			class="nav-btn"
			class:active={activeTab === 'map'}
			on:click={() => navigate('/map', 'map')}
			title="Map"
		>
			<img src="/game_icons/map.png" alt="Map" />
			<span>Map</span>
		</button>
		<button
			class="nav-btn"
			class:active={activeTab === 'inventory'}
			on:click={() => navigate('/inventory', 'inventory')}
			title="Inventory"
		>
			<img src="/game_icons/inventory.png" alt="Inventory" />
			<span>Bag</span>
		</button>
		<button
			class="nav-btn"
			class:active={activeTab === 'journal'}
			on:click={() => navigate('/journal', 'journal')}
			title="Journal"
		>
			<img src="/game_icons/journal.png" alt="Journal" />
			<span>Journal</span>
		</button>
		<button
			class="nav-btn"
			class:active={activeTab === 'shop'}
			on:click={() => navigate('/shop', 'shop')}
			title="Shop"
		>
			<img src="/game_icons/shop.png" alt="Shop" />
			<span>Shop</span>
		</button>
		<button
			class="nav-btn"
			class:active={activeTab === 'settings'}
			on:click={() => navigate('/settings', 'settings')}
			title="Settings"
		>
			<img src="/game_icons/settings.png" alt="Settings" />
			<span>Menu</span>
		</button>
	</nav>
</div>

<style>
	/* ---------------------------------------------------------------
	   ROOT
	--------------------------------------------------------------- */
	.mobile-root {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background-color: #111;
		overflow: hidden;
	}

	/* ---------------------------------------------------------------
	   MAP AREA
	--------------------------------------------------------------- */
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

	/* HP strip — sits at very top of map, semi-transparent */
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

	/* Quest strip — small tap-target at the top of map */
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

	/* ---------------------------------------------------------------
	   FLOATING DPad — desktop button style, scaled up for touch
	--------------------------------------------------------------- */
	.dpad-float {
		position: absolute;
		bottom: 6rem;
		right: 1rem;
		z-index: 40;
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

	.dp-btn.up    { grid-area: 1 / 3 / 2 / 4; }
	.dp-btn.left  { grid-area: 2 / 2 / 3 / 3; }
	/* .dp-center    { grid-area: 2 / 2 / 3 / 3; } */
	.dp-btn.right { grid-area: 2 / 3 / 3 / 4; }
	.dp-btn.down  { grid-area: 3 / 3 / 4 / 4;}

	/* Hide the DPad that's already inside MapHUD so it doesn't double up */
	.map-area :global(.bottom-right) {
		display: none;
	}

	/* ---------------------------------------------------------------
	   LOG FAB (floating action button, bottom left)
	--------------------------------------------------------------- */
	.log-fab {
		position: absolute;
		bottom: 4rem;
		left: 12px;
		z-index: 30;
		width: 40px;
		height: 40px;
		/* border-radius: 50%; */
		background-color: rgba(0, 0, 0, 0.7);
		border: 2px solid #444;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		padding: 4px;
	}

	.log-fab img {
		width: 32px;
		height: 32px;
	}

	/* ---------------------------------------------------------------
	   DRAWERS
	--------------------------------------------------------------- */
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

	/* quest drawer is shorter than log drawer */
	.quest-drawer {
		max-height: 45%;
	}

	.log-drawer {
		max-height: 60%;
	}

	/* ---------------------------------------------------------------
	   EVENT MODE
	--------------------------------------------------------------- */
	.event-area {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
	}

	/* Floating back button — bottom left, same style as DPad buttons */
	.back-fab {
		position: absolute;
		bottom: 2rem;
		right: 2rem;
		z-index: 40;
		width: 52px;
		height: 52px;
		background-color: var(--surface-1);
		border: 3px solid var(--color-secondary);
		color: white;
		font-size: 1.4rem;
		border-radius: 6px;
		cursor: pointer;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.2);
		box-shadow:
			inset 0 30px 30px -15px rgba(255, 255, 255, 0.1),
			inset 0 0 0 1px rgba(255, 255, 255, 0.3),
			0 3px 0 var(--surface-2),
			0 3px 2px rgba(0, 0, 0, 0.2),
			0 5px 10px rgba(0, 0, 0, 0.1);
		transition: 150ms all ease-in-out;
	}

	.back-fab:active {
		transform: translateY(3px);
		box-shadow:
			inset 0 0 0 1px rgba(255, 255, 255, 0.15),
			inset 0 1px 20px rgba(0, 0, 0, 0.1),
			0 0 0 var(--surface-2);
	}

	.event-screen-wrapper {
		flex: 1;
		min-height: 0;
		overflow: hidden;
		/* Override EventScreen's fixed height */
		display: flex;
		flex-direction: column;
	}

	/* Force EventScreen to fill available space */
	.event-screen-wrapper :global(.event-screen) {
		height: 100% !important;
		border-radius: 0 !important;
		border-left: none !important;
		border-right: none !important;
		border-top: none !important;
	}

	.choice-menu-wrapper {
		flex-shrink: 0;
	}

	/* Make ChoiceMenu buttons bigger for touch */
	.choice-menu-wrapper :global(button) {
		padding: 0.75rem 1rem !important;
		font-size: 1rem !important;
		min-height: 48px;
	}

	/* ---------------------------------------------------------------
	   BOTTOM NAV
	--------------------------------------------------------------- */
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