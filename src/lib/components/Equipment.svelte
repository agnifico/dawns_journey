<script lang="ts">
	import {
		playerStore,
		playerActiveElements,
		playerActiveSetBonuses,
		playerExplorationAbilities
	} from '../stores/playerStore';
	import ItemBox from './ItemBox.svelte';
	import { activeItem } from '$lib/stores/uiStore';
	import { rarityClass } from '$lib/services/InventoryService';
	import BuffDisplay from './ui/BuffDisplay.svelte';
	import SetBonusDisplay from './ui/SetBonusDisplay.svelte';
	import ExploBubble_OLD from './ExploBubble_OLD.svelte';
	import { unequipItem } from '$lib/services/InventoryService';
	import GearPassive from './GearPassive.svelte';

	// Action sheet state
	let actionTarget: { slotType: 'weapon_slots' | 'relic_slots'; index: number } | null = null;

	function openActionSheet(slotType: 'weapon_slots' | 'relic_slots', index: number, item: any) {
		$activeItem = item;
		actionTarget = { slotType, index };
	}

	function closeActionSheet() {
		actionTarget = null;
	}

	function handleUnequip() {
		if (!actionTarget) return;
		unequipItem(actionTarget.slotType, actionTarget.index);
		actionTarget = null;
	}


</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->

