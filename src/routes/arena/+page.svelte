<script lang="ts">
	import { onMount } from 'svelte';
	import { getArenaNpc, getAllArenaNpcIds } from '$lib/data/arenaNpcs';
	import { getAbilityById } from '$lib/data/abilities';
	import { startArenaCombat } from '$lib/services/ArenaCombatService';
	import CombatModal from '$lib/components/CombatModal.svelte';
	import type { Combatant, Ability } from '$lib/types';
	import AbilityCard from '$lib/components/ui/AbilityCard.svelte';
	import { abilityMode } from '$lib/stores/settingsStore';
	import Notification from '$lib/components/Notification.svelte';
	import { elementBgs, elementColors } from '$lib/data/statDefinitions';
	import ElementTag from '$lib/components/ui/ElementTag.svelte';
	import ElementalOverlay from '$lib/components/ElementalOverlay.svelte';

	let opponents: Combatant[] = [];
	let selectedNpc: Combatant | null = null;
	let prevNpc: Combatant | null = null;
	let transitioning = false;

	onMount(() => {
		const opponentIds = getAllArenaNpcIds();
		opponents = opponentIds.map((id) => getArenaNpc(id)).filter(Boolean) as Combatant[];
		if (opponents.length > 0) selectedNpc = opponents[0];
	});

	function selectNpc(npc: Combatant) {
		if (npc.id === selectedNpc?.id) return;
		transitioning = true;
		setTimeout(() => {
			selectedNpc = npc;
			transitioning = false;
		}, 180);
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

	// Stat bar config — max values for normalising the bar width
	const statBars = [
		{ id: 'hp', label: 'HP', max: 1500, color: '#c44444' },
		{ id: 'auraShield', label: 'AURA', max: 800, color: '#4a90d9' },
		{ id: 'physicalAttack', label: 'PHY ATK', max: 600, color: '#c9973a' },
		{ id: 'elementalAttack', label: 'ELM ATK', max: 600, color: '#7a8fd4' },
		{ id: 'physicalDefence', label: 'PHY DEF', max: 600, color: '#5a9e6a' },
		{ id: 'elementalDefence', label: 'ELM DEF', max: 600, color: '#5a9e6a' },
		{ id: 'speed', label: 'SPD', max: 120, color: '#d4c44a' },
		{ id: 'critChance', label: 'CRIT %', max: 1, color: '#c47a4a', isPercent: true },
		{ id: 'critDamage', label: 'CRIT DMG', max: 3, color: '#e07a5f', isMultiplier: true },
		{ id: 'evasion', label: 'EVA', max: 150, color: '#9ab4a0' },
		{ id: 'precision', label: 'PRS', max: 100, color: '#a090b4' }
	] as const;

	function getStatValue(npc: Combatant, id: string): number {
		return (npc.baseStats as any)[id] ?? 0;
	}

	function fmtStat(val: number, cfg: (typeof statBars)[number]): string {
		if ('isPercent' in cfg && cfg.isPercent) return `${Math.round(val * 100)}%`;
		if ('isMultiplier' in cfg && cfg.isMultiplier) return `${val}×`;
		return String(Math.round(val));
	}

	function barWidth(val: number, max: number): number {
		return Math.min(100, Math.round((val / max) * 100));
	}

	// Primary element colour for the background tint
	function getPrimaryElementBg(npc: Combatant): string {
		const el = npc.types?.[0]?.toLowerCase();
		return el ? (elementBgs[el] ?? '#3a1a1a') : '#3a1a1a';
	}
</script>

<main>
	<!-- Page-level arena background -->
	<div class="arena-bg"></div>
	<div class="arena-vignette"></div>

	<div class="arena-page">
		<!-- ── Header ───────────────────────────────────────────────── -->
		<header class="page-header">
			<div class="title-lockup">
				<span class="title-pre">Enter</span>
				<h1 class="page-title">The Arena</h1>
			</div>
			<button
				class="dev-toggle"
				class:active={$abilityMode === 'dev'}
				on:click={() => abilityMode.update((m) => (m === 'dev' ? 'live' : 'dev'))}
			>
				{$abilityMode === 'dev' ? '⚔ DEV MODE' : '🔒 LIVE'}
			</button>
		</header>

		<!-- ── Main ─────────────────────────────────────────────────── -->
		<div class="main-layout">
			<!-- Roster strip -->
			<aside class="roster-col">
				<div class="roster-grid">
					{#each opponents as npc (npc.id)}
						<button
							class="npc-card"
							class:selected={selectedNpc?.id === npc.id}
							on:click={() => selectNpc(npc)}
							title={npc.name}
						>
							<div class="npc-card-img-wrap">
								<img src={npc.profileImage} alt={npc.name} />
							</div>
							<span class="npc-card-name">{npc.name}</span>
						</button>
					{/each}
				</div>
			</aside>

			<!-- Detail stage -->
			<section class="stage">
				{#if selectedNpc}
					<!-- Element-tinted character backdrop -->
					<div
						class="char-backdrop"
						class:fading={transitioning}
						style:--el-color={getPrimaryElementBg(selectedNpc)}
					>
						<img src={selectedNpc.profileImage} alt={selectedNpc.name} class="char-img" />
						<div class="char-backdrop-gradient"></div>
					</div>

					<!-- Content overlay -->
					<div class="stage-content" class:fading={transitioning}>
						{#each selectedNpc.types as el}
							<ElementalOverlay element={el.toLowerCase()} />
							<ElementalOverlay element={el.toLowerCase()} />
						{/each}
						<!-- Identity -->
						<div class="identity">
							<div class="identity-text">
								<h2 class="char-name">{selectedNpc.name}</h2>
								{#if selectedNpc.types?.length}
									<div class="char-elements">
										{#each selectedNpc.types as el}
											<ElementTag element={el.toLowerCase()} />
										{/each}
									</div>
								{/if}
							</div>
						</div>

						<!-- Stats + Abilities columns -->
						<div class="panels">
							<!-- Stats panel -->
							<div class="panel panel-stats">
								<div class="panel-label">Stats</div>
								<div class="stat-rows">
									{#each statBars as cfg}
										{@const val = getStatValue(selectedNpc, cfg.id)}
										{@const pct = barWidth(val, cfg.max)}
										<div class="stat-row">
											<span class="stat-label">{cfg.label}</span>
											<div class="stat-bar-track">
												<div
													class="stat-bar-fill"
													style:width="{pct}%"
													style:background={cfg.color}
												></div>
											</div>
											<span class="stat-val">{fmtStat(val, cfg)}</span>
										</div>
									{/each}
								</div>
							</div>

							<!-- Abilities + Passives panel -->
							<div class="panel panel-abilities">
								<div class="panel-label">Abilities</div>
								<div class="abilities-list">
									{#each getAbilities(selectedNpc) as ability (ability.id)}
										<AbilityCard {ability} mode="chip" />
									{/each}
								</div>

								{#if selectedNpc.gearPassives?.length}
									<div class="panel-label" style="margin-top: 0.75rem;">Passives</div>
									<div class="passives-list">
										{#each selectedNpc.gearPassives as p}
											<div class="passive-pill">
												<span class="passive-name">{p.name}</span>
												{#if p.description}
													<span class="passive-desc">{p.description}</span>
												{/if}
											</div>
										{/each}
									</div>
								{/if}
							</div>
						</div>

						<!-- Battle row -->
						<div class="battle-row">
							<button class="battle-btn" on:click={handleBattle}>
								<span class="battle-icon">⚔</span>
								<span>Battle {selectedNpc.name}</span>
							</button>
							<p class="battle-note">
								HP and Aura fully restored before battle. Outcome won't affect your main game.
							</p>
						</div>
					</div>
				{:else}
					<div class="no-selection">← Select a challenger</div>
				{/if}
			</section>
		</div>
	</div>

	<Notification />
</main>

<CombatModal />

<style>
	/* ── Page shell ───────────────────────────────────────────────────────── */
	main {
		position: relative;
		height: 100%;
		overflow: hidden;
		font-family: var(--font-family-pixel);
		color: #e8d5b7;
	}
	.arena-bg {
		position: absolute;
		inset: 0;
		background: url('/images/arenabg.png') center/cover no-repeat;
		z-index: 0;
	}
	/* Layered vignette — darker at left/bottom, lighter top-right where bg shows */
	.arena-vignette {
		position: absolute;
		inset: 0;
		z-index: 1;
		background:
			linear-gradient(to right, #0d0906ee 0%, #0d090688 45%, transparent 100%),
			linear-gradient(to top, #0d0906cc 0%, transparent 60%);
		pointer-events: none;
	}
	.arena-page {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 1.5rem 2rem 1rem;
		box-sizing: border-box;
		gap: 0.75rem;
	}

	/* ── Header ───────────────────────────────────────────────────────────── */
	.page-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		flex-shrink: 0;
	}
	.title-lockup {
		display: flex;
		flex-direction: column;
		gap: 0;
	}
	.title-pre {
		font-size: 0.55rem;
		letter-spacing: 5px;
		text-transform: uppercase;
		color: #7a5a20;
	}
	.page-title {
		font-family: 'DePixel', sans-serif;
		font-size: 2.8rem;
		font-weight: 700;
		font-style: italic;
		letter-spacing: -3px;
		color: #a53326;
		margin: 0;
		line-height: 1;
		/* subtle text shadow for depth */
		text-shadow:
			2px 3px 0 #2a0a08,
			0 0 40px rgba(165, 51, 38, 0.3);
	}
	.dev-toggle {
		background: rgba(20, 10, 8, 0.7);
		border: 1px solid #e94560;
		color: #e94560;
		font-family: var(--font-family-pixel);
		font-size: 0.6rem;
		padding: 0.35rem 0.8rem;
		border-radius: 5px;
		cursor: pointer;
		letter-spacing: 0.08em;
	}
	.dev-toggle.active {
		border-color: #49bb47;
		color: #49bb47;
	}

	/* ── Main layout ──────────────────────────────────────────────────────── */
	.main-layout {
		display: grid;
		grid-template-columns: 160px 1fr;
		gap: 1rem;
		flex: 1;
		min-height: 0;
	}

	/* ── Roster ───────────────────────────────────────────────────────────── */
	.roster-col {
		overflow-y: auto;
		min-height: 0;
		scrollbar-width: thin;
		scrollbar-color: #3a2a1a transparent;
	}
	.roster-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 6px;
		padding-bottom: 0.5rem;
	}
	.npc-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
		padding: 0 0 6px;
		background: rgba(30, 18, 10, 0.7);
		border: 2px solid rgba(0, 0, 0, 0.5);
		box-shadow: rgba(0, 0, 0, 0.5) 0 -4px 0 0 inset;
		border-radius: 10px;
		cursor: pointer;
		overflow: hidden;
		transition: all 0.12s ease;
		filter: grayscale(1) brightness(0.45) sepia(0.5);
	}
	.npc-card:hover {
		filter: grayscale(0.3) brightness(0.75);
		border-color: rgba(196, 146, 42, 0.4);
	}
	.npc-card.selected {
		filter: none;
		border-color: #c4922a;
		box-shadow:
			rgba(0, 0, 0, 0.5) 0 -4px 0 0 inset,
			0 0 0 1px #f6cb76,
			0 0 12px rgba(196, 146, 42, 0.3);
		background: rgba(100, 40, 20, 0.6);
	}
	.npc-card-img-wrap {
		width: 100%;
		aspect-ratio: 1/1;
		overflow: hidden;
		border-radius: 8px 8px 0 0;
	}
	.npc-card-img-wrap img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: transform 0.2s ease;
	}
	.npc-card:hover .npc-card-img-wrap img {
		transform: scale(1.04);
	}
	.npc-card-name {
		font-size: 0.5rem;
		color: #b89060;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding-top: 5px;
		text-align: center;
	}
	.npc-card.selected .npc-card-name {
		color: #f0e0c0;
	}

	/* ── Stage ────────────────────────────────────────────────────────────── */
	.stage {
		position: relative;
		min-height: 0;
		border-radius: 16px;
		overflow: hidden;
		border: 1px solid rgba(196, 146, 42, 0.15);
	}

	/* Character backdrop — full bleed image, darkened, element-tinted */
	.char-backdrop {
		position: absolute;
		inset: 0;
		z-index: 0;
		transition: opacity 0.18s ease;
	}
	.char-backdrop.fading {
		opacity: 0;
	}
	.char-img {
		position: absolute;
		/* Sit the image to the right, show face/torso */
		right: -2%;
		top: -5%;
		width: 62%;
		height: 115%;
		object-fit: cover;
		object-position: top center;
		/* Blur slightly so the overlay reads cleanly */
		filter: brightness(0.45) saturate(0.6);
	}
	/* Gradient over the image — fades left to pure dark, fades bottom */
	.char-backdrop-gradient {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(to right, #100a06 30%, rgba(16, 10, 6, 0.2) 70%, rgba(16, 10, 6, 0.5) 100%),
			linear-gradient(to top, #100a06 0%, transparent 40%),
			/* Element tint — subtle bloom in top-right */
				radial-gradient(
					ellipse at 85% 15%,
					color-mix(in srgb, var(--el-color, #3a1a1a) 18%, transparent) 0%,
					transparent 60%
				);
	}

	/* Content sits above the backdrop */
	.stage-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 1.25rem 1.5rem 1rem;
		box-sizing: border-box;
		gap: 0.75rem;
		transition: opacity 0.18s ease;
	}
	.stage-content.fading {
		opacity: 0;
	}

	/* ── Identity ─────────────────────────────────────────────────────────── */
	.identity {
		flex-shrink: 0;
	}
	.identity-text {
		display: flex;
		flex-direction: row;
		gap: 4px;
		justify-content: space-between;
	}
	.char-name {
		font-size: 1.6rem;
		font-weight: 700;
		font-style: italic;
		letter-spacing: -1px;
		text-transform: uppercase;
		color: #e8d5b7;
		margin: 0;
		text-shadow: 1px 2px 0 #1a0a06;
	}
	.char-elements {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}

	/* ── Panels ───────────────────────────────────────────────────────────── */
	.panels {
		display: grid;
		grid-template-rows: 1fr 1fr;
		gap: 0.75rem;
		flex: 1;
		min-height: 0;
		/* Cap width so it doesn't bleed into image area */
		max-width: 56%;
	}
	.panel {
		background: rgba(14, 8, 4, 0.72);
		border: 1px solid rgba(196, 146, 42, 0.18);
		border-radius: 10px;
		padding: 0.65rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		box-shadow: rgba(0, 0, 0, 0.6) 0 -4px 0 0 inset;
		/* overflow-y: auto; */
		scrollbar-width: thin;
		scrollbar-color: #3a2a1a transparent;
	}
	.panel-label {
		font-size: 0.5rem;
		letter-spacing: 4px;
		text-transform: uppercase;
		color: #7a5a20;
		flex-shrink: 0;
		margin-bottom: 2px;
	}

	/* ── Stat bars ────────────────────────────────────────────────────────── */
	.stat-rows {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.stat-row {
		display: grid;
		grid-template-columns: 52px 1fr 38px;
		align-items: center;
		gap: 6px;
	}
	.stat-label {
		font-size: 0.55rem;
		color: #8a7060;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		white-space: nowrap;
	}
	.stat-bar-track {
		height: 5px;
		background: rgba(255, 255, 255, 0.07);
		border-radius: 3px;
		overflow: hidden;
	}
	.stat-bar-fill {
		height: 100%;
		border-radius: 3px;
		transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 0 4px currentColor;
	}
	.stat-val {
		font-size: 0.65rem;
		color: #c8a870;
		text-align: right;
		white-space: nowrap;
	}

	/* ── Abilities ────────────────────────────────────────────────────────── */
	.abilities-list {
		display: flex;
		/* flex-direction: column; */
		flex-wrap: wrap;
		gap: 4px;
	}
	.passives-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.passive-pill {
		display: flex;
		flex-direction: column;
		gap: 1px;
		padding: 4px 8px 6px;
		background: rgba(30, 60, 30, 0.3);
		border: 1px solid rgba(109, 158, 90, 0.3);
		box-shadow: rgba(0, 0, 0, 0.4) 0 -2px 0 0 inset;
		border-radius: 6px;
	}
	.passive-name {
		font-size: 0.7rem;
		color: #7edb7e;
	}
	.passive-desc {
		font-size: 0.62rem;
		color: #6a8a6a;
		line-height: 1.4;
	}

	/* ── Battle row ───────────────────────────────────────────────────────── */
	.battle-row {
		display: flex;
		flex-direction: column;
		/* align-items: center; */
		gap: 1rem;
		flex-shrink: 0;
	}
	.battle-btn {
		position: absolute;
		right: 1rem;
		bottom: 1rem;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0.65rem 1.5rem 0.85rem;
		background: linear-gradient(180deg, #8b2a2a 0%, #6e1e1e 100%);
		color: #f0e0c0;
		border: 1px solid rgba(0, 0, 0, 0.5);
		box-shadow:
			rgba(0, 0, 0, 0.5) 0 -5px 0 0 inset,
			0 0 20px rgba(139, 42, 42, 0.25);
		border-radius: 10px;
		cursor: pointer;
		font-family: var(--font-family-pixel);
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		transition: all 0.1s ease;
		white-space: nowrap;
		flex-shrink: 0;
		margin-left: auto;
	}
	.battle-btn:hover {
		background: linear-gradient(180deg, #a83232 0%, #8b2020 100%);
		box-shadow:
			rgba(0, 0, 0, 0.5) 0 -3px 0 0 inset,
			0 0 28px rgba(200, 60, 60, 0.3);
		transform: translateY(1px);
	}
	.battle-btn:active {
		transform: translateY(4px);
		box-shadow: rgba(0, 0, 0, 0.5) 0 -1px 0 0 inset;
	}
	.battle-icon {
		font-size: 0.9rem;
	}
	.battle-note {
		font-size: 0.62rem;
		color: #5a4a38;
		line-height: 1.5;
		margin: 0;
	}

	.no-selection {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #3a2a1a;
		font-size: 0.7rem;
	}

	/* ── Transitions ──────────────────────────────────────────────────────── */
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ── Mobile ───────────────────────────────────────────────────────────── */
	@media (max-width: 768px) {
		.arena-page {
			padding: 1rem;
			overflow-y: auto;
			height: auto;
		}
		.main-layout {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
		}
		.roster-col {
			overflow-x: auto;
			overflow-y: visible;
		}
		.roster-grid {
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;
			gap: 6px;
		}
		.npc-card {
			flex-shrink: 0;
			width: 88px;
		}
		.stage {
			min-height: 520px;
		}
		.panels {
			grid-template-columns: 1fr;
			max-width: 100%;
		}
		.char-img {
			width: 80%;
			right: -10%;
			filter: brightness(0.35) saturate(0.5);
		}
		.char-backdrop-gradient {
			background:
				linear-gradient(to right, #100a06 15%, rgba(16, 10, 6, 0.6) 60%, rgba(16, 10, 6, 0.7) 100%),
				linear-gradient(to top, #100a06 0%, transparent 50%);
		}
	}

	@media (max-width: 480px) {
		.npc-card {
			width: 72px;
		}
		.page-title {
			font-size: 2rem;
		}
		.panels {
			max-width: 100%;
		}
	}
</style>
