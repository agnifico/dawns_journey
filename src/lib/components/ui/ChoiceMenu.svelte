<script lang="ts">
	import { eventScreen, clearEvent, openGiftModal } from '$lib/stores/uiStore';
	import { npcStore } from '$lib/stores/npcStore';
	import { questStore } from '$lib/stores/questStore';
	import { dialogueStore } from '$lib/stores/dialogueStore';
	import * as CombatService from '$lib/services/CombatService';
	import * as LocationEventService from '$lib/services/LocationEventService';
	import { gatherResource } from '$lib/services/InteractionService';
	import { onMount, onDestroy } from 'svelte';

	let actions = [];
	let npc = null;

	const keymap = ['z', 'x', 'c', 'v', 'b'];

	// Reactive statement to build actions based on the current event
	$: {
		npc = null; // Reset npc on event change
		if ($eventScreen.type === 'npc' && $eventScreen.data?.npcId) {
			npc = $npcStore.globalNpcs[$eventScreen.data.npcId];
			if (npc) {
				const canChallenge = npc.isCombatant;
                const canGift = npc.heartRanks[npc.heartRank]?.giftingOptions?.length > 0;
				
				const quest = $questStore.quests[npc.swordRanks[npc.swordRank]?.questId];
				const showQuestIndicator =
					npc.heartState === 'READY_FOR_RANK_UP' ||
					(quest && quest.state === 'AVAILABLE');

				actions = [
					{
						id: 'talk',
						label: 'Talk',
						hotkey: 'z',
						icon: showQuestIndicator ? '/game_icons/expression_alerted.png' : null,
						action: () => npcStore.interactTalk(npc.id),
						disabled: $dialogueStore.isOpen
					},
					{
						id: 'challenge',
						label: 'Challenge',
						hotkey: 'x',
						disabled: !canChallenge || $dialogueStore.isOpen,
						action: () => CombatService.startCombat(npc)
					},
					{
						id: 'gift',
						label: 'Gift Item',
						hotkey: 'c',
						action: () => openGiftModal(npc.id),
						disabled: $dialogueStore.isOpen || !canGift
					}
				];
			}
		} else if ($eventScreen.type === 'location_event' && $eventScreen.data?.actions) {
			actions = $eventScreen.data.actions.map((act, index) => ({
				id: `event_action_${index}`,
				label: act.text,
				hotkey: keymap[index] || null,
				action: () =>
					LocationEventService.triggerEventEffect(act.effects, $eventScreen.data.message)
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
		} else {
			actions = [];
		}
	}

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
		padding: 16px 16px 22px;
		background-color: #cb997e;
		border-top: 3px solid #00000056;
		/* width: 80%; */
		margin-inline: auto;
		border-radius: 0 0 12px 12px;
        box-shadow: #00000056 0 -6px 0 3px inset;
        background-color: var(--color-surface-1);
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
		padding: 0.25rem 0.5rem .5rem;
		background-color: #9c6f58;
		border: 3px solid #5e4335;
        border: none;
        background-color: var(--color-surface-2);
        color: var(--text-header);
		box-shadow: #1a1a1a 3px 3px;
        box-shadow: #00000056 0 -3px 0 3px inset;
		/* border: none; */
		border-radius: 6px;
		font-family: 'Silkscreen', sans-serif;
		text-align: left;
		font-size: 0.9rem;
		/* box-sizing: border-box; */
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