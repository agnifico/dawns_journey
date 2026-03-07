<script lang="ts">
	import { combatStore } from '$lib/stores/combatStore';
	import * as CombatService from '$lib/services/CombatService';
	import StatDisplay from './ui/StatDisplay.svelte';
	import FloatingNumber from './ui/FloatingNumber.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { getItemById } from '$lib/services/InventoryService';
	import AbilityMenu from './AbilityMenu.svelte';
	import InfusionMenu from './InfusionMenu.svelte';
	import ElementTag from './ui/ElementTag.svelte';
	import { elementBgs, elementColors } from '$lib/data/statDefinitions';
	import { playerStore } from '$lib/stores/playerStore';
	import type { Combatant, CombatLogMessage } from '$lib/types';

	$: activeElement = $combatStore.player?.activeElement ?? 'dark';
	function getBGColor(): String {
		if ($combatStore.opponent.elements.length == 1) {
			console.log($combatStore.player?.activeElement);
			return elementBgs[$combatStore.opponent.elements[0].toLowerCase()];
		} else {
			let lg = `linear-gradient(-135deg, ${elementBgs[$combatStore.opponent.elements[0].toLowerCase()]}, ${elementBgs[$combatStore.opponent.elements[1].toLowerCase()]})`;
			console.log(lg);
			return lg;
		}
	}

	// ── Helpers ──────────────────────────────────────────────────────────────
	function getDamageStyle(
		damageType: 'physical' | 'elemental',
		element: string | undefined
	): string {
		if (damageType === 'elemental' && element) {
			return `background-color:${elementBgs[element.toLowerCase()]};color:${elementColors[element.toLowerCase()]};`;
		}
		return `background-color:${elementBgs['physical']};color:${elementColors['physical']};`;
	}
	function isLeft(msg: CombatLogMessage): boolean {
		return 'side' in msg && msg.side === 'player';
	}
	function isRight(msg: CombatLogMessage): boolean {
		return 'side' in msg && msg.side === 'opponent';
	}
	function isVisibleEffect(e: { inflictedBy?: string }): boolean {
		return e.inflictedBy !== 'equipment' && e.inflictedBy !== 'innate';
	}
	function isBuff(e: { damagePerTurn?: number; isStunned?: boolean }): boolean {
		return !e.damagePerTurn && !e.isStunned;
	}
	function pct(current: number, max: number): number {
		return max > 0 ? Math.min(100, Math.max(0, (current / max) * 100)) : 0;
	}

	// ── Stats toggle ─────────────────────────────────────────────────────────
	let hideStats = true;

	// ── Give-up confirmation ──────────────────────────────────────────────────
	let confirmClose = false;
	let confirmTimer: ReturnType<typeof setTimeout> | null = null;

	function handleCloseClick() {
		if (confirmClose) {
			CombatService.forceEndCombat();
		} else {
			confirmClose = true;
			confirmTimer = setTimeout(() => {
				confirmClose = false;
			}, 3000);
		}
	}

	// ── Turn-card carousel ────────────────────────────────────────────────────
	type TurnCard = { turn: number; messages: CombatLogMessage[] };
	let turnCards: TurnCard[] = [];
	let visibleTurnIndex = 0;

	$: {
		const cards: TurnCard[] = [];
		let current: TurnCard | null = null;
		for (const msg of $combatStore.combatLog) {
			if (msg.type === 'turn_banner') {
				if (current) cards.push(current);
				current = { turn: msg.turn, messages: [] };
			} else if (current) {
				current.messages.push(msg);
			} else {
				if (!cards[0] || cards[0].turn !== 0) cards.unshift({ turn: 0, messages: [] });
				cards[0].messages.push(msg);
			}
		}
		if (current) cards.push(current);
		turnCards = cards;
		visibleTurnIndex = Math.max(0, turnCards.length - 1);
	}

	function prevTurn() {
		visibleTurnIndex = Math.max(0, visibleTurnIndex - 1);
	}
	function nextTurn() {
		visibleTurnIndex = Math.min(turnCards.length - 1, visibleTurnIndex + 1);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!$combatStore.isInCombat) return;
		if (e.key === 'Escape') handleCloseClick();
		if (e.key === 'ArrowLeft') prevTurn();
		if (e.key === 'ArrowRight') nextTurn();
	}
	onMount(() => window.addEventListener('keydown', handleKeydown));
	onDestroy(() => {
		window.removeEventListener('keydown', handleKeydown);
		if (confirmTimer) clearTimeout(confirmTimer);
	});

	// ── Floating numbers ──────────────────────────────────────────────────────
	type FloatingEntry = {
		id: number;
		amount: number;
		type: 'damage' | 'heal' | 'crit';
		damageType?: 'physical' | 'elemental';
		offsetIndex: number;
	};
	let playerFloatingNumbers: FloatingEntry[] = [];
	let opponentFloatingNumbers: FloatingEntry[] = [];
	let floatingNumberId = 0;
	let lastProcessedLogIndex = -1;

	function spawnFloatingNumber(
		target: 'player' | 'opponent',
		entry: Omit<FloatingEntry, 'id' | 'offsetIndex'>,
		delay = 0
	): void {
		const id = floatingNumberId++;
		setTimeout(() => {
			const offsetIndex =
				target === 'player' ? playerFloatingNumbers.length : opponentFloatingNumbers.length;
			const newNumber: FloatingEntry = { ...entry, id, offsetIndex };
			if (target === 'player') {
				playerFloatingNumbers = [...playerFloatingNumbers, newNumber];
				setTimeout(() => {
					playerFloatingNumbers = playerFloatingNumbers.filter((n) => n.id !== id);
				}, 1300);
			} else {
				opponentFloatingNumbers = [...opponentFloatingNumbers, newNumber];
				setTimeout(() => {
					opponentFloatingNumbers = opponentFloatingNumbers.filter((n) => n.id !== id);
				}, 1300);
			}
		}, delay);
	}

	$: {
		if ($combatStore.combatLog.length > lastProcessedLogIndex + 1) {
			let opponentHitIndex = 0;
			let playerHitIndex = 0;
			const HIT_STAGGER_MS = 120,
				OPPONENT_BASE_MS = 100;
			for (let i = lastProcessedLogIndex + 1; i < $combatStore.combatLog.length; i++) {
				const msg = $combatStore.combatLog[i];
				if (msg.type === 'damage') {
					const target = msg.side === 'player' ? 'opponent' : 'player';
					const delay =
						target === 'opponent'
							? OPPONENT_BASE_MS + opponentHitIndex++ * HIT_STAGGER_MS
							: playerHitIndex++ * HIT_STAGGER_MS;
					spawnFloatingNumber(
						target,
						{
							amount: msg.amount,
							type: msg.isCritical ? 'crit' : 'damage',
							damageType: msg.damageType
						},
						delay
					);
				} else if (msg.type === 'heal') {
					const target = msg.side as 'player' | 'opponent';
					const delay =
						target === 'opponent'
							? OPPONENT_BASE_MS + opponentHitIndex++ * HIT_STAGGER_MS
							: playerHitIndex++ * HIT_STAGGER_MS;
					spawnFloatingNumber(target, { amount: msg.amount, type: 'heal' }, delay);
				}
			}
			lastProcessedLogIndex = $combatStore.combatLog.length - 1;
		}
	}
