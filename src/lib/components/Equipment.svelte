<script lang="ts">
	import {
		playerStore,
		playerActiveElements,
		playerActiveSetBonuses,
		playerExplorationAbilities
	} from '../stores/playerStore';
	import ItemBox from './ItemBox.svelte';
	import { activeItem } from '$lib/stores/uiStore';
	import { rarityClass, unequipItem } from '$lib/services/InventoryService';
	import { statDefinitions } from '$lib/data/statDefinitions';
	import { formatBonusLines } from '$lib/services/SetDataService';
	import SetBonusDisplay from './ui/SetBonusDisplay.svelte';
	import BuffDisplay from './ui/BuffDisplay.svelte';
	import ExploBubble_OLD from './ExploBubble_OLD.svelte';
	import GearPassive from './GearPassive.svelte';
	import { getGearPassiveById } from '$lib/data/abilities';

	$: hasGearPassive =
		$playerStore.equipment.weapon_slots[0]?.gearPassives?.length > 0 ||
		$playerStore.equipment.weapon_slots[1]?.gearPassives?.length > 0;

	// Action sheet
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

	// One card per set name, showing ALL active tier stats combined.
	// e.g. Hela's Toys 4/4 → shows 2-pc stats AND 4-pc stats in one card.
	type MergedSetBonus = {
		setName: string;
		equippedPieces: number;
		totalPieces: number;
		tiers: { pieces: number; bonus: import('$lib/types').SetBonus }[];
	};

	$: mergedSetBonuses = (() => {
		const map = new Map<string, MergedSetBonus>();
		for (const ab of $playerActiveSetBonuses) {
			if (!map.has(ab.setName)) {
				map.set(ab.setName, {
					setName: ab.setName,
					equippedPieces: ab.equippedPieces,
					totalPieces: ab.totalPieces,
					tiers: []
				});
			}
			const entry = map.get(ab.setName)!;
			if (ab.equippedPieces > entry.equippedPieces) entry.equippedPieces = ab.equippedPieces;
			entry.tiers.push({ pieces: ab.bonus.pieces, bonus: ab.bonus });
		}
		return Array.from(map.values());
	})();

	$: toggleEquipmentPanel = true;
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->

