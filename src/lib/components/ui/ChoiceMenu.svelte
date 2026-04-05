<script lang="ts">
	import { eventScreen, clearEvent, openGiftModal } from '$lib/stores/uiStore';
	import { npcStore } from '$lib/stores/npcStore';
	import { questStore } from '$lib/stores/questStore';
	import { dialogueStore } from '$lib/stores/dialogueStore';
	import { playerStore } from '$lib/stores/playerStore';
	import * as CombatService from '$lib/services/CombatService';
	import * as LocationEventService from '$lib/services/LocationEventService';
	import { gatherResource } from '$lib/services/InteractionService';
	import { checkRequirement, resolveActiveRankData } from '$lib/services/QuestService';
	import { hasItem } from '$lib/services/InventoryService';
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import type { NPC } from '$lib/types';

	export let flex: 'row' | 'column' = 'column';

	const keymap = ['z', 'x', 'c', 'v', 'b'];

	type SingleAction = {
		id: string;
		label: string;
		hotkey: string | null;
		icon?: string | null;
		action: () => void;
		variant?: 'default' | 'accent' | 'warning';
	};

	type PairedAction = {
		id: string;
		type: 'pair';
		primary: SingleAction;
		secondary: SingleAction;
	};

	type ActionItem = SingleAction | PairedAction;

	let actions: ActionItem[] = [];
	let npc: NPC | null = null;

	// ── Helpers ──────────────────────────────────────────────────────────────────

	function isActionAvailable(action: any): boolean {
		if (!action.requirement) return true;
		const player = get(playerStore);
		const globalNpcs = get(npcStore).globalNpcs;
		const { met } = checkRequirement(action.requirement, player, null, globalNpcs, true);
		return met;
	}

	function resolveContextAction(npc: NPC): SingleAction | null {
		const player = get(playerStore);
		const globalNpcs = get(npcStore).globalNpcs;
		const rankData = resolveActiveRankData(npc, player, globalNpcs);
		if (!rankData) return null;

		const quest = get(questStore).quests[rankData.questId];
		if (!quest || quest.state !== 'ACTIVE') return null;

		const stage = rankData.stages[quest.currentStage];
		if (!stage) return null;

		const req = stage.requirement;

		// Deliver Item — appears when stage needs give_item and player has it
		if (req?.type === 'give_item') {
			const hasIt = hasItem(player.inventory, req.itemId, req.quantity ?? 1);
			if (hasIt) {
				const item = player.inventory.find(i => i.id === req.itemId);
				const label = item?.name ? `DELIVER ${item.name.toUpperCase()}` : 'DELIVER ITEM';
				return {
					id: 'deliver', label, hotkey: 'x', variant: 'accent',
					action: () => npcStore.interactTalk(npc.id)
				};
			}
		}

		// Not Now — appears when stage is refusable
		if (stage.refusable) {
			return {
				id: 'refuse', label: 'NOT NOW', hotkey: 'x', variant: 'default',
				action: () => dialogueStore.startDialogue(
					stage.refuse_dialogue ?? [`${npc.name} watches you go.`],
					npc.name
				)
			};
		}

		return null;
	}

	// ── Reactive action builder ───────────────────────────────────────────────────
	// NOTE: disabled state is intentionally NOT stored on action objects.
	// It is computed at render time directly from $dialogueStore so buttons
	// re-enable the instant dialogue closes — no stale state.

	$: {
		npc = null;
		if ($eventScreen.type === 'npc' && $eventScreen.data?.npcId) {
			npc = $npcStore.globalNpcs[$eventScreen.data.npcId];
			if (npc) {
				const canChallenge = npc.isCombatant;
				const canGift = npc.heartRanks[npc.heartRank]?.giftingOptions?.length > 0;
				const heartRankReady = npc.heartState === 'READY_FOR_RANK_UP';

				const activeRankData = resolveActiveRankData(npc, $playerStore, $npcStore.globalNpcs);
				const quest = activeRankData ? $questStore.quests[activeRankData.questId] : null;
				const showQuestIndicator = heartRankReady || (quest && quest.state === 'AVAILABLE');

				const contextAction = resolveContextAction(npc);
				const newActions: ActionItem[] = [];

				// ── Talk row ─────────────────────────────────────────────────
				const talkAction: SingleAction = {
					id: 'talk', label: 'Talk', hotkey: 'z',
					icon: showQuestIndicator ? '/game_icons/expression_alerted.png' : null,
					action: () => npcStore.interactTalk(npc.id)
				};

				if (contextAction) {
					newActions.push({ id: 'talk_row', type: 'pair', primary: talkAction, secondary: contextAction });
				} else {
					newActions.push(talkAction);
				}

				// ── Challenge row ─────────────────────────────────────────────
				if (canChallenge) {
					newActions.push({
						id: 'challenge', label: 'Challenge',
						hotkey: contextAction ? null : 'x',
						action: () => CombatService.startCombat(npc)
					});
				}

				// ── Gift / Heart rank row ─────────────────────────────────────
				if (heartRankReady && canGift) {
					newActions.push({
						id: 'gift_row', type: 'pair',
						primary: {
							id: 'gift', label: 'Gift Item', hotkey: 'c',
							action: () => openGiftModal(npc.id)
						},
						secondary: {
							id: 'heart_rank_up', label: '♡ Level Up', hotkey: 'v', variant: 'accent',
							action: () => npcStore.interactTalk(npc.id)
						}
					});
				} else if (heartRankReady) {
					newActions.push({
						id: 'heart_rank_up', label: '♡ Level Up', hotkey: 'c', variant: 'accent',
						action: () => npcStore.interactTalk(npc.id)
					});
				} else if (canGift) {
					newActions.push({
						id: 'gift', label: 'Gift Item', hotkey: 'c',
						action: () => openGiftModal(npc.id)
					});
				}

				actions = newActions;
			}
		} else if ($eventScreen.type === 'location_event' && $eventScreen.data?.actions) {
			const eventData = $eventScreen.data;
			const availableActions = eventData.actions.filter(isActionAvailable);
			actions = availableActions.map((act, index) => ({
				id: `event_action_${index}`, label: act.text, hotkey: keymap[index] || null,
				action: () => {
					const originalIndex = eventData.actions.indexOf(act);
					LocationEventService.triggerEventAction(eventData, originalIndex);
					clearEvent();
				}
			}));
		} else if ($eventScreen.type === 'resource') {
			actions = [{ id: 'gather', label: 'Gather', hotkey: 'z', action: () => gatherResource() }];
		} else if ($eventScreen.type === 'enemy' && $eventScreen.data?.isLegendary) {
			const enemy = $eventScreen.data;
			const fakeNpc: NPC = {
				id: enemy.id, name: enemy.name, image: enemy.image,
				profileImage: enemy.thumbnailImage, isCombatant: true,
				baseStats: enemy.baseStats, swordRank: 0, heartRank: 0,
				affinity: 0, swordState: 'NOT_STARTED', heartState: 'NOT_STARTED',
				swordRanks: [], heartRanks: [], statGrowth: [],
				battleAftermathsBySwordRank: [], types: enemy.types,
				requirementSnapshot: {}, swordRankMaxedDialogue: [],
				allRanksMaxedDialogue: [], galleryImages: [], faction: undefined,
				swordRankMaxedDialogueIndex: 0, allRanksMaxedDialogueIndex: 0
			};
			actions = [{ id: 'challenge', label: 'Challenge', hotkey: 'x', action: () => CombatService.startCombat(fakeNpc) }];
		} else {
			actions = [];
		}
	}

	// ── Keyboard handler ──────────────────────────────────────────────────────────
	// The top-level guard replaces per-action disabled checks entirely.
	const handleKeydown = (e: KeyboardEvent) => {
		if ($dialogueStore.isOpen || $dialogueStore.justClosed) return;
		if (!actions.length) return;

		const key = e.key.toLowerCase();
		const allActions: SingleAction[] = actions.flatMap(a =>
			'type' in a && a.type === 'pair' ? [a.primary, a.secondary] : [a as SingleAction]
		);

		const match = allActions.find(a => a.hotkey === key);
		if (match) {
			e.preventDefault();
			e.stopPropagation();
			match.action();
		} else if (key === 'escape') {
			e.preventDefault();
			e.stopPropagation();
			clearEvent();
		}
	};

	onMount(() => window.addEventListener('keydown', handleKeydown));
	onDestroy(() => window.removeEventListener('keydown', handleKeydown));