</script>

{#if $combatStore.isInCombat && $combatStore.player && $combatStore.opponent}
	<div class="combat-screen">
		<!-- ════════════════════════════════════ COMBATANTS ROW -->
		<div class="combatants-row">
			<!-- ── Player panel ─────────────────────────────── -->
			<div class="combatant-panel player-panel">
				<div class="avatar-col">
					<div class="avatar-container">
						<img class="avatar" src={$playerStore.profile.avatar} alt="Player" />
						{#each playerFloatingNumbers as num (num.id)}
							<FloatingNumber
								amount={num.amount}
								type={num.type}
								damageType={num.damageType}
								offsetIndex={num.offsetIndex}
							/>
						{/each}
					</div>
					<span class="combatant-name">{$combatStore.player.name || 'Player'}</span>
				</div>

				<div class="info-col">
					<!-- HP / Aura bars -->
					<div class="bars-and-infusion">
						<div class="hp-bars">
							<div class="hp-bar-row">
								<span class="bar-label">HP</span>
								<div class="bar-track">
									<div
										class="bar-fill hp"
										style="width:{pct($combatStore.player.hp, $combatStore.player.maxHp)}%"
									></div>
									<span class="bar-text"
										>{Math.max(0, $combatStore.player.hp)}/{$combatStore.player.maxHp}</span
									>
								</div>
							</div>
							{#if $combatStore.player.maxAuraShield > 0}
								<div class="hp-bar-row">
									<span class="bar-label aura">AS</span>
									<div class="bar-track">
										<div
											class="bar-fill aura"
											style="width:{pct(
												$combatStore.player.auraShield,
												$combatStore.player.maxAuraShield
											)}%"
										></div>
										<span class="bar-text"
											>{Math.max(0, $combatStore.player.auraShield)}/{$combatStore.player
												.maxAuraShield}</span
										>
									</div>
								</div>
							{/if}
						</div>
						<InfusionMenu />
					</div>

					<!-- Status effects -->
					<div class="status-strip">
						{#each $combatStore.player.statusEffects.filter(isVisibleEffect) as effect}
							<span class="status-pill" class:is-buff={isBuff(effect)}>
								{effect.name}
								{#if effect.remainingTurns !== undefined && effect.remainingTurns < 999}
									<span class="turns">{effect.remainingTurns}</span>
								{/if}
							</span>
						{/each}
					</div>

					<!-- Collapsible stats grid -->
					{#if !hideStats}
						<div class="stats-grid">
							<StatDisplay
								label="Phy ATK"
								current={$combatStore.player.physicalAttack}
								initial={$combatStore.initialPlayerStats?.physicalAttack}
								color="#4895EF"
							/>
							<StatDisplay
								label="Elm ATK"
								current={$combatStore.player.elementalAttack}
								initial={$combatStore.initialPlayerStats?.elementalAttack}
								color="#FF6347"
							/>
							<StatDisplay
								label="Phy DEF"
								current={$combatStore.player.physicalDefence}
								initial={$combatStore.initialPlayerStats?.physicalDefence}
								color="#4895EF"
							/>
							<StatDisplay
								label="Elm DEF"
								current={$combatStore.player.elementalDefence}
								initial={$combatStore.initialPlayerStats?.elementalDefence}
								color="#FF6347"
							/>
							<StatDisplay
								label="Speed"
								current={$combatStore.player.speed}
								initial={$combatStore.initialPlayerStats?.speed}
								color="#dad7cd"
							/>
							<StatDisplay
								label="Evasion"
								current={$combatStore.player.evasion}
								initial={$combatStore.initialPlayerStats?.evasion}
								color="#FA75B1"
							/>
							<StatDisplay
								label="Precision"
								current={$combatStore.player.precision}
								initial={$combatStore.initialPlayerStats?.precision}
								color="#FA75B1"
							/>
							<StatDisplay
								label="Crit %"
								current={$combatStore.player.critChance * 100}
								initial={$combatStore.initialPlayerStats &&
									$combatStore.initialPlayerStats.critChance * 100}
								color="#FFD700"
								decimals={0}
							/>
							<StatDisplay
								label="Crit Dmg"
								current={$combatStore.player.critDamage}
								initial={$combatStore.initialPlayerStats?.critDamage}
								color="#FFD700"
								decimals={1}
							/>
						</div>
					{/if}
				</div>
			</div>

			<!-- ── VS column ────────────────────────────────── -->
			<div class="vs-col">
				<button
					class="icon-btn eye-btn"
					on:click={() => (hideStats = !hideStats)}
					title="Toggle stats"
					aria-label="Toggle stats"
				>
					{hideStats ? '👁' : '🙈'}
				</button>
				<span class="vs-text">VS</span>
				<div class="turn-chip">T{$combatStore.turnNumber}</div>
				<button
					class="icon-btn close-btn"
					class:confirming={confirmClose}
					on:click={handleCloseClick}
					title={confirmClose ? 'Click again to give up' : 'Close combat'}
				>
					{#if confirmClose}
						<span class="give-up-text">Give<br />up?</span>
					{:else}
						<span class="esc-key">ESC</span>
						<span class="close-label">Close</span>
					{/if}
				</button>
			</div>

			<!-- ── Opponent panel ───────────────────────────── -->
			<div class="combatant-panel opponent-panel" style:background={getBGColor()}>
				<div class="info-col right">
					<!-- HP / Aura bars -->
					<div class="bars-and-infusion right">
						<div class="hp-bars">
							<div class="hp-bar-row">
								<div class="bar-track">
									<div
										class="bar-fill hp-enemy"
										style="width:{pct($combatStore.opponent.hp, $combatStore.opponent.maxHp)}%"
									></div>
									<span class="bar-text"
										>{Math.max(0, $combatStore.opponent.hp)}/{$combatStore.opponent.maxHp}</span
									>
								</div>
								<span class="bar-label enemy">HP</span>
							</div>
							{#if $combatStore.opponent.maxAuraShield > 0}
								<div class="hp-bar-row">
									<div class="bar-track">
										<div
											class="bar-fill aura"
											style="width:{pct(
												$combatStore.opponent.auraShield,
												$combatStore.opponent.maxAuraShield
											)}%"
										></div>
										<span class="bar-text"
											>{Math.max(0, $combatStore.opponent.auraShield)}/{$combatStore.opponent
												.maxAuraShield}</span
										>
									</div>
									<span class="bar-label aura">AS</span>
								</div>
							{/if}
						</div>
						<!-- Elements displayed where InfusionMenu would be for opponent -->
						<div class="opp-elements">
							{#each $combatStore.opponent.elements as element}
								<ElementTag {element} size="mini" />
							{/each}
						</div>
					</div>

					<!-- Status effects -->
					<div class="status-strip right">
						{#each $combatStore.opponent.statusEffects.filter(isVisibleEffect) as effect}
							<span class="status-pill" class:is-buff={isBuff(effect)}>
								{effect.name}
								{#if effect.remainingTurns !== undefined && effect.remainingTurns < 999}
									<span class="turns">{effect.remainingTurns}</span>
								{/if}
							</span>
						{/each}
					</div>

					<!-- Collapsible stats grid -->
					{#if !hideStats}
						<div class="stats-grid right">
							<StatDisplay
								label="Phy ATK"
								current={$combatStore.opponent.physicalAttack}
								initial={$combatStore.initialOpponentStats?.physicalAttack}
								color="#4895EF"
							/>
							<StatDisplay
								label="Elm ATK"
								current={$combatStore.opponent.elementalAttack}
								initial={$combatStore.initialOpponentStats?.elementalAttack}
								color="#FF6347"
							/>
							<StatDisplay
								label="Phy DEF"
								current={$combatStore.opponent.physicalDefence}
								initial={$combatStore.initialOpponentStats?.physicalDefence}
								color="#4895EF"
							/>
							<StatDisplay
								label="Elm DEF"
								current={$combatStore.opponent.elementalDefence}
								initial={$combatStore.initialOpponentStats?.elementalDefence}
								color="#FF6347"
							/>
							<StatDisplay
								label="Speed"
								current={$combatStore.opponent.speed}
								initial={$combatStore.initialOpponentStats?.speed}
								color="#dad7cd"
							/>
							<StatDisplay
								label="Evasion"
								current={$combatStore.opponent.evasion}
								initial={$combatStore.initialOpponentStats?.evasion}
								color="#FA75B1"
							/>
							<StatDisplay
								label="Precision"
								current={$combatStore.opponent.precision}
								initial={$combatStore.initialOpponentStats?.precision}
								color="#FA75B1"
							/>
							<StatDisplay
								label="Crit %"
								current={$combatStore.opponent.critChance * 100}
								initial={$combatStore.initialOpponentStats &&
									$combatStore.initialOpponentStats.critChance * 100}
								color="#FFD700"
								decimals={0}
							/>
							<StatDisplay
								label="Crit Dmg"
								current={$combatStore.opponent.critDamage}
								initial={$combatStore.initialOpponentStats?.critDamage}
								color="#FFD700"
								decimals={1}
							/>
						</div>
					{/if}
				</div>

				<div class="avatar-col">
					<div class="avatar-container">
						<img
							class="avatar"
							src={$combatStore.opponent.profileImage}
							alt={$combatStore.opponent.name}
						/>
						{#each opponentFloatingNumbers as num (num.id)}
							<FloatingNumber
								amount={num.amount}
								type={num.type}
								damageType={num.damageType}
								offsetIndex={num.offsetIndex}
							/>
						{/each}
					</div>
					<span class="combatant-name">{$combatStore.opponent.name}</span>
				</div>
			</div>
		</div>

		<!-- ════════════════════════════════════ LOG CAROUSEL -->
		<div class="log-section">
			<button
				class="nav-btn"
				on:click={prevTurn}
				disabled={visibleTurnIndex <= 0}
				aria-label="Previous turn">◀</button
			>

			<div class="log-card">
				{#if turnCards.length === 0}
					<p class="log-empty">Battle begins…</p>
				{:else}
					{@const card = turnCards[visibleTurnIndex]}
					{#if card}
						<div class="log-card-header">
							<span class="log-turn-label">
								{card.turn === 0 ? '⚔ Combat Start' : `Turn ${card.turn}`}
							</span>
							{#if card.turn > 0}
								<span class="log-turn-pager">{visibleTurnIndex} / {turnCards.length - 1}</span>
							{/if}
						</div>
						<div class="log-messages">
							{#each card.messages as msg}
								{#if msg.type === 'system'}
									<div class="lrow center"><span class="t-system">{msg.text}</span></div>
								{:else if msg.type === 'defeated'}
									<div class="lrow center">
										<span class="t-defeated"
											>{msg.side === 'player' ? '💀' : '⚔️'} {msg.name} defeated!</span
										>
									</div>
								{:else if msg.type === 'ability_use'}
									<div class="lrow" class:lrow-l={isLeft(msg)} class:lrow-r={isRight(msg)}>
										<span class="t-ability">{msg.abilityName}</span>
									</div>
								{:else if msg.type === 'damage'}
									<div class="lrow" class:lrow-l={isLeft(msg)} class:lrow-r={isRight(msg)}>
										<span
											class="t-dmg"
											class:crit={msg.isCritical}
											style={getDamageStyle(msg.damageType, msg.element)}
										>
											{msg.isCritical ? '★ ' : ''}{msg.amount}{#if msg.hitIndex}
												({msg.hitIndex}/5){/if}
										</span>
									</div>
								{:else if msg.type === 'multi_hit_summary'}
									<div class="lrow" class:lrow-l={isLeft(msg)} class:lrow-r={isRight(msg)}>
										<span class="t-multi"
											>{msg.hitCount}/{msg.totalHits} hits · {msg.totalDamage} total</span
										>
									</div>
								{:else if msg.type === 'miss'}
									<div class="lrow" class:lrow-l={isLeft(msg)} class:lrow-r={isRight(msg)}>
										<span class="t-miss"
											>{msg.reason === 'dodge' ? `${msg.defenderName} dodged!` : 'Missed!'}</span
										>
									</div>
								{:else if msg.type === 'heal'}
									<div class="lrow" class:lrow-l={isLeft(msg)} class:lrow-r={isRight(msg)}>
										<span class="t-heal">+{msg.amount} {msg.healType === 'hp' ? 'HP' : 'Aura'}</span
										>
									</div>
								{:else if msg.type === 'status_apply'}
									<div class="lrow" class:lrow-l={isLeft(msg)} class:lrow-r={isRight(msg)}>
										<span class={msg.isBuff ? 't-buff' : 't-debuff'}
											>{msg.targetName}: {msg.statusName}</span
										>
									</div>
								{:else if msg.type === 'status_tick'}
									<div class="lrow" class:lrow-l={isLeft(msg)} class:lrow-r={isRight(msg)}>
										<span class="t-poison">☠ {msg.statusName} −{msg.amount}</span>
									</div>
								{:else if msg.type === 'status_expire'}
									<div class="lrow" class:lrow-l={isLeft(msg)} class:lrow-r={isRight(msg)}>
										<span class="t-info">{msg.statusName} wore off</span>
									</div>
								{:else if msg.type === 'stat_change'}
									<div
										class="lrow"
										class:lrow-l={msg.targetSide === 'player'}
										class:lrow-r={msg.targetSide === 'opponent'}
									>
										<span class={msg.direction === 'up' ? 't-buff' : 't-debuff'}>
											{msg.direction === 'up' ? '▲' : '▼'}
											{msg.targetName}: {msg.stats.join(', ')}
										</span>
									</div>
								{:else if msg.type === 'stat_transfer'}
									<div class="lrow center">
										<span class="t-buff"
											>⇄ {msg.actorName}: {msg.description}{msg.suppressed
												? ' (no reduction)'
												: ''}</span
										>
									</div>
								{:else if msg.type === 'stun'}
									<div class="lrow" class:lrow-l={isLeft(msg)} class:lrow-r={isRight(msg)}>
										<span class="t-stun">⚡ {msg.actorName} is stunned!</span>
									</div>
								{:else if msg.type === 'immune'}
									<div class="lrow" class:lrow-l={isLeft(msg)} class:lrow-r={isRight(msg)}>
										<span class="t-buff">🛡 {msg.targetName}: immune to {msg.what}</span>
									</div>
								{/if}
							{/each}
						</div>
					{/if}
				{/if}
			</div>

			<button
				class="nav-btn"
				on:click={nextTurn}
				disabled={visibleTurnIndex >= turnCards.length - 1}
				aria-label="Next turn">▶</button
			>
		</div>

		<!-- ════════════════════════════════════ ACTIONS -->
		<div class="actions-bar">
			{#if !$combatStore.combatEnded}
				<!-- {#if $combatStore.turnPhase === 'player_selecting'} -->
				<div class="actions-inner">
					<AbilityMenu />
				</div>
				<!-- {:else if $combatStore.turnPhase === 'resolving'} -->
				<!-- <div class="resolving">
						<div class="spinner"></div>
						<span>Resolving…</span>
					</div> -->
				<!-- {/if} -->
			{:else}
				<div class="final-result">
					{#if $combatStore.outcome === 'win'}
						<span class="outcome-text win">⚔ Victory!</span>
						{#if $combatStore.drops && $combatStore.drops.length > 0}
							<div class="drops-row">
								<span class="drops-label">Drops:</span>
								{#each $combatStore.drops as drop}
									{@const item = getItemById(drop.itemId)}
									{#if item}
										<div class="drop-slot">
											<img src={item.image} alt={item.name} class="drop-thumb" title={item.name} />
											{#if drop.quantity > 1}<span class="drop-qty">×{drop.quantity}</span>{/if}
										</div>
									{/if}
								{/each}
							</div>
						{/if}
					{:else}
						<span class="outcome-text lose">💀 Defeated</span>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* ══ Screen ══════════════════════════════════════════════════════════════ */
	.combat-screen {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: grid;
		/* Combatants shrink-to-fit; log fills remaining space; actions shrink-to-fit */
		grid-template-rows: auto 1fr auto;
		background-color: #1a1a1a;
		overflow: hidden;
		font-family: var(--font-family-pixel);
		color: #e9d9ca;
		gap: 0.5rem;
		padding: 0.5rem;
		box-sizing: border-box;
	}

	/* ══ Combatants row ══════════════════════════════════════════════════════ */
	.combatants-row {
		display: grid;
		/* Player | VS-col | Opponent — equal halves, narrow centre */
		grid-template-columns: 1fr 3rem 1fr;
		gap: 0.5rem;
		min-height: 0;
	}

	.combatant-panel {
		display: flex;
		flex-direction: row;
		gap: 0.6rem;
		background-color: #435e52;
		background-color: #444444;
		background-color: transparent;
		color: #e9d9ca;
		border-radius: 18px;
		/* border: 3px solid #00000056; */
		box-shadow: #00000056 0px -6px 0 2px inset;
		padding: 0.6rem;
		box-sizing: border-box;
		min-width: 0;
	}

	/* Avatar */
	.avatar-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		flex-shrink: 0;
	}
	.avatar-container {
		position: relative;
		display: inline-block;
	}
	.avatar {
		width: 80px;
		height: 80px;
		object-fit: cover;
		border-radius: 12px;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -4px 0 0px inset;
		image-rendering: auto;
	}
	.combatant-name {
		font-size: 0.58rem;
		color: #ffffff;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		text-align: center;
		font-weight: bold;
	}

	/* Info column — fills remaining width */
	.info-col {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		flex: 1;
		min-width: 0;
	}
	.info-col.right {
		align-items: flex-end;
	}

	/* ── HP bars + InfusionMenu / elements side by side ── */
	.bars-and-infusion {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		gap: 0.5rem;
	}
	.bars-and-infusion.right {
		flex-direction: row-reverse;
		width: 100%;
		/* border: 1px solid white; */
	}

	.hp-bars {
		display: flex;
		flex-direction: column;
		gap: 5px;
		flex: 1;
		min-width: 0;
	}

	.hp-bar-row {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 5px;
	}

	.bar-label {
		font-size: 0.55rem;
		color: #8ab09a;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		flex-shrink: 0;
		width: 1.6rem;
		width: fit-content;
		background-color: #000000cc;
		padding: 4px;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.bar-label.aura {
		color: #5bcbf5;
	}
	.bar-label.enemy {
		color: #ff9696;
	}

	.bar-track {
		position: relative;
		flex: 1;
		height: 18px;
		/* background-color: color-mix(in srgb, #4ade80 15%, #111); */
		background-color: #c1c1c1;
		border-radius: 6px;
		border: 2px solid #000000;
		box-shadow: #00000056 0 -2px 0 0px inset;
		overflow: hidden;
		min-width: 60px;
	}

	.bar-fill {
		position: absolute;
		inset: 0;
		height: 100%;
		border-radius: 4px;
		transition: width 0.35s ease-in-out;
	}
	.bar-fill.hp {
		background-color: #4ade80;
		background-image: linear-gradient(to bottom, #6ef29a, #4ade80);
		background: linear-gradient(
			225deg,
			#166383 0%,
			#237f7e 20%,
			#399e80 40%,
			#55bc88 60%,
			#74d496 80%,
			#94e3a8 100%
		);
		box-shadow:
			#00000056 0 -2px 0 0px inset,
			hsla(0, 0%, 0%, 0.2) -2px 0px 2px 0px inset,
			hsla(0, 0%, 0%, 0.4) 2px 0px 3px 0px;
	}
	.bar-fill.hp-enemy {
		background-color: #e05252;
		background-image: linear-gradient(to bottom, #f07070, #e05252);
		box-shadow:
			#00000056 0 -2px 0 0px inset,
			hsla(0, 0%, 0%, 0.2) -2px 0px 2px 0px inset,
			hsla(0, 0%, 0%, 0.4) 2px 0px 3px 0px;
	}
	.bar-fill.aura {
		background-color: #00bfff;
		/* background-image: linear-gradient(to bottom, #40d4ff, #00bfff); */
		background: linear-gradient(90deg, #399dcd 0%, #2b7eb8 25%, #226098 50%, #214973 75%, #273d51);
		box-shadow:
			#00000056 0 -2px 0 0px inset,
			hsla(0, 0%, 0%, 0.2) -2px 0px 2px 0px inset,
			hsla(0, 0%, 0%, 0.4) 2px 0px 3px 0px;
	}

	.bar-text {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		font-size: 0.6rem;
		color: #ffffff;
		text-shadow:
			0 1px 2px #000,
			0 0 4px #000;
		pointer-events: none;
		letter-spacing: 0.02em;
	}

	/* Opponent elements box — mirrors InfusionMenu's sizing */
	.opp-elements {
		display: flex;
		flex-direction: column;
		gap: 4px;
		align-items: center;
		justify-content: center;
		/* padding: .25rem .25rem .75rem; */
		/* border: 3px solid #00000056; */
		/* box-shadow: #00000056 0 -3px 0 0px inset; */
		/* border-radius: 6px; */
		/* background-color: #384f44; */
		min-width: 2.4rem;
		flex-shrink: 0;
	}

	/* Status pills */
	.status-strip {
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
		min-height: 0;
	}
	.status-strip.right {
		justify-content: flex-end;
	}

	.status-pill {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		padding: 3px 6px 5px;
		border-radius: 6px;
		background-color: #3a1010;
		color: #ff9090;
		font-size: 0.52rem;
		border: 2px solid #00000056;
		box-shadow: #00000056 0 -2px 0 0px inset;
	}
	.status-pill.is-buff {
		background-color: #10301a;
		color: #7edb7e;
	}
	.turns {
		background: rgba(0, 0, 0, 0.4);
		padding: 0 3px;
		border-radius: 3px;
		color: #bbb;
		font-size: 0.48rem;
	}

	/* Stats grid */
	.stats-grid {
		display: grid;
		width: 100%;
		grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
		gap: 2px;
	}

	/* ══ VS column ═══════════════════════════════════════════════════════════ */
	.vs-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
	}
	.vs-text {
		font-size: 0.65rem;
		color: #556655;
		letter-spacing: 0.12em;
	}
	.turn-chip {
		background-color: #2e2e2e;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -3px 0 0px inset;
		color: #cd804d;
		font-size: 0.55rem;
		padding: 4px 5px;
		border-radius: 8px;
		letter-spacing: 0.04em;
	}

	/* Icon buttons in VS col */
	.icon-btn {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		padding: 0.3rem 0.2rem 0.45rem;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -4px 0 0px inset;
		border-radius: 10px;
		cursor: pointer;
		font-family: var(--font-family-pixel);
		font-size: 0.6rem;
		letter-spacing: 0.04em;
		transition: 0.1s all ease-in;
	}
	.icon-btn:hover {
		transform: translateY(2px);
		box-shadow: #00000056 0 -4px 0 -3px inset;
	}

	.eye-btn {
		background-color: #435e52;
		color: #e9d9ca;
		font-size: 0.9rem;
		padding: 0.25rem 0.2rem 0.4rem;
	}
	.eye-btn:hover {
		background-color: #547060;
	}

	.close-btn {
		background-color: #5e3535;
		color: #e9d9ca;
	}
	.close-btn:hover {
		background-color: #6e3f3f;
	}

	/* Two-step give-up state */
	.close-btn.confirming {
		background-color: #8b1a1a;
		animation: pulse-red 0.6s ease-in-out infinite alternate;
	}
	@keyframes pulse-red {
		from {
			background-color: #8b1a1a;
			box-shadow: #00000056 0 -4px 0 0px inset;
		}
		to {
			background-color: #b02020;
			box-shadow:
				#00000056 0 -4px 0 0px inset,
				0 0 8px #ff4040aa;
		}
	}
	.esc-key {
		background-color: #3a1a1a;
		color: #ff9090;
		padding: 1px 4px;
		border-radius: 3px;
		font-size: 0.52rem;
		border: 1px solid #00000056;
	}
	.close-label {
		font-size: 0.6rem;
	}
	.give-up-text {
		font-size: 0.58rem;
		color: #ffaaaa;
		text-align: center;
		line-height: 1.3;
	}

	/* ══ Log carousel ════════════════════════════════════════════════════════ */
	.log-section {
		display: flex;
		align-items: stretch;
		gap: 0.4rem;
		min-height: 0;
	}

	.nav-btn {
		flex-shrink: 0;
		width: 2.4rem;
		background-color: #2e2e2e;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -4px 0 0px inset;
		border-radius: 12px;
		color: #cd804d;
		font-size: 1rem;
		cursor: pointer;
		transition: 0.1s all ease-in;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-family-pixel);
	}
	.nav-btn:not(:disabled):hover {
		transform: translateY(2px);
		box-shadow: #00000056 0 -4px 0 -3px inset;
	}
	.nav-btn:disabled {
		color: #444;
		cursor: default;
	}

	.log-card {
		flex: 1;
		background-color: #2e2e2e;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -6px 0 0px inset;
		border-radius: 18px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		min-height: 0;
	}

	.log-card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.3rem 0.75rem;
		background-color: #262626;
		border-bottom: 2px solid #00000056;
		flex-shrink: 0;
		border-radius: 15px 15px 0 0;
	}
	.log-turn-label {
		font-size: 0.6rem;
		color: #cd804d;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.log-turn-pager {
		font-size: 0.55rem;
		color: #555;
	}

	.log-messages {
		flex: 1;
		overflow-y: auto;
		padding: 0.4rem 0.6rem;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}
	.log-empty {
		color: #555;
		text-align: center;
		font-size: 0.75rem;
		padding: 1rem;
		margin: 0;
	}

	.lrow {
		display: flex;
		font-size: 0.78rem;
		min-height: 1.2rem;
		align-items: center;
	}
	.lrow.center {
		justify-content: center;
	}
	.lrow.lrow-l {
		justify-content: flex-start;
		padding-left: 2px;
	}
	.lrow.lrow-r {
		justify-content: flex-end;
		padding-right: 2px;
	}

	.t-ability {
		font-style: italic;
		color: #888;
		font-size: 0.72rem;
		padding: 2px 4px;
	}
	.t-dmg {
		display: inline-block;
		padding: 3px 8px;
		border-radius: 6px;
		font-size: 0.88rem;
		border: 2px solid #00000040;
	}
	.t-dmg.crit {
		outline: 2px solid #ff4d4d;
		box-shadow: 0 0 8px #ff4d4d66;
	}
	.t-multi {
		color: #666;
		font-size: 0.68rem;
	}
	.t-miss {
		color: #555;
		font-style: italic;
	}
	.t-heal {
		color: #4ade80;
		font-weight: bold;
	}
	.t-buff {
		color: #7edb7e;
	}
	.t-debuff {
		color: #ff6347;
	}
	.t-info {
		color: #6aadcc;
		font-size: 0.7rem;
	}
	.t-poison {
		color: #c060c0;
	}
	.t-stun {
		color: #ffe066;
	}
	.t-system {
		color: #777;
		font-size: 0.7rem;
	}
	.t-defeated {
		color: #ff7070;
		font-weight: bold;
	}

	/* ══ Actions bar ═════════════════════════════════════════════════════════ */
	.actions-bar {
		display: flex;
		align-items: stretch;
		background-color: #2e2e2e;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -6px 0 0px inset;
		border-radius: 18px;
		padding: 0.5rem 0.6rem;
		flex-shrink: 0;
		min-height: 0;
	}
	.actions-inner {
		display: flex;
		flex: 1;
		min-width: 0;
	}
	.resolving {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		color: #666;
		font-size: 0.75rem;
	}
	.spinner {
		width: 16px;
		height: 16px;
		border: 3px solid #333;
		border-top-color: #cd804d;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.final-result {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	.outcome-text {
		font-size: 0.9rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}
	.outcome-text.win {
		color: #4ade80;
	}
	.outcome-text.lose {
		color: #e05252;
	}
	.drops-row {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-wrap: wrap;
	}
	.drops-label {
		font-size: 0.6rem;
		color: #666;
	}
	.drop-slot {
		position: relative;
	}
	.drop-thumb {
		width: 32px;
		height: 32px;
		object-fit: cover;
		border-radius: 8px;
		border: 3px solid #00000056;
		box-shadow: #00000056 0 -2px 0 0px inset;
		image-rendering: pixelated;
	}
	.drop-qty {
		position: absolute;
		bottom: 1px;
		right: 2px;
		font-size: 0.5rem;
		color: #fff;
		background: rgba(0, 0, 0, 0.75);
		padding: 0 2px;
		border-radius: 3px;
	}

	/* ══ Mobile ══════════════════════════════════════════════════════════════ */
	@media (max-width: 700px) {
		.combat-screen {
			padding: 0.4rem;
			gap: 0.4rem;
		}

		.combatants-row {
			/* Stack: player | vs-row | opponent */
			grid-template-columns: 1fr;
			grid-template-rows: auto auto auto;
		}

		.player-panel {
			border-radius: 18px 18px 6px 6px;
		}
		.opponent-panel {
			border-radius: 6px 6px 18px 18px;
		}

		/* VS col becomes a horizontal strip */
		.vs-col {
			flex-direction: row;
			justify-content: center;
			gap: 0.5rem;
			padding: 0.1rem 0;
		}
		/* Make icon buttons horizontal */
		.icon-btn {
			width: auto;
			flex-direction: row;
			padding: 0.3rem 0.6rem 0.45rem;
		}

		.avatar {
			width: 64px;
			height: 64px;
		}
		.stats-grid {
			grid-template-columns: repeat(3, 1fr);
		}
		.nav-btn {
			width: 2rem;
			font-size: 0.85rem;
		}
	}

	@media (max-width: 430px) {
		.avatar {
			width: 52px;
			height: 52px;
		}
		.combatant-panel {
			gap: 0.4rem;
			padding: 0.4rem;
		}
	}
</style>