{#if actionTarget}
	<div class="sheet-backdrop" on:click={closeActionSheet}></div>
{/if}

<div class="equipment-panel">
	<div class="top">
		<!-- Equipment slots row -->
		<div class="equipment-row">
			<!-- Weapon 0 -->
			<div
				class="equipment-slot weapon-slot {rarityClass($playerStore.equipment.weapon_slots[0])}"
				class:has-item={!!$playerStore.equipment.weapon_slots[0]}
				class:active-sheet={actionTarget?.slotType === 'weapon_slots' && actionTarget?.index === 0}
				on:click={() => {
					if ($playerStore.equipment.weapon_slots[0])
						openActionSheet('weapon_slots', 0, $playerStore.equipment.weapon_slots[0]);
				}}
			>
				{#if $playerStore.equipment.weapon_slots[0]}
					<ItemBox item={$playerStore.equipment.weapon_slots[0]} viewSize="large" equipped="true" />
					{#if actionTarget?.slotType === 'weapon_slots' && actionTarget?.index === 0}
						<div class="action-sheet">
							<button class="as-btn as-unequip" on:click|stopPropagation={handleUnequip}
								>Unequip</button
							>
						</div>
					{/if}
				{:else}
					<div class="empty-slot large-empty-slot"></div>
				{/if}
			</div>

			<!-- 4 relic slots 2×2 -->
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
							<ItemBox {item} viewSize="medium" equipped="true" />
							{#if actionTarget?.slotType === 'relic_slots' && actionTarget?.index === i}
								<div class="action-sheet">
									<button class="as-btn as-unequip" on:click|stopPropagation={handleUnequip}
										>Unequip</button
									>
								</div>
							{/if}
						{:else}
							<div class="empty-slot medium-empty-slot"></div>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Weapon 1 -->
			<div
				class="equipment-slot weapon-slot {rarityClass($playerStore.equipment.weapon_slots[1])}"
				class:has-item={!!$playerStore.equipment.weapon_slots[1]}
				class:active-sheet={actionTarget?.slotType === 'weapon_slots' && actionTarget?.index === 1}
				on:click={() => {
					if ($playerStore.equipment.weapon_slots[1])
						openActionSheet('weapon_slots', 1, $playerStore.equipment.weapon_slots[1]);
				}}
			>
				{#if $playerStore.equipment.weapon_slots[1]}
					<ItemBox item={$playerStore.equipment.weapon_slots[1]} viewSize="large" equipped="true" />
					{#if actionTarget?.slotType === 'weapon_slots' && actionTarget?.index === 1}
						<div class="action-sheet">
							<button class="as-btn as-unequip" on:click|stopPropagation={handleUnequip}
								>Unequip</button
							>
						</div>
					{/if}
				{:else}
					<div class="empty-slot large-empty-slot"></div>
				{/if}
			</div>
		</div>
		<div class="equipment-side-panel">
			{#if hasGearPassive || mergedSetBonuses.length > 0}
				<button class="hide-btn" on:click={() => (toggleEquipmentPanel = !toggleEquipmentPanel)}
					>{toggleEquipmentPanel ? 'Hide' : 'Show'}</button
				>
			{/if}

			{#if toggleEquipmentPanel}
				<!-- Exploration abilities -->
				{#if Object.keys($playerExplorationAbilities).length > 0}
					<div class="info-section explo-section">
						<span class="section-label">Exploration</span>
						<div class="explo-list">
							{#each Object.entries($playerExplorationAbilities) as [name, level]}
								<ExploBubble_OLD {name} {level} />
							{/each}
						</div>
					</div>
				{/if}

				<!-- Active potion/food buffs -->
				{#if $playerStore.activeEffects.length > 0}
					<div class="info-section buffs-section">
						<span class="section-label">Active Buffs</span>
						<div class="buffs-list">
							{#each $playerStore.activeEffects as effect (effect.id)}
								<BuffDisplay {effect} />
							{/each}
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>

	{#if toggleEquipmentPanel}
		<!-- Secondary info: set bonuses + passives + explo + buffs -->
		<div class="secondary-row">
			<!-- Gear passives from weapons -->
			{#if hasGearPassive}
				<div class="info-section">
					<span class="section-label">Passives</span>
					<div class="passives-list">
						{#if $playerStore.equipment.weapon_slots[0]}
							{#each $playerStore.equipment.weapon_slots[0].gearPassives ?? [] as passiveId}
								{@const passive = getGearPassiveById(passiveId)}
								{#if passive}
									<GearPassive
										weaponName={$playerStore.equipment.weapon_slots[0].name}
										passiveName={passive.name}
										description={passive.description}
										icon={$playerStore.equipment.weapon_slots[0].image}
										view="mini"
									/>
								{/if}
							{/each}
						{/if}
						{#if $playerStore.equipment.weapon_slots[1]}
							{#each $playerStore.equipment.weapon_slots[1].gearPassives ?? [] as passiveId}
								{@const passive = getGearPassiveById(passiveId)}
								{#if passive}
									<GearPassive
										weaponName={$playerStore.equipment.weapon_slots[1].name}
										passiveName={passive.name}
										description={passive.description}
										icon={$playerStore.equipment.weapon_slots[1].image}
										view="mini"
									/>
								{/if}
							{/each}
						{/if}
					</div>
				</div>
			{/if}

			<!-- Set bonuses — one card per set, all tiers' stats shown -->
			{#if mergedSetBonuses.length > 0}
				<div class="info-section">
					<span class="section-label">Set Bonuses</span>
					<div class="set-bonuses">
						{#each mergedSetBonuses as set}
							<div class="merged-set-card">
								<div class="msc-header">
									<div class="msc-icon">✦</div>
									<div class="msc-title">
										<span class="msc-eyebrow">Set Bonus</span>
										<span class="msc-name">
											{set.setName}
											<span class="msc-pieces">({set.equippedPieces}/{set.totalPieces})</span>
										</span>
									</div>
								</div>
								{#each set.tiers as tier}
									<div class="msc-tier">
										<span class="msc-tier-label">({tier.pieces}-pc)</span>
										<div class="msc-stats">
											{#each formatBonusLines(tier.bonus) as line}
												<span class="msc-stat">{line}</span>
											{/each}
										</div>
									</div>
								{/each}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.equipment-panel {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		flex: 0;
		padding: 11px 13px 17px;
		border-radius: 8px;
		/* border: 1px solid rgba(200, 169, 110, 0.28); */
		/* box-shadow: #00000056 0 -6px 0 3px inset; */
		/* background: rgba(18, 14, 8, 0.4); */
	}
	.top {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.equipment-side-panel {
		display: flex;
		flex-direction: column;
		width: 100%;
		/* gap: 1rem; */
		/* border: 1px solid white; */
		margin: auto;
	}
	.hide-btn {
		cursor: pointer;
		position: absolute;
		right: 1rem;
		bottom: 1rem;
		background: rgb(63, 46, 13);
		box-shadow: #00000056 0 4px 0 2px;
		margin-bottom: 0.25rem;
		color: rgba(209, 155, 62, 0.4);
		font-family: var(--font-family-pixel);
		font-family: 'Pixelify Sans';
		font-size: 1rem;
		border: 3px solid rgba(209, 155, 62, 0.4);
		transition: 0.25s all ease;
		border-radius: 6px;
		padding: 2px 3px;
		text-align: center;
		width: fit-content;
	}

	/* ── Equipment row ── */
	.equipment-row {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		/* justify-content: center; */
		/* align-items: center; */
		background: rgba(0, 0, 0, 0.15);
		border-radius: 6px;
		padding: 8px;
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
		height: 100%;
		background: rgba(0, 0, 0, 0.15);
		border: 2px solid rgba(209, 155, 62, 0.25);
		box-shadow: #00000056 0 -6px 0 3px inset;
	}
	.weapon-slot.has-item,
	.relic-slot.has-item {
		/* border-color: rgba(209, 155, 62, 0.55); */
		background: rgba(84, 34, 34, 0.242);
		box-shadow:
			#00000056 0 -6px 0 3px inset,
			rgba(209, 155, 62, 0.12) 0 0 12px 0;
	}
	.weapon-slot.has-item:hover,
	.relic-slot.has-item:hover {
		border-color: rgba(209, 155, 62, 0.85);
		box-shadow:
			#00000056 0 -6px 0 3px inset,
			rgba(209, 155, 62, 0.25) 0 0 16px 0;
	}
	/* .weapon-slot.legendary,
	.relic-slot.legendary {
		border-color: rgba(232, 201, 110, 0.8) !important;
		background: rgba(232, 201, 110, 0.07) !important;
		box-shadow:
			#00000056 0 -6px 0 3px inset,
			rgba(232, 201, 110, 0.3) 0 0 18px 0 !important;
	}
	.weapon-slot.special,
	.relic-slot.special {
		border-color: rgba(160, 80, 220, 0.7) !important;
		background: rgba(160, 80, 220, 0.06) !important;
		box-shadow:
			#00000056 0 -6px 0 3px inset,
			rgba(160, 80, 220, 0.2) 0 0 14px 0 !important;
	} */
	.active-sheet {
		border-color: rgba(209, 155, 62, 1) !important;
		box-shadow:
			#00000056 0 -6px 0 3px inset,
			rgba(209, 155, 62, 0.35) 0 0 16px 0 !important;
	}
	.relic-slot {
		box-sizing: border-box;
		width: 72px;
		height: 72px;
		background: rgba(0, 0, 0, 0.15);
		border-radius: 5px;
		box-shadow: #00000056 0 -6px 0 3px inset;
		border: 2px solid rgba(209, 155, 62, 0.2);
	}
	.relic-slot.has-item {
		/* border-color: rgba(209, 155, 62, 0.45); */
		background: rgba(84, 34, 34, 0.242);
	}

	/* ── Action sheet ── */
	.sheet-backdrop {
		position: fixed;
		inset: 0;
		z-index: 98;
	}
	.action-sheet {
		position: absolute;
		/* bottom: calc(100% + 6px); */
		left: 50%;
		transform: translateX(-50%);
		bottom: 10px;
		background: #1c1610;
		border: 1px solid rgba(200, 169, 110, 0.35);
		border-radius: 7px 7px 0 0;
		border-radius: 7px 7px;
		padding: 0px;
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

	/* ── Secondary row ── */
	.secondary-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.info-section {
		display: flex;
		flex-direction: column;
		gap: 5px;
		flex: 1;
		/* min-width: 180px; */
	}
	.section-label {
		font-family: var(--font-family-pixel);
		font-size: 0.5rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(200, 169, 110, 0.4);
	}

	/* ── Set bonuses ── */
	.set-bonuses {
		display: flex;
		flex-direction: row;
		gap: 5px;
		/* background: rgba(200, 169, 110, 0.1); */
		/* flex: 1; */
		border-radius: 8px;
	}

	.merged-set-card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 11px 13px;
		border-radius: 8px;
		background: rgba(200, 169, 110, 0.1);
		background: rgba(161, 58, 58, 0.202);
		border: 1px solid rgba(200, 169, 110, 0.28);
		border: none;
		max-width: 180px;
	}
	.msc-header {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}
	.msc-icon {
		width: 36px;
		height: 36px;
		min-width: 36px;
		border-radius: 6px;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(200, 169, 110, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		color: #c8a96e;
	}
	.msc-title {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.msc-eyebrow {
		font-family: var(--font-family-pixel);
		font-size: 0.55rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgba(200, 169, 110, 0.45);
	}
	.msc-name {
		font-family: var(--font-family-pixel);
		font-size: 0.9rem;
		color: #c8a96e;
		line-height: 1.2;
	}
	.msc-pieces {
		font-weight: 400;
		font-size: 0.8rem;
		color: rgba(200, 169, 110, 0.45);
	}
	.msc-tier {
		display: flex;
		flex-direction: column;
		gap: 3px;
		padding-left: 2px;
		border-left: 2px solid rgba(200, 169, 110, 0.15);
		padding-left: 8px;
	}
	.msc-tier-label {
		font-family: var(--font-family-pixel);
		font-size: 0.55rem;
		color: rgba(200, 169, 110, 0.4);
	}
	.msc-stats {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.msc-stat {
		font-family: var(--font-family-pixel);
		font-size: 0.75rem;
		color: var(--text-muted);
		display: flex;
		align-items: center;
		gap: 5px;
	}
	.msc-stat::before {
		content: '▶';
		font-size: 0.45rem;
		color: rgba(200, 169, 110, 0.3);
		flex-shrink: 0;
	}
	.msc-stat-val {
		color: #c8a96e;
		font-weight: 600;
	}

	/* ── Passives ── */
	.passives-list {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	/* ── Explo ── */
	.explo-section .explo-list {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		flex: 0;
	}
	.explo-section {
		/* background: rgba(68, 68, 68, 0.12); */
		/* border: 1px solid rgba(96, 96, 200, 0.5); */
		border-radius: 6px;
		padding: 8px;
		width: fit-content;
		flex: 0;
	}

	/* ── Buffs ── */
	.buffs-section {
		/* background: rgba(68, 68, 68, 0.12); */
		/* border: 1px solid rgba(225, 84, 84, 0.3); */
		/* background: rgba(200, 169, 110, 0.1); */
		/* background: rgba(161, 58, 58, 0.202); */
		flex: 0;
		border-radius: 6px;
		padding: 8px;
	}
	.buffs-list {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}
</style>