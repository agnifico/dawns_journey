<script lang="ts">
	import { eventScreen, clearEvent } from '$lib/stores/uiStore';
	import { npcStore } from '$lib/stores/npcStore';
	import { landscapeImage } from '$lib/stores/mapStore';
	import { goto } from '$app/navigation';
	import ElementTag from './ui/ElementTag.svelte';
	import StatBar from './ui/StatBar.svelte';
	import ChoiceMenu from './ui/ChoiceMenu.svelte';
	import { elementBgs, elementColors } from '$lib/data/statDefinitions';

	$: isNpc = $eventScreen.type === 'npc';
	$: isLocation = $eventScreen.type === 'location_event';
	$: isVisible = isNpc || isLocation;

	$: npc = isNpc && $eventScreen.data?.npcId ? $npcStore.globalNpcs[$eventScreen.data.npcId] : null;

	$: showChoiceMenu = isNpc || (isLocation && $eventScreen.data?.actions);
</script>

<!-- Sheet slides up from bottom -->
<div class="panel-sheet" class:visible={isVisible}>
	{#if isVisible}
		<!-- Landscape bg bleed -->
		<div class="panel-bg" style:background-image="url({$landscapeImage})"></div>

		<div class="panel-layout">
			<!-- LEFT: Choice menu docked away from DPad -->
			{#if showChoiceMenu}
				<div class="panel-left">
					<ChoiceMenu flex="row" />
				</div>
			{/if}

			<!-- RIGHT: Event content -->
			<div class="panel-right">
				{#if isNpc && npc}
					<div
						class="npc-row"
						style:--npc-first-element-color={elementColors[npc.types[0].toLowerCase()]}
						style:--npc-first-element-bg={elementBgs[npc.types[0].toLowerCase()]}
						style:--npc-second-element-color={npc.types[1]
							? elementColors[npc.types[1].toLowerCase()]
							: elementColors[npc.types[0].toLowerCase()]}
						style:--npc-second-element-bg={npc.types[1]
							? elementBgs[npc.types[1].toLowerCase()]
							: elementBgs[npc.types[0].toLowerCase()]}
					>
						<div class="avatar-side">
							<button class="avatar-btn" on:click={() => goto(`/journal/character/${npc.id}`)}>
								<img src={$eventScreen.image} alt={npc.name} class="avatar" />
							</button>
						</div>
						<div class="npc-details">
							<p class="npc-name">{npc.name}</p>
							<!-- <p class="npc-label">CHARACTER</p> -->

							<div class="elements">
								{#each npc.types as type}
									<ElementTag element={type} size="mini" />
								{/each}
							</div>
							<div class="rank-meters">
								<div class="rank-meter">
									<img src="/game_icons/sword_rank.png" alt="sword" class="rank-icon" />
									<StatBar current={npc.swordRank} max={npc.swordRanks.length} color="pink" />
								</div>
								<div class="rank-meter">
									<img src="/game_icons/heart_rank.png" alt="heart" class="rank-icon" />
									<StatBar current={npc.heartRank} max={npc.heartRanks.length} color="white" />
								</div>
							</div>
						</div>
					</div>
				{:else if isLocation && $eventScreen.data}
					<div class="location-content">
						{#if $eventScreen.image}
							<img src={$eventScreen.image} alt="event" class="location-img" />
						{/if}
						<div class="location-text">
							<p class="npc-label">EVENT</p>
							<p class="npc-name">{$eventScreen.data.name}</p>
							{#if $eventScreen.data.shortDesc}
								<p class="location-desc">{$eventScreen.data.shortDesc}</p>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Dismiss handle -->
		<button class="panel-dismiss" on:click={clearEvent}>▼ dismiss</button>
	{/if}
</div>

<style>
	.panel-sheet {
		position: absolute;
		left: 0;
		/* right: 25%; */
		top: 60%;
		z-index: 55;
		max-height: 65%;
		background-color: var(--surface-2, #2a2a2a);
		border-top: 3px solid var(--color-secondary, #8b6f5e);
		border-radius: 0px 16px 16px 0;
		max-width: 80%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		transform: translateY(100%);
		transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
		box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.5);
	}

	.panel-sheet.visible {
		transform: translateY(0);
	}

	/* Blurred landscape bleeds through top */
	.panel-bg {
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: center;
		opacity: 0.08;
		filter: blur(8px);
		pointer-events: none;
	}

	.panel-layout {
		display: flex;
		flex-direction: column-reverse;
		flex: 1;
		min-height: 0;
		position: relative;
		z-index: 1;
	}

	/* Left column: ChoiceMenu, docked left, away from right-side DPad */
	.panel-left {
		/* width: 140px; */
		flex-shrink: 0;
		border-right: 1px solid rgba(255, 255, 255, 0.06);
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}

	.panel-left :global(.interaction-menu) {
		padding: 10px 8px 14px;
		border-radius: 0;
		background: transparent;
		border-top: none;
		box-shadow: none;
	}

	.panel-left :global(button) {
		font-size: 0.75rem;
		padding: 0.6rem 0.5rem;
		min-height: 44px;
		text-align: left;
	}

	/* Right column: NPC / location content */
	.panel-right {
		flex: 1;
		min-width: 0;
		overflow-y: auto;
		/* padding: 0.75rem; */
		display: flex;
		flex-direction: column;
		/* gap: 0.5rem; */
		height: 100%;
	}

	/* NPC */
	.npc-row {
		display: flex;
		/* flex-direction: column; */
		/* height: 100%; */
		/* gap: 0.75rem; */
		align-items: flex-start;
		/* border: 1px solid white; */
		padding: .75rem;
	}
	.avatar-side {
		display: flex;
	}

	.avatar-btn {
		z-index: 2;
		background: none;
		border: none;
		padding: 0;
		flex-shrink: 0;
		cursor: pointer;
		border-radius: 8px;
		height: fit-content;
	}

	.avatar {
		width: 130px;
		height: 130px;
		/* aspect-ratio: 1; */
		border-radius: 8px;
		object-fit: cover;
		border: 2px solid var(--color-secondary, #8b6f5e);
		image-rendering: auto;
		border: 4px solid color-mix(in srgb, #ffffff 30%, var(--npc-first-element-bg));
		box-shadow:
			var(--npc-first-element-bg) 0 6px 0 3px,
			var(--npc-first-element-bg) 0 0px 0 3px;
	}

	.npc-details {
		position: relative;
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.npc-label {
		font-family: var(--font-family-pixel);
		font-size: 0.55rem;
		letter-spacing: 0.12em;
		color: var(--color-secondary, #a98467);
		margin: 0;
	}

	.npc-name {
		z-index: 1;
		position: relative;
		top: 0.5rem;
		left: -1rem;
		padding-left: 1.75rem;
		padding-right: 1.5rem;
		padding-block: 0.5rem;
		width: fit-content;
		display: flex;
		flex-direction: column;
		font-family: var(--font-family-pixel);
		font-size: 1.3rem;
		font-weight: 600;
		height: fit-content;
		color: var(--npc-first-element-color);
		background-color: var(--npc-first-element-bg);
		clip-path: polygon(0 0, 90% 0, 100% 100%, 0% 100%);
	}

	.elements {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
		margin-block: 0.25rem;
		margin-top: 0.5rem;
		margin-bottom: 0.25rem;
		margin-left: 0.5rem;
		padding-left: 0;
		display: flex;
		gap: 0.25rem;
	}

	.rank-meters {
		display: flex;
		flex-direction: column;
		gap: 4px;
		/* margin-top: 2px; */
	}
	.rank-meter {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--npc-second-element-color);
		background-color: var(--npc-second-element-bg);
		box-shadow: #00000056 0 3px 0 2px;
		border-radius: 0 6px 6px 0;
		width: fit-content;
		padding: 0.25rem;
		padding-right: 1rem;
	}
	.rank-icon {
		width: 14px;
		height: 14px;
		image-rendering: pixelated;
	}

	/* Location event */
	.location-content {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.location-img {
		width: 56px;
		height: 56px;
		object-fit: contain;
		image-rendering: pixelated;
		flex-shrink: 0;
	}

	.location-text {
		flex: 1;
		min-width: 0;
	}

	.location-desc {
		font-family: monospace;
		font-size: 0.72rem;
		color: #bbb;
		margin: 4px 0 0;
		line-height: 1.5;
	}

	/* Dismiss handle */
	.panel-dismiss {
		flex-shrink: 0;
		width: 100%;
		background: rgba(0, 0, 0, 0.3);
		border: none;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		color: #666;
		font-family: var(--font-family-pixel);
		font-size: 0.6rem;
		padding: 6px;
		cursor: pointer;
		letter-spacing: 0.1em;
		position: relative;
		z-index: 1;
	}
	.panel-dismiss:hover {
		color: #aaa;
	}
</style>
