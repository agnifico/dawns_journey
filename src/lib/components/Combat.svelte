<script lang="ts">
	import { combatStore } from '$lib/stores/combatStore';
	import * as CombatService from '$lib/services/CombatService';
	import StatBar from './ui/StatBar.svelte';
	import { afterUpdate } from 'svelte';
	import { getItemById } from '$lib/services/InventoryService';
	import AbilityMenu from './AbilityMenu.svelte';
	import InfusionMenu from './InfusionMenu.svelte';
	import ElementTag from './ui/ElementTag.svelte';
	import { elementBgs, elementColors } from '$lib/data/statDefinitions';
	import { playerStore } from '$lib/stores/playerStore';
	import type { Combatant, CombatLogMessage } from '$lib/types';
	import type { CombatState } from '$lib/stores/combatStore';

	let logContainer: HTMLDivElement;

	afterUpdate(() => {
		if (logContainer) {
			logContainer.scrollTop = logContainer.scrollHeight;
		}
	});
	function calculateEvasion(defender: Combatant, attackerPrecision: number = 0): number {
		const rawEvasion = defender.evasion || 0;
		const effectiveEvasion = Math.max(0, rawEvasion - attackerPrecision);
		const evasionChance = effectiveEvasion / 100;
		return evasionChance;
	}

	// Returns inline style for elemental/physical coloured damage pills
	function getDamageStyle(
		damageType: 'physical' | 'elemental',
		element: string | undefined
	): string {
		if (damageType === 'elemental' && element) {
			const color = elementColors[element.toLowerCase()];
			const bg = elementBgs[element.toLowerCase()];
			return `background-color:${bg};color:${color};`;
		}
		const color = elementColors['physical'];
		const bg = elementBgs['physical'];
		return `background-color:${bg};color:${color};`;
	}

	// Determine which side of the two-column layout a message belongs to.
	// 'player' actions go left, 'opponent' actions go right, 'none' spans center.
	function isLeft(msg: CombatLogMessage): boolean {
		return 'side' in msg && msg.side === 'player';
	}
	function isRight(msg: CombatLogMessage): boolean {
		return 'side' in msg && msg.side === 'opponent';
	}
</script>

