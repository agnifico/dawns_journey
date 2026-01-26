<script lang="ts">
	import { questTrackerState, toggleQuestTracker } from '$lib/stores/uiStore';
	import { questStore } from '$lib/stores/questStore';
	import { questProgressStore } from '$lib/stores/questProgressStore';
	import { npcStore } from '$lib/stores/npcStore';
	import { draggable } from '$lib/actions/draggable';
	import type { Quest } from '$lib/types';

	let activeQuests: Quest[] = [];
	$: {
		activeQuests = Object.values($questStore.quests).filter(
			(q) => q.state === 'ACTIVE' || q.state === 'REPORT_PENDING'
		);
	}

	function getQuestIcon(quest: Quest, status: string): string {
		if (quest.state === 'REPORT_PENDING') {
			if (quest.finalState === 'COMPLETED') {
				return '/game_icons/expression_alerted.png'; // Exclamation mark for successful report
			} else if (quest.finalState === 'FAILED') {
				return '/game_icons/expression_stress.png'; // Sad face for failed report
			}
		}
		switch (status) {
			case 'ready':
				return '/game_icons/expression_alerted.png';
			case 'ready_for_rank_up':
				return '/game_icons/expression_love.png';
			default:
				return '/game_icons/expression_confused.png';
		}
	}
</script>

<div
	class="widget-container"
	use:draggable={{
		storageKey: 'quest-tracker-position',
		initialPosition: { x: window.innerWidth - 300, y: window.innerHeight - 400 }
	}}
>
	<div class="widget-header drag-handle">
		<span>Active Quests</span>
		<button class="toggle-button" on:click|stopPropagation={toggleQuestTracker}>
			{$questTrackerState.isCollapsed ? '+' : '-'}
		</button>
	</div>

	{#if !$questTrackerState.isCollapsed}
		<div class="widget-body">
			{#if activeQuests.length > 0}
				{#each activeQuests as quest}
					{@const currentStage = quest.stages[quest.currentStage]}
					{@const status = $questProgressStore[quest.id]}
					{@const giverName = $npcStore.globalNpcs[quest.giver]?.name || 'Unknown'}
					{@const icon = getQuestIcon(quest, status)}
					<div class="quest">
						<div class="quest-title">
							<img src={icon} alt="icon" class="quest-icon" />
							<div class="cont">
								<span>{giverName}</span><br />
								{quest.title}
							</div>
						</div>
						<div class="objectives">
							{#if currentStage}
								<ul>
									<li
										class:ready={status === 'ready' ||
											(quest.state === 'REPORT_PENDING' && quest.finalState === 'COMPLETED')}
										class:ongoing={status === 'ongoing'}
										class:failed={quest.state === 'REPORT_PENDING' && quest.finalState === 'FAILED'}
									>
										{currentStage.objective}
									</li>
								</ul>
							{/if}
						</div>
					</div>
				{/each}
			{:else}
				<p>No active quests.</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.ready {
		color: #4ade80; /* Tailwind Green 400 */
        /* list-style-type: '🟩 '; */
	}
	.ongoing {
        color: #facc15; /* Tailwind Yellow 400 */
        /* list-style-type: '🟨 '; */
	}
	.failed {
        color: #f87171; /* Tailwind Red 400 */
        /* list-style-type: '🟥 '; */
		text-decoration: line-through;
	}
	.widget-container {
		position: absolute;
		width: 300px;
		background-color: #2b2d4280;
		border: 1px solid var(--color-border);
		border-radius: 5px;
		color: white;
		font-family: var(--font-family-pixel);
		font-size: 0.9em;
		backdrop-filter: blur(10px);
		z-index: 10;
	}

	.widget-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.4em 0.6em;
		background-color: var(--color-secondary);
		cursor: grab;
		border-bottom: 1px solid var(--color-surface-1);
        color: var(--color-primary);
	}

	.toggle-button {
		background: none;
		border: 1px solid var(--color-text-muted);
		color: var(--color-text-muted);
		cursor: pointer;
		width: 20px;
		height: 20px;
		line-height: 1;
		padding: 0;
	}

	.widget-body {
		padding: 0.5rem;
	}

	.widget-body ul {
        padding: .5rem 0.5rem 1rem 0.5rem;
		/* padding-left: 0rem; */
		margin: 0rem 0 0 0;
        list-style: '';
        list-style-position: inside;
	}

	.quest {
        position: relative;
		margin-bottom: 0.75rem;
        height: fit-content;
		/* border: 1px solid white; */
		/* background-color: var(--color-surface-2); */
	}

	.quest-title {
        padding: .5rem;
        position: relative;
		/* font-weight: bold; */
        background-color: rgba(0, 0, 0, 0.4);
		color: var(--text-item-name);
		display: flex;
		align-items: center;
		span {
            color: var(--text-header);
            margin-left: auto;
            font-size: .75rem;
		}
	}
    
    .cont {
        width: 100%;
        padding: 0 .5rem;
        display: flex;
        /* gap: 1rem; */
        align-items: flex-start;
        justify-content: bottom;
        flex-direction: row-reverse;
        /* flex-direction: column; */
    }

	.quest-icon {
		height: 20px;
        margin: 0;
        margin-inline: 0 .25rem;
	}
    .objectives {
        background-color: rgba(36, 91, 185, 0.25);
        border-radius: 0 0 10px 10px;
    }
</style>
