<script lang="ts">
	import { eventScreen, clearEvent, openGiftModal } from '$lib/stores/uiStore';
	import { npcStore } from '$lib/stores/npcStore';
	import { questStore } from '$lib/stores/questStore';
	import { dialogueStore } from '$lib/stores/dialogueStore';
	import { playerStore } from '$lib/stores/playerStore';
	import * as CombatService from '$lib/services/CombatService';
	import * as LocationEventService from '$lib/services/LocationEventService';
	import { gatherResource } from '$lib/services/InteractionService';
	import { checkRequirement } from '$lib/services/QuestService';
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import type { NPC } from '$lib/types';

	let actions = [];
	let npc = null;

	const keymap = ['z', 'x', 'c', 'v', 'b'];

	// ---------------------------------------------------------------------------
	// Helper: check whether a location event action's requirement is met
	// Returns true if no requirement (always show), false if not met (hide action)
	// ---------------------------------------------------------------------------
	function isActionAvailable(action): boolean {
		if (!action.requirement) return true;
		const player = get(playerStore);
		const globalNpcs = get(npcStore).globalNpcs;
		const { met } = checkRequirement(action.requirement, player, null, globalNpcs, true);
		return met;
	}

	// ---------------------------------------------------------------------------
	// Reactive action builder
	// ---------------------------------------------------------------------------
	$: {
		npc = null;
		if ($eventScreen.type === 'npc' && $eventScreen.data?.npcId) {
			npc = $npcStore.globalNpcs[$eventScreen.data.npcId];
			if (npc) {
				const canChallenge = npc.isCombatant;
				const canGift = npc.heartRanks[npc.heartRank]?.giftingOptions?.length > 0;

				const quest = $questStore.quests[npc.swordRanks[npc.swordRank]?.questId];
				const showQuestIndicator =
					npc.heartState === 'READY_FOR_RANK_UP' || (quest && quest.state === 'AVAILABLE');

				actions = [
					{
						id: 'talk',
						label: 'Talk',
						hotkey: 'z',
						icon: showQuestIndicator ? '/game_icons/expression_alerted.png' : null,
						action: () => npcStore.interactTalk(npc.id),
						disabled: $dialogueStore.isOpen || $dialogueStore.justClosed
					},
					{
						id: 'challenge',
						label: 'Challenge',
						hotkey: 'x',
						disabled: !canChallenge || $dialogueStore.isOpen || $dialogueStore.justClosed,
						action: () => CombatService.startCombat(npc)
					},
					{
						id: 'gift',
						label: 'Gift Item',
						hotkey: 'c',
						action: () => openGiftModal(npc.id),
						disabled: $dialogueStore.isOpen || $dialogueStore.justClosed || !canGift
					}
				];
			}
		} else if ($eventScreen.type === 'location_event' && $eventScreen.data?.actions) {
			// Build actions from the event definition.
			// Per-action requirements are evaluated here — actions that fail are hidden entirely.
			// This means the hotkey list is tight: only available actions get keys assigned.
			const eventData = $eventScreen.data;
			const availableActions = eventData.actions.filter(isActionAvailable);

			actions = availableActions.map((act, index) => ({
				id: `event_action_${index}`,
				label: act.text,
				hotkey: keymap[index] || null,
				// FIX: call triggerEventAction so the requirement is double-checked server-side
				// and the correct responseMessage (not event.message) is used
				action: () => {
					const originalIndex = eventData.actions.indexOf(act);
					LocationEventService.triggerEventAction(eventData, originalIndex);
					clearEvent();
				}
			}));
		} else if ($eventScreen.type === 'resource') {
			actions = [
				{
					id: 'gather',
					label: 'Gather',
					hotkey: 'z',
					action: () => gatherResource()
				}
			];
		} else if ($eventScreen.type === 'enemy' && $eventScreen.data?.isLegendary) {
			let enemy = $eventScreen.data;
			const fakeNpcForCombat: NPC = {
				id: enemy.id,
				name: enemy.name,
				image: enemy.image,
				profileImage: enemy.thumbnailImage,
				isCombatant: true,
				baseStats: enemy.baseStats,
				swordRank: 0,
				heartRank: 0,
				affinity: 0,
				swordState: 'NOT_STARTED',
				heartState: 'NOT_STARTED',
				swordRanks: [],
				heartRanks: [],
				statGrowth: [],
				battleAftermathsBySwordRank: [],
				types: enemy.types,
				requirementSnapshot: {},
				swordRankMaxedDialogue: [],
				allRanksMaxedDialogue: [],
				galleryImages: [],
				faction: undefined,
				swordRankMaxedDialogueIndex: 0,
				allRanksMaxedDialogueIndex: 0
			};
			actions = [
				{
					id: 'challenge',
					label: 'Challenge',
					hotkey: 'x',
					action: () => CombatService.startCombat(fakeNpcForCombat)
				}
			];
		} else {
			actions = [];
		}
	}

	// ---------------------------------------------------------------------------
	// Keyboard handler
	// ---------------------------------------------------------------------------
	const handleKeydown = (e: KeyboardEvent) => {
		if ($dialogueStore.isOpen || ($dialogueStore as any).justClosed) return;

		if (actions.length > 0) {
			const key = e.key.toLowerCase();
			const action = actions.find((a) => a.hotkey === key && !a.disabled);
			if (action) {
				e.preventDefault();
				e.stopPropagation();
				action.action();
			} else if (key === 'escape') {
				e.preventDefault();
				e.stopPropagation();
				clearEvent();
			}
		}
	};

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeydown);
	});
</script>

<div class="interaction-menu">
	<ul>
		{#each actions as action}
			<li>
				<button on:click={action.action} disabled={action.disabled}>
					<div class="action-label">
						{#if action.icon}
							<img src={action.icon} alt="icon" class="icon" />
						{/if}
						<span>{action.label}</span>
					</div>
					{#if action.hotkey}
						<span class="hotkey">[{action.hotkey.toUpperCase()}]</span>
					{/if}
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	.interaction-menu {
		position: relative;
		padding: 16px 16px 22px;
		background-color: #cb997e;
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
		flex-direction: column;
		gap: 0.5rem;
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
	}
	button:hover,
	button:focus {
		background-color: #51bfc1;
		border-color: #09625b;
		color: #343a40;

		.hotkey {
			color: #343a40;
		}
	}
	button:disabled {
		color: #666;
		background-color: #1a1a1a;
		cursor: not-allowed;
	}
	.action-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.icon {
		width: 16px;
		height: 16px;
		image-rendering: pixelated;
		background-color: transparent;
	}
	.hotkey {
		color: #ffe8d6;
		color: var(--text-muted);
	}
</style>