{#if actionTarget}
	<div class="sheet-backdrop" on:click={closeActionSheet}></div>
{/if}

<div class="equipment-panel">
	<div class="left">
		<div class="equipment">
			<!-- Weapon slot 0 -->
			<div
				class="equipment-slot weapon-slot {rarityClass($playerStore.equipment.weapon_slots[0])}"
				class:has-item={!!$playerStore.equipment.weapon_slots[0]}
				class:active-sheet={actionTarget?.slotType === 'weapon_slots' && actionTarget?.index === 0}
				on:click={() => {
					if ($playerStore.equipment.weapon_slots[0]) {
						openActionSheet('weapon_slots', 0, $playerStore.equipment.weapon_slots[0]);
					}
				}}
			>
				{#if $playerStore.equipment.weapon_slots[0]}
					<ItemBox item={$playerStore.equipment.weapon_slots[0]} viewSize="large" />
					{#if actionTarget?.slotType === 'weapon_slots' && actionTarget?.index === 0}
						<div class="action-sheet">
							<button class="as-btn as-unequip" on:click|stopPropagation={handleUnequip}>Unequip</button>
						</div>
					{/if}
				{:else}
					<div class="empty-slot large-empty-slot"></div>
				{/if}
			</div>

			<!-- Relic slots -->
			<div class="relic-slots">
				{#each $playerStore.equipment.relic_slots as item, i}
					<div
						class="equipment-slot relic-slot {rarityClass(item)}"
						class:has-item={!!item}
						class:active-sheet={actionTarget?.slotType === 'relic_slots' &&
							actionTarget?.index === i}
						on:click={() => {
							if (item) openActionSheet('relic_slots', i, item);
						}}
					>
						{#if item}
							<ItemBox {item} viewSize="medium" />
							{#if actionTarget?.slotType === 'relic_slots' && actionTarget?.index === i}
								<div class="action-sheet">
									<button class="as-btn as-unequip" on:click|stopPropagation={handleUnequip}>Unequip</button>
								</div>
							{/if}
						{:else}
							<div class="empty-slot medium-empty-slot"></div>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Weapon slot 1 -->
			<div
				class="equipment-slot weapon-slot {rarityClass($playerStore.equipment.weapon_slots[1])}"
				class:has-item={!!$playerStore.equipment.weapon_slots[1]}
				class:active-sheet={actionTarget?.slotType === 'weapon_slots' && actionTarget?.index === 1}
				on:click={() => {
					if ($playerStore.equipment.weapon_slots[1]) {
						openActionSheet('weapon_slots', 1, $playerStore.equipment.weapon_slots[1]);
					}
				}}
			>
				{#if $playerStore.equipment.weapon_slots[1]}
					<ItemBox item={$playerStore.equipment.weapon_slots[1]} viewSize="large" />
					{#if actionTarget?.slotType === 'weapon_slots' && actionTarget?.index === 1}
						<div class="action-sheet">
							<button class="as-btn as-unequip" on:click|stopPropagation={handleUnequip}>Unequip</button>
						</div>
					{/if}
				{:else}
					<div class="empty-slot large-empty-slot"></div>
				{/if}
			</div>
		</div>

		{#if Object.keys($playerExplorationAbilities).length > 0}
			<div class="info-container explo-container">
				{#each Object.entries($playerExplorationAbilities) as [name, level]}
					<ExploBubble_OLD {name} {level} />
				{/each}
			</div>
		{/if}

		{#if $playerStore.activeEffects.length > 0}
			<div class="info-container effects-container">
				<!-- <span class="container-label">Active Bonuses</span> -->
				<div class="buffs-list">
					{#each $playerStore.activeEffects as effect (effect.id)}
						<BuffDisplay {effect} />
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Secondary info — passives, set bonuses, explo bubbles -->
	<div class="secondary-info">
		{#if $playerActiveSetBonuses.length > 0}
			<div class="set-bonuses-list">
				{#each $playerActiveSetBonuses as activeBonus}
					<SetBonusDisplay {activeBonus} />
				{/each}
			</div>
		{/if}

		{#if $playerStore.equipment.weapon_slots[0]?.gearPassives?.length > 0 || $playerStore.equipment.weapon_slots[1]?.gearPassives?.length > 0}
			<div class="gear-passive-list">
				{#if $playerStore.equipment.weapon_slots[0]}
					{#each $playerStore.equipment.weapon_slots[0].gearPassives as effect}
						<GearPassive
							weaponName={$playerStore.equipment.weapon_slots[0].name}
							passiveName={effect.name}
							description={effect.description}
							icon={$playerStore.equipment.weapon_slots[0].image}
						/>
					{/each}
				{/if}
				{#if $playerStore.equipment.weapon_slots[1]}
					{#each $playerStore.equipment.weapon_slots[1].gearPassives as effect}
						<GearPassive
							weaponName={$playerStore.equipment.weapon_slots[1].name}
							passiveName={effect.name}
							description={effect.description}
							icon={$playerStore.equipment.weapon_slots[1].image}
						/>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.equipment-panel {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 11px 13px 17px;
		border-radius: 8px;
		border: 1px solid rgba(200, 169, 110, 0.28);
		box-shadow: #00000056 0 -6px 0 3px inset;
	}
	.left {
		display: flex;
		flex-direction: column;
		gap: .5rem;
	}

	/* ── Equipment grid ── */
	.equipment {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		justify-content: center;
		align-items: center;
		background-color: rgba(0, 0, 0, 0.15);
		border-radius: 6px;
		padding: 8px;
		flex-shrink: 0;
	}

	.relic-slots {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		gap: 0.5rem;
	}

	/* ── Slots ── */
	.equipment-slot {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		box-sizing: border-box;
		padding: 4px;
		border-radius: 6px;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
	}

	.weapon-slot {
		width: 128px;
		height: 128px;
		background-color: rgba(0, 0, 0, 0.15);
		border: 2px solid rgba(209, 155, 62, 0.25);
		box-shadow: #00000056 0 -6px 0 3px inset;
	}

	/* Weapon slot highlight when occupied */
	.weapon-slot.has-item {
		border-color: rgba(209, 155, 62, 0.55);
		background-color: rgba(209, 155, 62, 0.04);
		box-shadow:
			#00000056 0 -6px 0 3px inset,
			rgba(209, 155, 62, 0.12) 0 0 12px 0;
	}

	.weapon-slot.has-item:hover {
		border-color: rgba(209, 155, 62, 0.85);
		box-shadow:
			#00000056 0 -6px 0 3px inset,
			rgba(209, 155, 62, 0.25) 0 0 16px 0;
	}

	/* Quality overrides */
	.weapon-slot.legendary,
	.relic-slot.legendary {
		border-color: rgba(232, 201, 110, 0.8) !important;
		background-color: rgba(232, 201, 110, 0.07) !important;
		box-shadow:
			#00000056 0 -6px 0 3px inset,
			rgba(232, 201, 110, 0.3) 0 0 18px 0 !important;
	}

	.weapon-slot.special,
	.relic-slot.special {
		border-color: rgba(160, 80, 220, 0.7) !important;
		background-color: rgba(160, 80, 220, 0.06) !important;
		box-shadow:
			#00000056 0 -6px 0 3px inset,
			rgba(160, 80, 220, 0.2) 0 0 14px 0 !important;
	}

	/* Selection highlight — amber for common/legendary, purple for special */
	.active-sheet {
		border-color: rgba(209, 155, 62, 1) !important;
		box-shadow:
			#00000056 0 -6px 0 3px inset,
			rgba(209, 155, 62, 0.35) 0 0 16px 0 !important;
	}
	.active-sheet.special {
		border-color: rgba(160, 80, 220, 1) !important;
		box-shadow:
			#00000056 0 -6px 0 3px inset,
			rgba(160, 80, 220, 0.4) 0 0 16px 0 !important;
	}

	.relic-slot {
		box-sizing: border-box;
		width: 72px;
		height: 72px;
		background-color: rgba(0, 0, 0, 0.1);
		border-radius: 5px;
		box-shadow: #00000056 0 -6px 0 3px inset;
		border: 2px solid rgba(209, 155, 62, 0.2);
	}

	.relic-slot.has-item {
		border-color: rgba(209, 155, 62, 0.45);
	}

	/* ── Action sheet ── */
	.sheet-backdrop {
		position: fixed;
		inset: 0;
		z-index: 98;
	}

	.action-sheet {
		position: absolute;
		bottom: calc(100% + 6px);
		left: 50%;
		transform: translateX(-50%);
		background: #1c1610;
		border: 1px solid rgba(200, 169, 110, 0.35);
		border-radius: 7px 7px 0 0;
		padding: 6px;
		display: flex;
		gap: 5px;
		z-index: 99;
		box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.5);
		white-space: nowrap;
	}

	.as-btn {
		padding: 5px 12px;
		border-radius: 5px;
		font-family: var(--font-family-pixel);
		font-size: 0.6rem;
		cursor: pointer;
		border: 1px solid;
		transition: background 0.1s;
	}


	.as-unequip {
		background: rgba(180, 50, 50, 0.12);
		border-color: rgba(180, 50, 50, 0.35);
		color: #d06060;
	}
	.as-unequip:hover {
		background: rgba(180, 50, 50, 0.25);
	}

	/* ── Empty slots ── */
	.empty-slot {
		background-size: cover;
		image-rendering: pixelated;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.large-empty-slot {
		width: 80px;
		height: 80px;
	}
	.medium-empty-slot {
		width: 40px;
		height: 40px;
	}

	/* ── Secondary info ── */
	.secondary-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
		min-width: 0;
	}

	.info-container {
		display: flex;
		align-items: flex-start;
		flex-wrap: wrap;
		gap: 4px;
		padding: 8px 10px 12px;
		border-radius: 6px;
		box-shadow: #00000056 0 -5px 0 2px inset;
	}

	.container-label {
		width: 100%;
		font-family: var(--font-family-pixel);
		font-size: 0.55rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(200, 169, 110, 0.4);
		margin-bottom: 2px;
	}

	.effects-container {
		background: rgba(68, 68, 68, 0.12);
		border: 1px solid rgba(225, 84, 84, 0.3);
	}

	.buffs-list {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.explo-container {
		background: rgba(68, 68, 68, 0.12);
		border: 1px solid rgba(96, 96, 200, 0.5);
	}

	.set-bonuses-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.gear-passive-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
</style>