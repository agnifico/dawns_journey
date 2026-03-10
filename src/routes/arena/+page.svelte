<script lang="ts">
	import { onMount } from 'svelte';
	import { getArenaNpc, getAllArenaNpcIds } from '$lib/data/arenaNpcs';
	import { getAbilityById } from '$lib/data/abilities';
	import { startArenaCombat } from '$lib/services/ArenaCombatService';
	import CombatModal from '$lib/components/CombatModal.svelte';
	import type { Combatant, Ability } from '$lib/types';
	import AbilityTag from '$lib/components/ui/AbilityTag.svelte';
	import Stat from '$lib/components/Stat.svelte';
	import { abilityMode } from '$lib/stores/settingsStore';
	import Notification from "$lib/components/Notification.svelte";

	let opponents: Combatant[] = [];
	let selectedNpc: Combatant | null = null;

	onMount(() => {
		const opponentIds = getAllArenaNpcIds();
		opponents = opponentIds.map((id) => getArenaNpc(id)).filter(Boolean) as Combatant[];
		if (opponents.length > 0) selectedNpc = opponents[0];
	});

	function selectNpc(npc: Combatant) {
		selectedNpc = npc;
	}

	function handleBattle() {
		if (selectedNpc) startArenaCombat(selectedNpc.id);
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

<div class="arena-page">
	<!-- ═══════════════════════════════════ HEADER -->
	<div class="page-header">
		<div class="row1">
			<h1 class="page-title">The Arena</h1>
			<button
				class="dev-toggle"
				class:active={$abilityMode === 'dev'}
				on:click={() => abilityMode.update((m) => (m === 'dev' ? 'live' : 'dev'))}
			>
				{$abilityMode === 'dev' ? '⚔️ DEV - All Abilities Unlocked' : '🔒 LIVE - Limited Abilities'}
			</button>
		</div>
		<p class="page-desc">
			Select an opponent and press Battle to begin. Your HP and Aura will be fully restored, and the
			outcome won't affect your main game.
		</p>
	</div>

	<!-- ═══════════════════════════════════ MAIN LAYOUT -->
	<div class="main-layout">
		<!-- ── Roster ─────────────────────────────── -->
		<div class="roster-col">
			<div class="roster-grid">
				{#each opponents as npc (npc.id)}
					<button
						class="npc-card"
						class:selected={selectedNpc?.id === npc.id}
						on:click={() => selectNpc(npc)}
					>
						<div class="npc-card-img-wrap">
							<img src={getNpcImagePath(npc)} alt={npc.name} />
						</div>
						<span class="npc-card-name">{npc.name}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- ── Detail panel ──────────────────────── -->
		<div class="detail-col">
			{#if selectedNpc}
				<div class="detail-panel">
					<!-- NPC identity header -->
					<div class="detail-header">
						<img
							class="detail-portrait"
							src={getNpcImagePath(selectedNpc)}
							alt={selectedNpc.name}
						/>
						<div class="detail-identity">
							<h2 class="detail-name">{selectedNpc.name}</h2>
							{#if selectedNpc.elements?.length}
								<div class="detail-elements">
									{#each selectedNpc.elements as el}
										<span class="el-tag" style="background:{el}">{el}</span>
									{/each}
								</div>
							{/if}
						</div>
					</div>

					<!-- Stats + Abilities side by side -->
					<div class="stats-abilities">
						<!-- Stats -->
						<div class="section">
							<h3 class="section-label">Stats</h3>
							<div class="stats-grid">
								<Stat statId="hp" value={selectedNpc.baseStats.hp} />
								<Stat statId="auraShield" value={selectedNpc.baseStats.maxAuraShield} />
								<Stat statId="physicalAttack" value={selectedNpc.baseStats.physicalAttack} />
								<Stat statId="elementalAttack" value={selectedNpc.baseStats.elementalAttack} />
								<Stat statId="physicalDefence" value={selectedNpc.baseStats.physicalDefence} />
								<Stat statId="elementalDefence" value={selectedNpc.baseStats.elementalDefence} />
								<Stat statId="critChance" value={selectedNpc.baseStats.critChance} />
								<Stat statId="critDamage" value={selectedNpc.baseStats.critDamage} />
								<Stat statId="evasion" value={selectedNpc.baseStats.evasion} />
								<Stat statId="precision" value={selectedNpc.baseStats.precision} />
								<Stat statId="speed" value={selectedNpc.baseStats.speed} />
							</div>
						</div>

						<!-- Abilities -->
						<div class="section">
							<h3 class="section-label">Abilities</h3>
							<div class="abilities-list">
								{#each getAbilities(selectedNpc) as ability (ability.id)}
									<div class="ability-item">
										<AbilityTag {ability} interactive={false} disabled={false} />
										<div class="ability-tooltip">
											<p class="tooltip-name">{ability.name}</p>
											<p class="tooltip-desc">{@html ability.description}</p>
										</div>
									</div>
								{/each}
							</div>

							{#if selectedNpc.gearPassives?.length}
								<h3 class="section-label" style="margin-top: 0.75rem;">Passives</h3>
								<div class="passives-list">
									{#each selectedNpc.gearPassives as p}
										<div class="passive-pill">
											<span class="passive-name">{p.name}</span>
											{#if p.description}<span class="passive-desc">{p.description}</span>{/if}
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</div>

					<!-- Battle button -->
					<button class="battle-btn" on:click={handleBattle}>
						⚔ Battle {selectedNpc.name}
					</button>
				</div>
			{:else}
				<div class="no-selection">
					<span>← Select an opponent</span>
				</div>
			{/if}
		</div>
	</div>
	<Notification />
</div>

<CombatModal />

<style>
	/* ── Page shell ──────────────────────────────────────────────────────── */
	.arena-page {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		height: 100%;
		box-sizing: border-box;
		font-family: var(--font-family-pixel);
		color: #e9d9ca;
		overflow: hidden;
	}

	.page-header {
		flex-shrink: 0;
	}
	.page-title {
		font-size: 1.6rem;
		font-family: 'Lexend', sans-serif;
		font-weight: 700;
		color: #e9d9ca;
		margin: 0 0 0.3rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.page-desc {
		font-size: 0.65rem;
		color: #888;
		margin: 0;
		line-height: 1.6;
	}

	.dev-toggle {
		position: fixed;
		bottom: 1rem;
		left: 1rem;
		background: #1a1a2e;
		border: 1px solid #e94560;
		color: #e94560;
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.4rem 0.9rem;
		border-radius: 6px;
		cursor: pointer;
		z-index: 9999;
		&.active {
			border: 1px solid #49bb47;
			color: #49bb47;
		}
	}

	/* ── Layout ──────────────────────────────────────────────────────────── */
	.main-layout {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.75rem;
		flex: 1;
		min-height: 0;
	}

	/* ── Roster column ───────────────────────────────────────────────────── */
	.roster-col {
		overflow-y: auto;
		min-height: 0;
		/* border: 1px solid white; */
		flex: 1;
		box-sizing: border-box;
		/* scrollbar-width: none; */
	}

	.roster-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.5rem;
		padding-right: 1.3rem;
		padding-bottom: 1rem;
	}

	/* NPC portrait card — full game button style */
	.npc-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
		padding: 0;
		padding-bottom: 0.5rem;
		background-color: #2e2e2e;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -5px 0 0px inset;
		border-radius: 14px;
		cursor: pointer;
		transition: 0.1s all ease-in;
		overflow: hidden;
		width: 130px;
	}
	.npc-card:hover {
		transform: translateY(2px);
		box-shadow: #00000056 0 -5px 0 -3px inset;
		background-color: #383838;
	}
	.npc-card.selected {
		background-color: #435e52;
		border-color: #6a9880;
		box-shadow:
			#00000056 0 -5px 0 0px inset,
			0 0 0 1px #6a9880;
	}

	.npc-card-img-wrap {
		width: 100%;
		aspect-ratio: 1 / 1;
		overflow: hidden;
		border-radius: 11px 11px 0 0;
	}
	.npc-card-img-wrap img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.2s ease;
		image-rendering: auto;
	}
	.npc-card:hover .npc-card-img-wrap img {
		transform: scale(1.04);
	}

	.npc-card-name {
		font-size: 0.58rem;
		color: #cd804d;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding-top: 0.4rem;
		text-align: center;
	}
	.npc-card.selected .npc-card-name {
		color: #e9d9ca;
	}

	/* ── Detail column ───────────────────────────────────────────────────── */
	.detail-col {
		min-height: 0;
		overflow-y: auto;
		/* flex-grow: 1; */
		width: fit-content;
		padding-bottom: 0.5rem;
	}

	.detail-panel {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		height: 100%;
		box-sizing: border-box;
	}

	/* Identity header */
	.detail-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background-color: #435e52;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -5px 0 0px inset;
		border-radius: 18px;
		padding: 0.6rem 0.75rem;
		flex-shrink: 0;
	}
	.detail-portrait {
		width: 64px;
		height: 64px;
		object-fit: cover;
		border-radius: 10px;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -3px 0 0px inset;
		flex-shrink: 0;
	}
	.detail-identity {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.detail-name {
		font-family: 'Lexend', sans-serif;
		font-size: 1.1rem;
		font-weight: 700;
		margin: 0;
		color: #e9d9ca;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.detail-elements {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}
	.el-tag {
		font-size: 0.52rem;
		padding: 2px 6px 4px;
		border-radius: 4px;
		border: 2px solid #00000056;
		text-transform: capitalize;
	}

	/* Stats + Abilities */
	.stats-abilities {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem;
		flex: 1;
		min-height: 0;
	}

	.section {
		background-color: #2e2e2e;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -5px 0 0px inset;
		border-radius: 18px;
		padding: 0.6rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-height: 0;
		/* overflow: hidden; */
	}

	.section-label {
		font-size: 0.6rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #cd804d;
		margin: 0;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2px;
	}

	/* Abilities */
	.abilities-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}

	.ability-item {
		position: relative;
	}
	.ability-tooltip {
		display: none;
		position: absolute;
		bottom: calc(100% + 6px);
		left: 0;
		z-index: 50;
		background-color: #1a1a1a;
		border: 3px solid #00000056;
		box-shadow:
			#00000056 0 -4px 0 0px inset,
			0 4px 20px rgba(0, 0, 0, 0.6);
		border-radius: 12px;
		padding: 0.5rem 0.6rem;
		width: 220px;
		pointer-events: none;
	}
	.ability-item:hover .ability-tooltip {
		display: block;
	}
	.tooltip-name {
		font-size: 0.65rem;
		color: #cd804d;
		font-weight: bold;
		margin: 0 0 0.25rem;
	}
	.tooltip-desc {
		font-size: 0.6rem;
		color: #aaa;
		margin: 0;
		line-height: 1.5;
	}

	/* Passives */
	.passives-list {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.passive-pill {
		display: flex;
		flex-direction: column;
		gap: 1px;
		padding: 4px 8px 6px;
		background-color: #262626;
		border: 2px solid #00000056;
		box-shadow: #00000056 0 -2px 0 0px inset;
		border-radius: 8px;
	}
	.passive-name {
		font-size: 0.75rem;
		color: #7edb7e;
	}
	.passive-desc {
		font-size: 0.68rem;
		color: #888;
	}

	/* Battle button — full blocky press style */
	.battle-btn {
		width: 100%;
		padding: 0.75rem 1rem 1rem;
		background-color: #435e52;
		color: #e9d9ca;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -6px 0 0px inset;
		border-radius: 14px;
		cursor: pointer;
		font-family: var(--font-family-pixel);
		font-size: 0.85rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		transition: 0.1s all ease-in;
		flex-shrink: 0;
	}
	.battle-btn:hover {
		transform: translateY(2px);
		box-shadow: #00000056 0 -6px 0 -4px inset;
		background-color: #4f7060;
	}
	.battle-btn:active {
		transform: translateY(4px);
		box-shadow: #00000056 0 -6px 0 -6px inset;
	}

	.no-selection {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #444;
		font-size: 0.75rem;
	}

	/* ── Mobile ──────────────────────────────────────────────────────────── */
	@media (max-width: 768px) {
		.arena-page {
			overflow-y: auto;
			height: auto;
			padding: 0.75rem;
			gap: 0.6rem;
		}

		.main-layout {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
			flex: none;
		}

		/* Roster becomes a horizontal scroll strip */
		.roster-col {
			overflow-x: auto;
			overflow-y: visible;
		}
		.roster-grid {
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;
			gap: 0.5rem;
			padding-bottom: 0.25rem;
		}
		.npc-card {
			flex-shrink: 0;
			width: 90px;
		}

		/* Detail fills remaining space */
		.detail-col {
			overflow-y: visible;
		}

		.stats-abilities {
			grid-template-columns: 1fr;
		}

		.detail-portrait {
			width: 52px;
			height: 52px;
		}
		.detail-name {
			font-size: 0.9rem;
		}
	}

	@media (max-width: 480px) {
		.npc-card {
			width: 76px;
		}
		.stats-abilities {
			grid-template-columns: 1fr;
		}
	}
</style>
