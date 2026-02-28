<script lang="ts">
	import { onMount } from 'svelte';
	import { getArenaNpc, getAllArenaNpcIds } from '$lib/data/arenaNpcs';
	import { getAbilityById } from '$lib/data/abilities';
	import { startArenaCombat } from '$lib/services/ArenaCombatService';
	import CombatModal from '$lib/components/CombatModal.svelte';
	import type { Combatant, Ability } from '$lib/types';
	import AbilityTag from '$lib/components/ui/AbilityTag.svelte';
	import Stat from '$lib/components/Stat.svelte';

	let opponents: Combatant[] = [];
	let selectedNpc: Combatant | null = null;

	onMount(() => {
		const opponentIds = getAllArenaNpcIds();
		opponents = opponentIds.map((id) => getArenaNpc(id)).filter(Boolean) as Combatant[];
		if (opponents.length > 0) {
			selectedNpc = opponents[0];
		}
	});

	function selectNpc(npc: Combatant) {
		selectedNpc = npc;
	}

	function handleBattle() {
		if (selectedNpc) {
			startArenaCombat(selectedNpc.id);
		}
	}

	function getAbilities(npc: Combatant): Ability[] {
		const abilityIds = new Set<string>();
		npc.arenaBehavior.phases.forEach((phase) => {
			phase.abilities.forEach((id) => abilityIds.add(id));
		});
		npc.arenaBehavior.triggers.forEach((trigger) => {
			abilityIds.add(trigger.responseAbility);
		});
		return Array.from(abilityIds)
			.map((id) => getAbilityById(id))
			.filter(Boolean) as Ability[];
	}

	function getNpcImagePath(npc: Combatant): string {
		return `/images/characters/${npc.id}/${npc.id}_avatar.png`;
	}
</script>

<div class="arena-container">
	<h1 class="title">The Arena</h1>
	<p class="description">
		Select an opponent and press 'Battle' to begin a fight. Your health and aura will be fully
		restored for the fight, and the outcome will not affect your main game progress.
	</p>

	<div class="main-grid">
		<div>
			<div class="opponents-grid">
				{#each opponents as npc (npc.id)}
					<button
						class="npc-button"
						class:selected={selectedNpc?.id === npc.id}
						on:click={() => selectNpc(npc)}
					>
						<img src={getNpcImagePath(npc)} alt={npc.name} width="80" height="80" />
						<span>{npc.name}</span>
					</button>
				{/each}
			</div>
		</div>

		<div>
			{#if selectedNpc}
				<div class="npc-details">
					<!-- <h2 class="npc-name">{selectedNpc.name}</h2> -->
					<div class="stats-abilities-grid">
						<div>
							<h3 class="section-title">Stats</h3>
							<div class="stats-grid">
								<Stat statId="hp" value={selectedNpc.baseStats.hp} />
								<Stat statId="auraShield" value={selectedNpc.baseStats.maxAuraShield} />
								<Stat statId="physicalAttack" value={selectedNpc.baseStats.physicalAttack} />
								<Stat statId="elementalAttack" value={selectedNpc.baseStats.elementalAttack} />
								<Stat statId="physicalDefence" value={selectedNpc.baseStats.physicalDefence} />
								<Stat statId="elementalDefence" value={selectedNpc.baseStats.elementalDefence} />
								<Stat statId="critChance" value={selectedNpc.baseStats.critChance} />
								<Stat statId="evasion" value={selectedNpc.baseStats.evasion} />
								<Stat statId="critDamage" value={selectedNpc.baseStats.critDamage} />
								<Stat statId="precision" value={selectedNpc.baseStats.precision} />
								<Stat statId="speed" value={selectedNpc.baseStats.speed} />
							</div>
						</div>
						<div>
							<h3 class="section-title">Abilities</h3>
							<div class="abilities-list">
								{#each getAbilities(selectedNpc) as ability (ability.id)}
									<div class="ability-item">
										<!-- <span>{ability.name}</span> -->
										<div class="ability-tooltip">
											<p style="font-weight: bold;">{ability.name}</p>
											<p>{@html ability.description}</p>
										</div>
										<AbilityTag {ability} interactive={false} disabled={false} />
									</div>
								{/each}
							</div>
							{#if selectedNpc.gearPassives}
								<h3 class="section-title">Passives</h3>
								{#each selectedNpc.gearPassives as gearPassive}
									{gearPassive.name} : {gearPassive?.description}<br />
								{/each}
							{/if}
						</div>
					</div>

					<button on:click={handleBattle} class="battle-button">
						Battle {selectedNpc.name}
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>

<CombatModal />

<style>
	.arena-container {
		padding: 1rem;
	}
	.title {
		font-size: 1.5rem;
		font-weight: bold;
		margin-bottom: 1rem;
	}
	.description {
		margin-bottom: 1rem;
	}
	.main-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}
	@media (min-width: 768px) {
		.main-grid {
			grid-template-columns: 1fr 2fr;
		}
	}
	.opponents-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.5rem;
		image-rendering: auto;

		button {
			display: flex;
			flex-direction: column;
		}
	}
	@media (min-width: 640px) {
		.opponents-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (min-width: 768px) {
		.opponents-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
	.npc-button {
		padding: 0.5rem;
		border: 1px solid #4a5568;
		border-radius: 0.25rem;
		transition: all 0.2s;
		background-color: #2d3748;
		color: white;
		cursor: pointer;
	}
	.npc-button.selected {
		background-color: #4299e1;
	}
	.npc-button img {
		margin: 0 auto 0.5rem;
		width: 150px;
		height: 150px;
	}
	.npc-button span {
		font-size: 0.875rem;
	}
	.npc-details {
		padding: 1rem;
		background-color: #2d3748;
		border-radius: 0.25rem;
	}
	.npc-name {
		font-size: 1.25rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
	}
	.npc-description {
		font-size: 0.875rem;
		font-style: italic;
		margin-bottom: 1rem;
	}
	.stats-abilities-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.25rem;
	}
	.section-title {
		font-weight: bold;
	}
	.abilities-list {
		position: relative;
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}
	.abilities-list .ability-item {
		position: relative;
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.abilities-list .ability-tooltip {
		position: absolute;
		display: none;
		background-color: #1a202c;
		color: white;
		padding: 0.5rem;
		border-radius: 0.25rem;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
		z-index: 10;
		width: 256px;
	}
	.abilities-list .ability-item:hover .ability-tooltip {
		display: block;
	}
	.battle-button {
		width: 100%;
		padding: 0.5rem 1rem;
		background-color: #4299e1;
		color: white;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
	}
</style>
