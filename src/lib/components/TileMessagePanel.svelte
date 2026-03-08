<script lang="ts">
	/**
	 * TileMessagePanel.svelte
	 *
	 * Per-tile message paginator. Drop into any page.
	 *
	 * SETUP:
	 *   1. Drop <TileMessagePanel bind:hasUnread /> into MobileLayout (map-mode)
	 *      or any other page (non-map-mode).
	 *   2. Use {hasUnread} to show a red dot on your log-fab button.
	 *   3. Call messageStore.newSession() inside game.movePlayer() to reset
	 *      the tile group when the player steps to a new tile.
	 *
	 * BEHAVIOUR:
	 *   - Opens automatically when new messages arrive.
	 *   - Shows newest message first. Right arrow + badge = more unread.
	 *   - Left arrow = go back to older messages in this tile's session.
	 *   - Auto-hides after 8s of inactivity (map-mode only).
	 *   - Clears & closes when a new session starts (player moved tile).
	 *   - Closes on manual dismiss (✕).
	 */

	import { messageStore, type Message } from '$lib/stores/messageStore';
	import { onDestroy } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	// ── Props ─────────────────────────────────────────────────────────────────
	/** Bind this to toggle the unread dot on the log FAB */
	export let hasUnread = false;
	/**
	 * mapMode = true  → position: absolute inside .map-area
	 * mapMode = false → position: fixed above bottom-nav (other pages)
	 */
	export let mapMode = true;

	// ── Internal state ────────────────────────────────────────────────────────
	let sessionMessages: Message[] = [];
	let currentIndex = 0;
	let isOpen = false;
	let watchedSessionId = -1;
	let inactivityTimer: ReturnType<typeof setTimeout>;

	// Cap how many pages the panel tracks per tile — keeps the dot strip small
	// and bounds the session array. Oldest messages beyond this are still in
	// the full MessageLog history; they're just not shown in the mini panel.
	const MAX_PAGES = 2;

	// ── Store subscription ────────────────────────────────────────────────────
	const unsubscribe = messageStore.subscribe(($store) => {
		const sid = $store.currentSessionId;

		// Session changed → player moved to a new tile — reset silently
		if (watchedSessionId !== -1 && sid !== watchedSessionId) {
			isOpen = false;
			sessionMessages = [];
			currentIndex = 0;
			clearTimeout(inactivityTimer);
		}
		watchedSessionId = sid;

		// Only scan the tail of the message list — session messages are always
		// at the end, so we don't need to walk the whole 100-item array.
		const all = $store.messages;
		const tail: Message[] = [];
		for (let i = all.length - 1; i >= 0 && tail.length < MAX_PAGES; i--) {
			if (all[i].sessionId === sid) tail.unshift(all[i]);
			else if (tail.length > 0) break; // session messages are contiguous
		}

		// Early exit — nothing new
		if (tail.length === sessionMessages.length) return;

		sessionMessages = tail;
		currentIndex = tail.length - 1; // show newest
		isOpen = true;
		hasUnread = true;
		resetInactivity();
	});

	// ── Pagination ────────────────────────────────────────────────────────────
	function goLeft() {
		if (currentIndex > 0) { currentIndex -= 1; resetInactivity(); }
	}

	function goRight() {
		if (currentIndex < sessionMessages.length - 1) { currentIndex += 1; resetInactivity(); }
		if (currentIndex === sessionMessages.length - 1) hasUnread = false;
	}

	function dismiss() {
		isOpen = false;
		hasUnread = false;
		clearTimeout(inactivityTimer);
	}

	function resetInactivity() {
		clearTimeout(inactivityTimer);
		if (mapMode) inactivityTimer = setTimeout(() => { isOpen = false; }, 8000);
	}

	// ── Derived ───────────────────────────────────────────────────────────────
	$: current     = sessionMessages[currentIndex];
	$: totalPages  = sessionMessages.length;
	$: isNewest    = currentIndex === totalPages - 1;
	$: isOldest    = currentIndex === 0;
	$: unreadAhead = totalPages - 1 - currentIndex;
	// Stable fixed-length array for the dot strip — Svelte never diffs a
	// growing list, just toggles .active on the same MAX_PAGES nodes.
	$: dotIndices  = Array.from({ length: Math.min(totalPages, MAX_PAGES) }, (_, i) => i);

	function getColor(types: string[]): string {
		if (types.includes('Help'))   return '#90a955';
		if (types.includes('Combat')) return '#ff928b';
		if (types.includes('NPC'))    return '#48cae4';
		if (types.includes('World'))  return '#f4a261';
		if (types.includes('Player')) return '#e0aaff';
		if (types.includes('System')) return '#a2d2ff';
		return '#f5ebe0';
	}

	function getTypeLabel(types: string[]): string {
		if (types.includes('Combat')) return 'COMBAT';
		if (types.includes('NPC'))    return 'NPC';
		if (types.includes('World'))  return 'WORLD';
		if (types.includes('Player')) return 'PLAYER';
		if (types.includes('Help'))   return 'HINT';
		if (types.includes('System')) return 'SYSTEM';
		return 'EVENT';
	}

	onDestroy(() => { unsubscribe(); clearTimeout(inactivityTimer); });
