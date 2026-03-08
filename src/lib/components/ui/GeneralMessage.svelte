<script lang="ts">
	/**
	 * GeneralMessage.svelte — repurposed as the Nudge panel
	 *
	 * Shows persistent NPC rank-up and quest-ready nudges from nudgeStore.
	 * Stays visible until the player dismisses. Multiple nudges stack and
	 * are navigable with ‹ › arrows.
	 *
	 * USAGE: drop once in your root layout (_layout.svelte or MobileLayout).
	 * No props needed.
	 *
	 * The old generalMessageStore behaviour (auto-show on addMessage) is
	 * intentionally removed — that job now belongs to TileMessagePanel.
	 * If you still need generalMessageStore elsewhere, keep it as a separate
	 * store; this component no longer reads it.
	 */

	import { nudgeStore, type Nudge } from '$lib/stores/nudgeStore';
	import { goto } from '$app/navigation';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let nudges: Nudge[] = [];
	let currentIndex = 0;

	nudgeStore.subscribe(ns => {
		nudges = ns;
		// If the current index is now out of bounds, clamp it
		if (currentIndex >= nudges.length) currentIndex = Math.max(0, nudges.length - 1);
	});

	$: current  = nudges[currentIndex] ?? null;
	$: hasMany  = nudges.length > 1;
	$: isFirst  = currentIndex === 0;
	$: isLast   = currentIndex === nudges.length - 1;

	function prev() { if (!isFirst) currentIndex -= 1; }
	function next() { if (!isLast)  currentIndex += 1; }

	function dismiss() {
		if (!current) return;
		nudgeStore.dismiss(current.id);
		// currentIndex clamped reactively above
	}

	function act() {
		if (!current) return;
		if (current.type === 'npc_rank_ready') {
			nudgeStore.dismissNpc(current.npcId);
			goto(`/journal/character/${current.npcId}`);
		} else if (current.type === 'quest_ready') {
			nudgeStore.dismissQuest(current.questId);
			goto(`/journal`);
		}
	}

	function getIcon(nudge: Nudge): string {
		if (nudge.type === 'npc_rank_ready') return '/game_icons/heart_rank.png';
		if (nudge.type === 'quest_ready')    return '/game_icons/expression_confused.png';
		return '/game_icons/message.png';
	}

	function getLabel(nudge: Nudge): string {
		if (nudge.type === 'npc_rank_ready') return 'BOND DEEPENED';
		if (nudge.type === 'quest_ready')    return 'QUEST READY';
		return 'NOTICE';
	}

	function getBody(nudge: Nudge): string {
		if (nudge.type === 'npc_rank_ready')
			return `${nudge.npcName} is ready for a deeper connection.`;
		if (nudge.type === 'quest_ready') {
			const who = nudge.npcName ? ` — speak to ${nudge.npcName}` : '';
			return `"${nudge.questTitle}" is ready to turn in${who}.`;
		}
		return '';
	}

	function getAction(nudge: Nudge): string {
		if (nudge.type === 'npc_rank_ready') return 'Visit';
		if (nudge.type === 'quest_ready')    return 'Journal';
		return 'Go';
	}
</script>

{#if current}
	<div
		class="nudge-panel"
		in:fly={{ y: -12, duration: 220, easing: cubicOut }}
		out:fade={{ duration: 120 }}
	>
		<!-- Icon + label -->
		<div class="nudge-left">
			<img src={getIcon(current)} alt="" class="nudge-icon" />
		</div>

		<div class="nudge-body">
			<span class="nudge-label">{getLabel(current)}</span>
			<span class="nudge-text">{getBody(current)}</span>
		</div>

		<div class="nudge-actions">
			<!-- Multi-nudge navigation -->
			{#if hasMany}
				<div class="nudge-nav">
					<button class="nav-btn" class:dim={isFirst}  on:click={prev}>‹</button>
					<span class="nudge-count">{currentIndex + 1}/{nudges.length}</span>
					<button class="nav-btn" class:dim={isLast}   on:click={next}>›</button>
				</div>
			{/if}

			<button class="act-btn"     on:click={act}>     {getAction(current)} →</button>
			<button class="dismiss-btn" on:click={dismiss}> ✕ </button>
		</div>
	</div>
{/if}

<style>
	.nudge-panel {
		position: fixed;
		top: 0.6rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 200;

		display: flex;
		align-items: center;
		gap: 0.6rem;

		width: min(420px, 92vw);
		padding: 0.55rem 0.7rem;

		background: color-mix(in srgb, var(--surface-2, #1e1e1e) 97%, transparent);
		border: 1.5px solid rgba(255, 255, 255, 0.12);
		border-top: 2px solid var(--color-primary, #8b7355);
		border-radius: 0 0 12px 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.05);
	}

	.nudge-left {
		flex-shrink: 0;
	}

	.nudge-icon {
		width: 22px;
		height: 22px;
		image-rendering: pixelated;
		opacity: 0.9;
	}

	.nudge-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.nudge-label {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.46rem;
		letter-spacing: 0.14em;
		color: var(--color-primary, #8b7355);
		opacity: 0.9;
	}

	.nudge-text {
		font-family: var(--font-family-main, monospace);
		font-size: 0.74rem;
		color: #ddd;
		line-height: 1.4;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.nudge-actions {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		flex-shrink: 0;
	}

	.nudge-nav {
		display: flex;
		align-items: center;
		gap: 1px;
	}

	.nudge-count {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.45rem;
		color: #555;
		padding: 0 2px;
	}

	.nav-btn {
		background: none;
		border: none;
		color: #666;
		font-size: 1rem;
		line-height: 1;
		cursor: pointer;
		padding: 0 2px;
		transition: color 0.15s;
	}
	.nav-btn:hover { color: #bbb; }
	.nav-btn.dim    { color: #333; pointer-events: none; }

	.act-btn {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.5rem;
		letter-spacing: 0.08em;
		background: rgba(255,255,255,0.07);
		border: 1px solid rgba(255,255,255,0.12);
		color: #ccc;
		border-radius: 4px;
		padding: 3px 7px;
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.15s, color 0.15s;
	}
	.act-btn:hover {
		background: rgba(255,255,255,0.13);
		color: white;
	}

	.dismiss-btn {
		background: none;
		border: none;
		color: #444;
		font-size: 0.65rem;
		cursor: pointer;
		padding: 2px 3px;
		line-height: 1;
		transition: color 0.15s;
	}
	.dismiss-btn:hover { color: #888; }
</style>