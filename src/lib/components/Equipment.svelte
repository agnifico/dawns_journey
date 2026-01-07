<script lang="ts">
	import {
		playerStore,
		playerMastery,
		playerActiveElements,
		playerActiveSetBonuses,
		playerExplorationAbilities
	} from '../stores/playerStore';
	import { game } from '$lib/game/game';
	import ItemBox from './ItemBox.svelte';
	import MasteryDisplay from './ui/MasteryDisplay.svelte';
	import { activeItem } from '$lib/stores/uiStore';
	import BuffDisplay from './ui/BuffDisplay.svelte';
	import SetBonusDisplay from './ui/SetBonusDisplay.svelte';
	import ExploBubble from './ExploBubble.svelte';

	$: coherenceActive =
		$playerStore.equipment.weapon_slots[0] &&
		$playerStore.equipment.weapon_slots[1] &&
		$playerStore.equipment.weapon_slots[0].element ===
			$playerStore.equipment.weapon_slots[1].element;
</script>

<div class="equipment-and-skills">
	<h2>Equipment</h2>
	<div class="equipment">
		<div class="weapon-slots">
			{#each $playerStore.equipment.weapon_slots as item, i}
				<div class="equipment-slot weapon-slot" on:click={() => ($activeItem = item)}>
					{#if item}
						<ItemBox {item} viewSize="large" base="" />
						<button
							class="unequip-button"
							on:click|stopPropagation={() => game.unequipItem('weapon_slots', i)}>-</button
						>
					{:else}
						<!-- <div class="empty-slot large-empty-slot" style="background-image: url('/game_icons/bgsq1.png');"> -->
						<div class="empty-slot large-empty-slot">
							<!-- <span class="slot-label">Weapon {i + 1}</span> -->
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<div class="relic-slots">
			{#each $playerStore.equipment.relic_slots as item, i}
				<div class="equipment-slot relic-slot" on:click={() => ($activeItem = item)}>
					{#if item}
						<ItemBox {item} viewSize="medium" base="" />
						<button
							class="unequip-button"
							on:click|stopPropagation={() => game.unequipItem('relic_slots', i)}>-</button
						>
					{:else}
						<div class="empty-slot medium-empty-slot">
							<!-- <div class="empty-slot medium-empty-slot" style="background-image: url('/game_icons/bgsq1.png');"> -->
							<!-- <span class="slot-label">Relic {i + 1}</span> -->
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<div class="mastery-container">
		<MasteryDisplay mastery={$playerMastery} elements={$playerActiveElements} />
		<div class="exploration-bubbles">
			{#each Object.entries($playerExplorationAbilities) as [name, level]}
				<ExploBubble {name} {level} />
			{/each}
		</div>
	</div>

	<div class="bonuses-container">
		{#if $playerActiveSetBonuses.length > 0}
			<div class="set-bonuses-list">
				{#each $playerActiveSetBonuses as activeBonus}
					<SetBonusDisplay {activeBonus} />
				{/each}
			</div>
		{/if}

		{#if coherenceActive}
			<div class="coherence-buff">
				<img src="/game_icons/coherence.png" alt="Coherence Buff" title="Coherence Buff" />
				<span>Coherence: +30% Elemental Attack</span>
			</div>
		{/if}
	</div>

	{#if $playerStore.activeEffects.length > 0}
		<div class="active-effects-container">
			{#each $playerStore.activeEffects as effect (effect.id)}
				<BuffDisplay {effect} />
			{/each}
		</div>
	{/if}
</div>

<style>
	h2 {
		font-family: 'DePixel';
		font-size: 1rem;
		color: var(--text-header);
		/* border: 1px solid white; */
		text-align: center;
	}
	.equipment-and-skills {
		padding: 1em;
		background-color: var(--color-surface-1);
		/* height: 100%; */
		border-radius: 12px;
		box-shadow: #00000056 0 -6px 0 6px inset;
		border-top: 3px solid #00000056;
		padding-bottom: 2rem;
	}
	.mastery-container {
		margin-top: 1em;
		padding-top: 1em;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		gap: 1em;
	}
	.exploration-bubbles {
		display: flex;
		flex-wrap: wrap;
		/* flex-direction: column; */
		gap: 0.5em;
		justify-content: center;
	}
	.bonuses-container {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		/* margin-top: 1em; */
		padding-top: 1em;
		/* border: 1px solid var(--color-border); */
	}
	.set-bonuses-list {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}
	.active-effects-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5em;
		/* margin-top: 1em; */
		padding-top: 1em;
		/* border: 1px solid var(--color-border); */
	}
	.coherence-buff {
		display: flex;
		align-items: center;
		gap: 0.5em;
		background-color: var(--color-surface-2);
		color: var(--color-text);
		padding: 0.5em;
		border-radius: 5px;
		/* margin-top: 1em; */
		border: 1px solid var(--color-primary);
	}
	.coherence-buff img {
		width: 24px;
		height: 24px;
	}
	.equipment {
		margin-top: 1em;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		/* border: 1px solid white; */
	}

	.weapon-slots,
	.relic-slots {
		display: flex;
		margin: 0 auto 0 0;
		margin: auto;
		gap: 1rem;

		&:hover {
			.unequip-button {
				visibility: visible;
			}
		}
	}

	.equipment-slot {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		/* border: 1px solid white; */
		/* border-radius: 8px; */
		box-sizing: border-box;
	}

	.weapon-slot {
		width: 120px;
		height: 130px;
		box-sizing: border-box;
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 5px;
		box-shadow: #00000056 0 -6px 0 3px inset;
		border-top: 3px solid #00000056;
		padding-bottom: 6px;
		background-color: var(--surface-3);
	}

	.relic-slot {
		width: 70px;
		height: 70px;
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 5px;
		box-shadow: #00000056 0 -6px 0 3px inset;
		border-top: 3px solid #00000056;
		padding-bottom: 6px;
		background-color: var(--surface-3);
	}

	.empty-slot {
		background-size: cover;
		background-position: center;
		image-rendering: pixelated;
		display: flex;
		justify-content: center;
		align-items: center;
		color: var(--color-text-muted);
		font-size: 0.8em;
		text-align: center;
	}

	.large-empty-slot {
		width: 80px;
		height: 80px;
	}

	.medium-empty-slot {
		width: 40px;
		height: 40px;
	}

	.slot-label {
		position: absolute;
		bottom: 2px;
		font-size: 0.75em;
		color: var(--color-text);
		font-weight: 600;
		/* text-shadow: 1px 1px 2px black; */
	}

	.unequip-button {
		position: absolute;
		bottom: 4px;
		right: 4px;
		padding: 2px 6px;
		font-size: 1em;
		line-height: 1;
		background-color: var(--color-debuff);
		color: white;
		font-weight: 600;
		cursor: pointer;
		z-index: 10;
		border: none;
		border-radius: 3px;
		/* border: 1px solid white; */
		visibility: hidden;
	}
</style>