</script>

{#if isOpen && current}
	<div
		class="tile-panel"
		class:map-mode={mapMode}
		in:fly={{ y: 16, duration: 180, easing: cubicOut }}
		out:fade={{ duration: 100 }}
	>
		<!-- Header -->
		<div class="panel-header">
			<span class="type-label" style="color: {getColor(current.types)}">
				{getTypeLabel(current.types)}
			</span>

			{#if totalPages > 1}
				<span class="page-dots">
					{#each dotIndices as i (i)}
						<span class="dot" class:active={i === currentIndex}></span>
					{/each}
				</span>
			{/if}

			<button class="dismiss-btn" on:click={dismiss} aria-label="Dismiss">✕</button>
		</div>

		<!-- Body -->
		<div class="panel-body">
			<button class="nav-btn" class:invisible={isOldest} on:click={goLeft} aria-label="Older">‹</button>

			<div class="msg-text" style="color: {getColor(current.types)}">
				{current.text}
				{#if current.item}
					<span class="item-chip">
						{#if current.item.thumbnailImage}<img src={current.item.thumbnailImage} alt="" class="item-thumb" />{/if}
						{current.item.name}
					</span>
				{/if}
				{#if current.explorationRequirements?.length}
					<div class="explo-row">
						{#each current.explorationRequirements as req}
							<span class="explo-chip">{req.name} {req.level}</span>
						{/each}
					</div>
				{/if}
			</div>

			<button class="nav-btn nav-right" class:invisible={isNewest} on:click={goRight} aria-label="Newer">
				{#if unreadAhead > 0}<span class="unread-badge">{unreadAhead}</span>{/if}
				›
			</button>
		</div>
	</div>
{/if}

<style>
	.tile-panel {
		position: absolute;
		left: 0.6rem; right: 0.6rem;
		bottom: 3.6rem;
		z-index: 36;
		background: color-mix(in srgb, var(--surface-2, #1c1c1c) 96%, transparent);
		border: 1.5px solid rgba(255,255,255,0.09);
		border-bottom-color: rgba(0,0,0,0.4);
		border-radius: 10px;
		box-shadow: 0 6px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05);
		overflow: hidden;
		pointer-events: all;
	}
	.tile-panel:not(.map-mode) {
		position: fixed;
		bottom: 4.2rem;
		left: 0.75rem; right: 0.75rem;
		max-width: 520px;
		margin: 0 auto;
	}
	.panel-header {
		display: flex; align-items: center; gap: 0.4rem;
		padding: 0.28rem 0.55rem;
		background: rgba(0,0,0,0.25);
		border-bottom: 1px solid rgba(255,255,255,0.04);
	}
	.type-label {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.48rem; letter-spacing: 0.14em; opacity: 0.9; flex-shrink: 0;
	}
	.page-dots { display: flex; align-items: center; gap: 3px; margin-left: auto; margin-right: 4px; }
	.dot { width: 4px; height: 4px; border-radius: 50%; background: #444; transition: background 0.15s; }
	.dot.active { background: var(--color-primary, #8b7355); }
	.dismiss-btn {
		background: none; border: none; color: #444; font-size: 0.68rem;
		cursor: pointer; padding: 0 1px; line-height: 1; transition: color 0.15s; flex-shrink: 0;
	}
	.dismiss-btn:hover { color: #888; }
	.panel-body {
		display: flex; align-items: center; gap: 0.15rem;
		padding: 0.42rem 0.3rem; min-height: 2.6rem;
	}
	.nav-btn {
		background: none; border: none; color: #555; font-size: 1.4rem; line-height: 1;
		cursor: pointer; padding: 0 0.2rem; flex-shrink: 0; transition: color 0.15s;
		position: relative; -webkit-tap-highlight-color: transparent; user-select: none;
		min-width: 1.6rem; text-align: center;
	}
	.nav-btn:hover { color: #bbb; }
	.nav-btn:active { color: #fff; }
	.nav-btn.invisible { visibility: hidden; pointer-events: none; }
	.unread-badge {
		position: absolute; top: -5px; right: -1px;
		background: #e63946; color: white;
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.42rem; border-radius: 999px;
		padding: 1px 3px; line-height: 1.5; min-width: 12px;
		text-align: center; pointer-events: none;
	}
	.msg-text {
		flex: 1; font-family: var(--font-family-main, monospace);
		font-size: 0.76rem; line-height: 1.5; white-space: pre-line;
		min-width: 0; word-break: break-word;
	}
	.item-chip {
		display: inline-flex; align-items: center; gap: 3px; margin-left: 5px;
		background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
		border-radius: 4px; padding: 1px 5px; font-size: 0.68rem; vertical-align: middle;
	}
	.item-thumb { width: 12px; height: 12px; object-fit: contain; }
	.explo-row { display: flex; gap: 3px; margin-top: 3px; flex-wrap: wrap; }
	.explo-chip {
		font-family: var(--font-family-pixel, monospace); font-size: 0.48rem;
		background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
		border-radius: 3px; padding: 1px 4px; color: #999;
	}
</style>