{#if $combatStore.isInCombat && $combatStore.player && $combatStore.opponent}
	<div class="combat-screen">
		<!-- ── Top row: avatars + stat bars ── -->
		<div class="toprow">
			<div class="info-banner player-side">
				<div class="character-info">
					<div class="character-name">{$combatStore.player.name || 'Player'}</div>
					<img class="avatar" src={$playerStore.profile.avatar} alt="Player Avatar" />
				</div>
				<div class="header-right">
					<div class="statbars">
						<StatBar
							current={$combatStore.player.hp}
							max={$combatStore.player.maxHp}
							color="#28a745"
						/>
						{#if $combatStore.player.maxAuraShield > 0}
							<StatBar
								current={$combatStore.player.auraShield}
								max={$combatStore.player.maxAuraShield}
								color="#00BFFF"
							/>
						{/if}
						Elemental Attack: {$combatStore.player.elementalAttack}<br />
						Elemental Defence: {$combatStore.player.elementalDefence}<br />
						Physical Attack: {$combatStore.player.physicalAttack}<br />
						Physical Defence: {$combatStore.player.physicalDefence}<br />
						Speed: {$combatStore.player.speed}<br />
						critChance: {$combatStore.player.critChance}<br />
						critDamage: {$combatStore.player.critDamage}<br />
						Evasion: {$combatStore.player.evasion}<br />
						Precision: {$combatStore.player.precision}<br />
						Effective Evasion: {calculateEvasion(
							$combatStore.player,
							$combatStore.opponent.precision
						)}
					</div>
					<div class="elements-display">
						{#each $combatStore.player.elements as element}
							<ElementTag {element} />
						{/each}
					</div>
					{#if $combatStore.player.statusEffects.length > 0}
						<div class="status-effects">
							{#each $combatStore.player.statusEffects as effect}
								<span
									class="status-pill"
									class:is-buff={!effect.damagePerTurn && !effect.isStunned}
								>
									{effect.name}
									{#if effect.remainingTurns !== undefined}
										<span class="turns">{effect.remainingTurns}</span>
									{/if}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<div class="info-banner opponent-side">
				<div class="character-info">
					<div class="character-name">{$combatStore.opponent.name}</div>
					<img
						class="avatar"
						src={$combatStore.opponent.profileImage}
						alt="{$combatStore.opponent.name} Avatar"
					/>
				</div>
				<div class="header-right">
					<div class="statbars">
						<StatBar
							current={$combatStore.opponent.hp}
							max={$combatStore.opponent.maxHp}
							color="#dc3545"
						/>
						{#if $combatStore.opponent.maxAuraShield > 0}
							<StatBar
								current={$combatStore.opponent.auraShield}
								max={$combatStore.opponent.maxAuraShield}
								color="#00BFFF"
							/>
						{/if}
						Elemental Attack: {$combatStore.opponent.elementalAttack}<br />
						Elemental Defence: {$combatStore.opponent.elementalDefence}<br />
						Physical Attack: {$combatStore.opponent.physicalAttack}<br />
						Physical Defence: {$combatStore.opponent.physicalDefence}<br />
						Evasion: {$combatStore.opponent.evasion}<br />
						Speed: {$combatStore.opponent.speed}<br />
						critChance: {$combatStore.opponent.critChance}<br />
						critDamage: {$combatStore.opponent.critDamage}<br />
						Evasion: {$combatStore.opponent.evasion}<br />
						Precision: {$combatStore.opponent.precision}<br />
						Effective Evasion: {calculateEvasion(
							$combatStore.opponent,
							$combatStore.player.precision
						)}
					</div>
					<div class="elements-display">
						{#each $combatStore.opponent.elements as element}
							<ElementTag {element} />
						{/each}
					</div>
					{#if $combatStore.opponent.statusEffects.length > 0}
						<div class="status-effects">
							{#each $combatStore.opponent.statusEffects as effect}
								<span
									class="status-pill"
									class:is-buff={!effect.damagePerTurn && !effect.isStunned}
								>
									{effect.name}
									{#if effect.remainingTurns !== undefined}
										<span class="turns">{effect.remainingTurns}</span>
									{/if}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- ── Combat log ── -->
		<div class="log-content" bind:this={logContainer}>
			{#each $combatStore.combatLog as msg}
				{#if msg.type === 'turn_banner'}
					<div class="log-row-center turn-banner">— Turn {msg.turn} —</div>
				{:else if msg.type === 'system'}
					<div class="log-row-center system">{msg.text}</div>
				{:else if msg.type === 'defeated'}
					<div class="log-row-center defeated">
						{msg.side === 'player' ? '💀' : '⚔️'}
						{msg.name} has been defeated!
					</div>
				{:else if msg.type === 'ability_use'}
					<div
						class="log-row ability-row"
						class:player-action={isLeft(msg)}
						class:opponent-action={isRight(msg)}
					>
						<div
							class="ability-label"
							class:ability-left={isLeft(msg)}
							class:ability-right={isRight(msg)}
						>
							<span class="ability-name">{msg.abilityName}</span>
						</div>
					</div>
				{:else if msg.type === 'damage'}
					<div class="log-row">
						{#if isLeft(msg)}
							<div class="log-left">
								<span
									class="damage-pill"
									class:crit={msg.isCritical}
									style={getDamageStyle(msg.damageType, msg.element)}
								>
									{msg.isCritical ? '★ CRIT ' : ''}{msg.amount}
									{#if msg.hitIndex}#{msg.hitIndex}{/if}
								</span>
							</div>
							<div class="log-right"></div>
						{:else}
							<div class="log-left"></div>
							<div class="log-right">
								<span
									class="damage-pill"
									class:crit={msg.isCritical}
									style={getDamageStyle(msg.damageType, msg.element)}
								>
									{msg.isCritical ? '★ CRIT ' : ''}{msg.amount}
									{#if msg.hitIndex}#{msg.hitIndex}{/if}
								</span>
							</div>
						{/if}
					</div>
				{:else if msg.type === 'multi_hit_summary'}
					<div class="log-row">
						{#if isLeft(msg)}
							<div class="log-left">
								<span class="multi-summary"
									>{msg.hitCount}/{msg.totalHits} hits · {msg.totalDamage} total</span
								>
							</div>
							<div class="log-right"></div>
						{:else}
							<div class="log-left"></div>
							<div class="log-right">
								<span class="multi-summary"
									>{msg.hitCount}/{msg.totalHits} hits · {msg.totalDamage} total</span
								>
							</div>
						{/if}
					</div>
				{:else if msg.type === 'miss'}
					<div class="log-row">
						{#if isLeft(msg)}
							<div class="log-left">
								<span class="miss"
									>{msg.reason === 'dodge' ? `${msg.defenderName} dodged!` : 'Missed!'}</span
								>
							</div>
							<div class="log-right"></div>
						{:else}
							<div class="log-left"></div>
							<div class="log-right">
								<span class="miss"
									>{msg.reason === 'dodge' ? `${msg.defenderName} dodged!` : 'Missed!'}</span
								>
							</div>
						{/if}
					</div>
				{:else if msg.type === 'heal'}
					<div class="log-row">
						{#if isLeft(msg)}
							<div class="log-left">
								<span class="heal">+{msg.amount} {msg.healType === 'hp' ? 'HP' : 'Aura'}</span>
							</div>
							<div class="log-right"></div>
						{:else}
							<div class="log-left"></div>
							<div class="log-right">
								<span class="heal">+{msg.amount} {msg.healType === 'hp' ? 'HP' : 'Aura'}</span>
							</div>
						{/if}
					</div>
				{:else if msg.type === 'status_apply'}
					<div class="log-row">
						{#if isLeft(msg)}
							<div class="log-left">
								<span class={msg.isBuff ? 'buff' : 'debuff'}
									>{msg.targetName}: {msg.statusName}</span
								>
							</div>
							<div class="log-right"></div>
						{:else}
							<div class="log-left"></div>
							<div class="log-right">
								<span class={msg.isBuff ? 'buff' : 'debuff'}
									>{msg.targetName}: {msg.statusName}</span
								>
							</div>
						{/if}
					</div>
				{:else if msg.type === 'status_tick'}
					<div class="log-row">
						{#if isLeft(msg)}
							<div class="log-left">
								<span class="status-tick">☠ {msg.statusName} −{msg.amount}</span>
							</div>
							<div class="log-right"></div>
						{:else}
							<div class="log-left"></div>
							<div class="log-right">
								<span class="status-tick">☠ {msg.statusName} −{msg.amount}</span>
							</div>
						{/if}
					</div>
				{:else if msg.type === 'status_expire'}
					<div class="log-row">
						{#if isLeft(msg)}
							<div class="log-left"><span class="info">{msg.statusName} wore off</span></div>
							<div class="log-right"></div>
						{:else}
							<div class="log-left"></div>
							<div class="log-right"><span class="info">{msg.statusName} wore off</span></div>
						{/if}
					</div>
				{:else if msg.type === 'stat_change'}
					<!-- Render on the TARGET's side, not the actor's side -->
					<div class="log-row">
						{#if msg.targetSide === 'player'}
							<div class="log-left">
								<span class={msg.direction === 'up' ? 'buff' : 'debuff'}>
									{msg.direction === 'up' ? '▲' : '▼'}
									{msg.targetName}: {msg.stats.join(', ')}
								</span>
							</div>
							<div class="log-right"></div>
						{:else}
							<div class="log-left"></div>
							<div class="log-right">
								<span class={msg.direction === 'up' ? 'buff' : 'debuff'}>
									{msg.direction === 'up' ? '▲' : '▼'}
									{msg.targetName}: {msg.stats.join(', ')}
								</span>
							</div>
						{/if}
					</div>
				{:else if msg.type === 'stat_transfer'}
					<div class="log-row-center buff">
						⇄ {msg.actorName}: {msg.description}{msg.suppressed ? ' (no reduction)' : ''}
					</div>
				{:else if msg.type === 'stun'}
					<div class="log-row">
						{#if isLeft(msg)}
							<div class="log-left"><span class="stun">⚡ {msg.actorName} is stunned!</span></div>
							<div class="log-right"></div>
						{:else}
							<div class="log-left"></div>
							<div class="log-right"><span class="stun">⚡ {msg.actorName} is stunned!</span></div>
						{/if}
					</div>
				{:else if msg.type === 'immune'}
					<div class="log-row">
						{#if isLeft(msg)}
							<div class="log-left">
								<span class="buff">🛡 {msg.targetName}: immune to {msg.what}</span>
							</div>
							<div class="log-right"></div>
						{:else}
							<div class="log-left"></div>
							<div class="log-right">
								<span class="buff">🛡 {msg.targetName}: immune to {msg.what}</span>
							</div>
						{/if}
					</div>
				{/if}
			{/each}
		</div>

		<!-- ── Actions ── -->
		<div class="combat-actions">
			{#if !$combatStore.combatEnded}
				{#if $combatStore.turnPhase === 'player_selecting'}
					<AbilityMenu />
					<InfusionMenu />
				{:else}
					<div class="resolving-indicator">
						{#if $combatStore.turnPhase === 'resolving'}
							<p>Resolving...</p>
							<div class="spinner"></div>
						{/if}
					</div>
				{/if}
			{:else}
				<div class="final-result">
					{#if $combatStore.outcome === 'win'}
						<h2>You are victorious!</h2>
						{#if $combatStore.drops && $combatStore.drops.length > 0}
							<div class="drops-log">
								<span>Drops:</span>
								<div class="drops-grid">
									{#each $combatStore.drops as drop}
										{@const item = getItemById(drop.itemId)}
										{#if item}
											<div class="drop-item-slot">
												<img
													src={item.image}
													alt={item.name}
													class="drop-item-thumbnail"
													title={item.name}
												/>
												{#if drop.quantity > 1}
													<span class="drop-item-quantity">x{drop.quantity}</span>
												{/if}
											</div>
										{/if}
									{/each}
								</div>
							</div>
						{/if}
					{:else}
						<h2>You were defeated!</h2>
					{/if}
				</div>
			{/if}

			<button class="close-button" on:click={CombatService.forceEndCombat}>Close</button>
		</div>
	</div>
{/if}

<style>
	.combat-screen {
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: #2a2a2a;
		padding: 20px;
		box-sizing: border-box;
		position: relative;
		width: 100%;
	}
	h2 {
		text-align: center;
	}

	/* ── Top row ── */
	.toprow {
		display: flex;
		justify-content: space-between;
		margin-bottom: 15px;
		gap: 1rem;
		flex-shrink: 0;
	}
	.info-banner {
		flex: 1;
		display: flex;
		flex-direction: row-reverse;
		background-color: #333;
		border-radius: 8px;
		gap: 1rem;
	}
	.info-banner.opponent-side {
		flex-direction: row;
	}
	.header-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}
	.info-banner.opponent-side .header-right {
		align-items: flex-start;
	}
	.character-info {
		display: flex;
		flex-direction: column-reverse;
		align-items: center;
		gap: 10px;
		margin-bottom: 5px;
	}
	.character-name {
		margin-bottom: 5px;
		color: #eee;
		font-family: var(--font-family-pixel);
		font-weight: 600;
	}
	.statbars {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.avatar {
		height: 100px;
		width: 100px;
		object-fit: cover;
		image-rendering: auto;
	}
	.elements-display {
		display: flex;
		gap: 5px;
		margin-top: 5px;
	}
	.info-banner.opponent-side .elements-display {
		flex-direction: row-reverse;
	}

	/* ── Log area ── */
	.log-content {
		flex-grow: 1;
		overflow-y: auto;
		background-color: #1a1a1a;
		border: 1px solid #444;
		padding: 8px;
		margin-bottom: 15px;
		font-family: monospace;
		font-size: 0.82rem;
		color: #eee;
		border-radius: 4px;
		min-height: 0;
	}

	/* Row layouts */
	.log-row {
		display: flex;
		gap: 4px;
		margin: 1px 0;
		min-height: 20px;
	}
	.log-left,
	.log-right {
		flex: 1;
		padding: 2px 6px;
		border-radius: 3px;
		display: flex;
		align-items: center;
	}
	.log-left {
		justify-content: flex-start;
	}
	.log-right {
		justify-content: flex-end;
	}

	/* Center rows */
	.log-row-center {
		text-align: center;
		padding: 4px 8px;
		border-radius: 4px;
		margin: 4px 0;
		font-weight: bold;
	}
	.turn-banner {
		background-color: #2e2e2e;
		color: #777;
		font-size: 0.75rem;
		border-top: 1px solid #333;
		margin-top: 6px;
	}
	.system {
		background-color: #3a3a3a;
		color: #ccc;
		border-bottom: 1px solid #555;
		margin-bottom: 6px;
	}
	.defeated {
		background-color: #4a1a1a;
		color: #ff8080;
		font-size: 1rem;
		padding: 8px;
	}

	/* Ability announcement row */
	.ability-row {
		margin: 3px 0;
	}
	.ability-label {
		flex: 1;
		padding: 3px 8px;
	}
	.ability-left {
		text-align: left;
	}
	.ability-right {
		text-align: right;
	}
	.ability-name {
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.8rem;
		color: #bbb;
		letter-spacing: 0.03em;
	}

	/* Inline pills / spans */
	.damage-pill {
		display: inline-block;
		padding: 1px 7px;
		border-radius: 4px;
		font-weight: bold;
		font-size: 0.95rem;
		letter-spacing: 0.02em;
	}
	.damage-pill.crit {
		outline: 2px solid #ff4d4d;
		box-shadow: 0 0 6px #ff4d4d88;
	}
	.multi-summary {
		color: #aaa;
		font-size: 0.78rem;
	}
	.miss {
		color: #888;
		font-style: italic;
	}
	.heal {
		color: #5dbb63;
		font-weight: bold;
	}
	.buff {
		color: #90ee90;
	}
	.debuff {
		color: #ff6347;
	}
	.info {
		color: #add8e6;
		font-size: 0.8rem;
	}
	.status-tick {
		color: #c060c0;
	}
	.stun {
		color: #ffe066;
	}

	/* ── Status effects panel ── */
	.status-effects {
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
		margin-top: 4px;
	}
	.status-pill {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		padding: 1px 5px;
		border-radius: 3px;
		background: #5a1a1a;
		color: #ff9090;
		font-family: var(--font-family-pixel, monospace);
		font-size: 0.6rem;
		border: 1px solid #8b3333;
	}
	.status-pill.is-buff {
		background: #1a3a1a;
		color: #90ff90;
		border-color: #338b33;
	}
	.status-pill .turns {
		background: rgba(0, 0, 0, 0.3);
		padding: 0 3px;
		border-radius: 2px;
		color: #ccc;
		font-size: 0.55rem;
	}
	/* ── Actions bar ── */
	.combat-actions {
		width: 100%;
		display: flex;
		justify-content: space-around;
		border: 1px solid white;
	}
	.resolving-indicator {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem;
		color: #eee;
		font-family: 'Silkscreen', sans-serif;
	}
	.close-button {
		width: fit-content;
		padding: 0.5rem;
		margin: auto;
		font-family: 'Silkscreen', sans-serif;
		background-color: #af4c4c;
		color: white;
		border: 2px solid #8e3838;
		border-radius: 5px;
		cursor: pointer;
		&:hover {
			transform: translateY(-3px);
			background-color: #d35f5f;
		}
	}
	.spinner {
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-top: 4px solid #eee;
		border-radius: 50%;
		width: 20px;
		height: 20px;
		animation: spin 1s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