</script>

<div class="interaction-menu" style:--flex={flex}>
	<ul>
		{#each actions as action (action.id)}
			{#if 'type' in action && action.type === 'pair'}
				<li class="pair-row">
					<button
						class="pair-btn"
						class:accent={action.primary.variant === 'accent'}
						class:warning={action.primary.variant === 'warning'}
						on:click={action.primary.action}
						disabled={$dialogueStore.isOpen || $dialogueStore.justClosed}
					>
						<div class="action-label">
							{#if action.primary.icon}<img src={action.primary.icon} alt="icon" class="icon" />{/if}
							<span>{action.primary.label}</span>
						</div>
						{#if action.primary.hotkey}<span class="hotkey">[{action.primary.hotkey.toUpperCase()}]</span>{/if}
					</button>
					<button
						class="pair-btn"
						class:accent={action.secondary.variant === 'accent'}
						class:warning={action.secondary.variant === 'warning'}
						on:click={action.secondary.action}
						disabled={$dialogueStore.isOpen || $dialogueStore.justClosed}
					>
						<div class="action-label">
							{#if action.secondary.icon}<img src={action.secondary.icon} alt="icon" class="icon" />{/if}
							<span>{action.secondary.label}</span>
						</div>
						{#if action.secondary.hotkey}<span class="hotkey">[{action.secondary.hotkey.toUpperCase()}]</span>{/if}
					</button>
				</li>
			{:else}
				{@const a = action}
				<li>
					<button
						class:accent={'variant' in a && a.variant === 'accent'}
						class:warning={'variant' in a && a.variant === 'warning'}
						on:click={a.action}
						disabled={$dialogueStore.isOpen || $dialogueStore.justClosed}
					>
						<div class="action-label">
							{#if 'icon' in a && a.icon}<img src={a.icon} alt="icon" class="icon" />{/if}
							<span>{a.label}</span>
						</div>
						{#if a.hotkey}<span class="hotkey">[{a.hotkey.toUpperCase()}]</span>{/if}
					</button>
				</li>
			{/if}
		{/each}
	</ul>
</div>

<style>
	.interaction-menu {
		position: relative;
		padding: 16px 16px 22px;
		border-top: 3px solid #00000056;
		border-radius: 0 0 12px 12px;
		box-shadow: #00000056 0 -6px 0 3px inset;
		background-color: var(--surface-2);
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: var(--flex);
		gap: 0.5rem;
	}
	.pair-row {
		display: flex;
		gap: 0.5rem;
	}
	.pair-btn {
		flex: 1;
		min-width: 0;
	}
	button {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 0.25rem 0.5rem 0.5rem;
		background-color: var(--surface-3);
		color: var(--text-header);
		box-shadow: #00000056 0 -3px 0 3px inset;
		border: none;
		border-radius: 6px;
		font-family: 'Silkscreen', sans-serif;
		text-align: left;
		font-size: 0.9rem;
		cursor: pointer;
	}
	button:hover,
	button:focus {
		background-color: #51bfc1;
		border-color: #09625b;
		color: #343a40;
		.hotkey { color: #343a40; }
		.action-label { color: #343a40; }
	}
	button:disabled {
		color: #666;
		background-color: #1a1a1a;
		cursor: not-allowed;
	}
	button.accent {
		background-color: color-mix(in srgb, var(--color-primary) 30%, var(--surface-3));
		color: var(--color-primary);
		box-shadow: color-mix(in srgb, var(--color-primary) 40%, #000) 0 -3px 0 3px inset;
	}
	button.accent:hover,
	button.accent:focus {
		background-color: var(--color-primary);
		color: #111;
		.hotkey { color: #111; }
		.action-label { color: #111; }
	}
	button.warning {
		background-color: color-mix(in srgb, #e07a5f 25%, var(--surface-3));
		color: #e07a5f;
		box-shadow: color-mix(in srgb, #e07a5f 40%, #000) 0 -3px 0 3px inset;
	}
	button.warning:hover,
	button.warning:focus {
		background-color: #e07a5f;
		color: #111;
		.hotkey { color: #111; }
		.action-label { color: #111; }
	}
	.action-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-muted);
	}
	.icon {
		width: 16px;
		height: 16px;
		image-rendering: pixelated;
		background-color: transparent;
	}
	.hotkey {
		color: #ffffff56;
		flex-shrink: 0;
	}
</style>