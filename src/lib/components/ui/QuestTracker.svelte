<script lang="ts">
	import { questTrackerState, toggleQuestTracker, toggleSummarised } from '$lib/stores/uiStore';
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

	function toggleView() {
		if ($questTrackerState.isCollapsed) {
			toggleQuestTracker();
		}
		toggleSummarised();
	}
</script>
	<!-- use:draggable={{
		storageKey: 'quest-tracker-position',
		initialPosition: { x: this.innerWidth - 300, y: this.innerHeight - 400 }
	}} -->

<div
	class="widget-container"
>
	<div class="widget-header drag-handle">
		<span>Active Quests</span>
		<button class="toggle-button" on:click|stopPropagation={toggleView}>
			{$questTrackerState.isSummarised ? 'Full' : 'Mini'}
		</button>
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
						{#if !$questTrackerState.isSummarised}
							<div class="quest-title">
								<img src={icon} alt="icon" class="quest-icon" />
								<div class="cont">
									<span>{giverName}</span><br />
									{quest.title}
								</div>
							</div>
						{/if}
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
	p {
		padding: 0.25rem 0.5rem;
	}
	.ready {
		color: #4ade80;
		/* list-style-type: '🟩 '; */
	}
	.ongoing {
		color: #facc15;
		/* list-style-type: '🟨 '; */
	}
	.failed {
		color: #f87171;
		/* list-style-type: '🟥 '; */
		text-decoration: line-through;
	}
	.widget-container {
		/* position: absolute; */
		width: 13rem;
		/* background-color: #ffffff27; */
		border: 1px solid var(--color-border);
		/* border-radius: 5px; */
		color: white;
		font-family: var(--font-family-pixel);
		font-size: 0.75rem;
		backdrop-filter: blur(2px);
		z-index: 10;
		box-sizing: border-box;
	}

	.widget-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.25rem 0.5rem;
		/* background-color: var(--surface-2); */
		cursor: grab;
		/* border-bottom: 1px solid var(--surface-1); */
		color: var(--color-text);
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
		/* padding: 0.5rem; */
	}

	.widget-body ul {
		/* padding-left: 0rem; */
		list-style: '- ';
		list-style-position: inside;
		padding: 0;
		margin: 0;
		padding: 0.25rem 0.5rem 0.25rem 0.5rem;
	}

	.quest {
		position: relative;
		/* margin-bottom: 0.75rem; */
		height: fit-content;
		/* border: 1px solid white; */
		/* background-color: var(--surface-2); */
		background-color: rgba(0, 0, 0, 0.4);
	}

	.quest-title {
		/* border: 1px solid white; */
		padding: 0 0.5rem;
		position: relative;
		/* font-weight: bold; */
		color: var(--text-item-name);
		display: flex;
		align-items: center;
		span {
			color: var(--text-header);
			margin: auto auto auto 0;
			font-size: 0.75rem;
			text-transform: uppercase;
		}
	}

	.cont {
		font-size: 0.75rem;
		width: 100%;
		padding: 0.5rem;
		display: flex;
		/* gap: 1rem; */
		/* align-items: flex-end; */
		/* flex-direction: row-reverse; */
		flex-direction: column;
		/* border: 1px solid white; */
	}

	.quest-icon {
		height: 1rem;
		margin: 0;
		margin-inline: 0 0.25rem;
	}
	.objectives {
		height: fit-content;
		/* background-color: rgba(0, 0, 0, 0.2); */
		/* border-radius: 0 0 10px 10px; */
		/* display: flex; */
		/* justify-content: center; */
		/* align-items: center; */
		/* border: 1px solid black; */
	}
</style>
