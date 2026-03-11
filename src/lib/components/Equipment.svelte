<script lang="ts">
	import {
		playerStore,
		playerActiveElements,
		playerActiveSetBonuses,
		playerExplorationAbilities
	} from '../stores/playerStore';
	import { game } from '$lib/game/game';
	import ItemBox from './ItemBox.svelte';
	import { activeItem } from '$lib/stores/uiStore';
	import BuffDisplay from './ui/BuffDisplay.svelte';
	import SetBonusDisplay from './ui/SetBonusDisplay.svelte';
	import ExploBubble from './ExploBubble.svelte';
</script>

<div class="equipment-and-skills">
	<h2>Equipment</h2>
	<div class="equipment">
		<div class="weapon-slots">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="equipment-slot weapon-slot"
				on:click={() => ($activeItem = $playerStore.equipment.weapon_slots[0])}
			>
				{#if $playerStore.equipment.weapon_slots[0]}
					<ItemBox item={$playerStore.equipment.weapon_slots[0]} viewSize="large" />
					<button
						class="unequip-button"
						on:click|stopPropagation={() => game.unequipItem('weapon_slots', 0)}>-</button
					>
				{:else}
					<!-- <div class="empty-slot large-empty-slot" style="background-image: url('/game_icons/bgsq1.png');"> -->
					<div class="empty-slot large-empty-slot">
						<!-- <span class="slot-label">Weapon {i + 1}</span> -->
					</div>
				{/if}
			</div>
		</div>

		<div class="relic-slots">
			{#each $playerStore.equipment.relic_slots as item, i}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="equipment-slot relic-slot" on:click={() => ($activeItem = item)}>
					{#if item}
						<ItemBox {item} viewSize="medium" />
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

		<div class="weapon-slots">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="equipment-slot weapon-slot"
				on:click={() => ($activeItem = $playerStore.equipment.weapon_slots[1])}
			>
				{#if $playerStore.equipment.weapon_slots[1]}
					<ItemBox item={$playerStore.equipment.weapon_slots[1]} viewSize="large" />
					<button
						class="unequip-button"
						on:click|stopPropagation={() => game.unequipItem('weapon_slots', 1)}>-</button
					>
				{:else}
					<!-- <div class="empty-slot large-empty-slot" style="background-image: url('/game_icons/bgsq1.png');"> -->
					<div class="empty-slot large-empty-slot">
						<!-- <span class="slot-label">Weapon {i + 1}</span> -->
					</div>
				{/if}
			</div>
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
	</div>

	{#if $playerStore.activeEffects.length > 0}
		<div class="active-effects-container">
			{#each $playerStore.activeEffects as effect (effect.id)}
				<BuffDisplay {effect} />
			{/each}
		</div>
	{/if}

	{#if $playerStore.equipment.weapon_slots[0]}
		{#each $playerStore.equipment.weapon_slots[0].gearPassives as effect}
			<p>{effect.name}</p>
		{/each}
	{/if}
	{#if $playerStore.equipment.weapon_slots[1]}
		{#each $playerStore.equipment.weapon_slots[1].gearPassives as effect}
			<p>{effect.name}</p>
		{/each}
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
		background-color: var(--surface-1);
		/* height: 100%; */
		border-radius: 12px;
		box-shadow: #00000056 0 -6px 0 6px inset;
		border-top: 3px solid #00000056;
		padding-bottom: 2rem;
		display: flex;
		flex-direction: column;
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
		flex-direction: row;
		/* flex-wrap: wrap; */
		/* gap: 0.5em; */
		/* margin-top: 1em; */
		padding-top: 1em;
		/* border: 1px solid var(--color-border); */
	}
	.equipment {
		margin-top: 1em;
		display: flex;
		flex-direction: row;
		/* gap: 0.5rem; */
		/* border: 1px solid white; */
		justify-content: center;
		align-items: center;
	}

	.weapon-slots {
		display: flex;
		/* margin: 0 auto 0 0; */
		/* margin: auto; */
		/* gap: 0.5rem; */
		/* border: 1px solid white; */
	}

	.relic-slots {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		/* gap: 0.5rem; */
		margin-bottom: auto;
		position: relative;
	}

	.equipment-slot {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		box-sizing: border-box;
	}

	.weapon-slot {
		width: 128px;
		height: 128px;
		box-sizing: border-box;
		background-color: rgba(0, 0, 0, 0.5);
		/* border: 3px dashed #00000056; */
		/* border-radius: 5px; */
		/* box-shadow: #00000056 0 -6px 0 3px inset; */
		/* border-top: 3px solid #00000056; */
		/* padding-bottom: 6px; */
		background-color: var(--surface-3);
		&:hover {
			.unequip-button {
				visibility: visible;
			}
		}
	}

	.relic-slot {
		width: 64px;
		height: 64px;
		background-color: rgba(0, 0, 0, 0.5);
		border: 1px solid black;
		/* border: 3px dashed #00000056; */
		/* border-radius: 5px; */
		/* box-shadow: #00000056 0 -6px 0 3px inset; */
		/* border-top: 3px solid #00000056; */
		/* padding-bottom: 6px; */
		background-color: var(--surface-3);

		&:hover {
			.unequip-button {
				visibility: visible;
			}
		}
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
