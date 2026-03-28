<script lang="ts">
	import { playerStore, playerStats, playerActiveElements, setPlayerName } from '../stores/playerStore';
	import Stat from './Stat.svelte';
	import StatBar from './ui/StatBar.svelte';
	import AvatarSelector from './AvatarSelector.svelte';
	import Switch from '$lib/components/ui/Switch.svelte';
	import { getXpForLevel as getXpForSkillLevel } from '$lib/services/SkillService';
	import { getXpForLevel, getXpForLevelUp } from '$lib/services/PlayerLevelService';
	import WRHeader from './WRHeader.svelte';
	import HPBar from './HPBar.svelte';
	import Level from './Level.svelte';

	let currentView: 'stats' | 'skills' = 'stats';
	function toggleView() {
		currentView = currentView === 'stats' ? 'skills' : 'stats';
	}

	// Name editing
	let editingName = false;
	let nameInput = '';

	function startEditing() {
		nameInput = $playerStore.profile.name ?? '';
		editingName = true;
	}

	function commitName() {
		if (nameInput.trim()) setPlayerName(nameInput);
		editingName = false;
	}

	function onNameKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') commitName();
		if (e.key === 'Escape') editingName = false;
	}
</script>

<div class="player-stats">
	<div class="header">
		<div class="header-left">
			<AvatarSelector />

			<!-- Name display / edit -->
			<div class="name-row">
				{#if editingName}
					<!-- svelte-ignore a11y_autofocus -->
					<input
						class="name-input"
						bind:value={nameInput}
						on:blur={commitName}
						on:keydown={onNameKeydown}
						maxlength="24"
						autofocus
					/>
				{:else}
					<button class="name-display" on:click={startEditing} title="Click to rename">
						<span class="name-text">{$playerStore.profile.name || 'Traveller'}</span>
						<span class="name-edit-hint">✎</span>
					</button>
				{/if}
			</div>
		</div>

		<div class="header-right">
			<Switch text1="Stats" text2="Skills" fn={toggleView} />
			<div class="stat-bars">
				<HPBar type="hp" current={$playerStats.hp} max={$playerStats.maxHp} />
				<HPBar type="aura" current={$playerStats.auraShield} max={$playerStats.maxAuraShield} />
			</div>
			{#if true}
				{@const xpInLevel = $playerStore.xp - getXpForLevel($playerStore.level)}
				{@const xpNeeded = getXpForLevelUp($playerStore.level)}
				<Level level={$playerStore.level} currentXp={xpInLevel} maxXp={xpNeeded} />
			{/if}
		</div>
	</div>

	<WRHeader value={$playerStore.worldResonance} elements={$playerActiveElements} />

	{#if currentView === 'stats'}
		<div class="stats-grid">
			{#if $playerStats}
				<Stat view="short" statId="hp"              value={`${$playerStats.hp} / ${$playerStats.maxHp}`}  baseValue={$playerStore.baseStats.maxHp} />
				<Stat view="short" statId="physicalAttack"  value={$playerStats.physicalAttack}   baseValue={$playerStore.baseStats.physicalAttack} />
				<Stat view="short" statId="elementalAttack" value={$playerStats.elementalAttack}  baseValue={$playerStore.baseStats.elementalAttack} />
				<Stat view="short" statId="physicalDefence" value={$playerStats.physicalDefence}  baseValue={$playerStore.baseStats.physicalDefence} />
				<Stat view="short" statId="elementalDefence" value={$playerStats.elementalDefence} baseValue={$playerStore.baseStats.elementalDefence} />
				<Stat view="short" statId="maxAuraShield"   value={$playerStats.maxAuraShield}    baseValue={$playerStore.baseStats.maxAuraShield} />
				<Stat view="short" statId="critChance"      value={$playerStats.critChance}       baseValue={$playerStore.baseStats.critChance} />
				<Stat view="short" statId="critDamage"      value={$playerStats.critDamage}       baseValue={$playerStore.baseStats.critDamage} />
				<Stat view="short" statId="precision"       value={$playerStats.precision}        baseValue={$playerStore.baseStats.precision} />
				<Stat view="short" statId="speed"           value={$playerStats.speed}            baseValue={$playerStore.baseStats.speed} />
				<Stat view="short" statId="evasion"         value={$playerStats.evasion}          baseValue={$playerStore.baseStats.evasion} />
			{:else}
				<p>Loading stats...</p>
			{/if}
		</div>
	{:else}
		<div class="skills-grid">
			{#if $playerStore.skills}
				{#each $playerStore.skills as skill}
					<div class="skill-wrap">
						<div class="skill-item-intra">
							<img class="skill-icon" src="/game_icons/{skill.name.toLowerCase()}.png" alt="" />
							<div class="skill-item">
								<div class="skill-info">
									<span class="name">{skill.name}</span>
									<span class="level">Lv. {skill.level}</span>
								</div>
								<div class="xp-bar">
									<div class="xp-fill" style="width: {Math.min(100, (skill.experience / getXpForSkillLevel(skill.id, skill.level)) * 100)}%;"></div>
									<div class="xp-text">{skill.experience} / {getXpForSkillLevel(skill.id, skill.level)}</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			{:else}
				<p>Loading skills...</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.player-stats {
		padding: 1rem;
		padding-bottom: 2rem;
		position: relative;
		border-radius: 12px;
	}
	.header {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		height: fit-content;
		gap: 1rem;
	}
	.header-left {
		flex-shrink: 0;
		width: fit-content;
		max-width: 180px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
	}
	.header-right {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-end;
		gap: 0.5rem;
	}

	/* ── Name field ── */
	.name-row {
		width: 100%;
	}
	.name-display {
		display: flex;
		align-items: center;
		gap: 4px;
		background: none;
		border: none;
		border-bottom: 1px dashed rgba(255,255,255,0.2);
		padding: 2px 4px;
		cursor: pointer;
		width: 100%;
		justify-content: center;
	}
	.name-display:hover .name-edit-hint {
		opacity: 1;
	}
	.name-text {
		font-family: var(--font-family-pixel);
		font-size: 0.75rem;
		color: var(--color-text-primary, #eee);
		letter-spacing: 0.5px;
	}
	.name-edit-hint {
		font-size: 0.65rem;
		color: rgba(255,255,255,0.35);
		opacity: 0;
		transition: opacity 0.15s;
	}
	.name-input {
		width: 100%;
		background: rgba(255,255,255,0.08);
		border: 1px solid rgba(255,255,255,0.25);
		border-radius: 4px;
		color: #eee;
		font-family: var(--font-family-pixel);
		font-size: 0.75rem;
		padding: 3px 6px;
		text-align: center;
		outline: none;
	}
	.name-input:focus {
		border-color: var(--color-primary, #aaa);
	}

	/* ── Rest unchanged ── */
	.stat-bars { display: flex; flex-direction: column; gap: 4px; max-width: 200px; width: 100%; }
	.stats-grid { display: grid; margin-top: 1rem; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem; }
	.skills-grid { display: flex; flex-direction: column; gap: 0.75em; }
	.skill-wrap { background-color: #3a3a3a; display: flex; flex-direction: column; padding: 0.5rem; gap: 0.5rem; border-radius: 6px; }
	.skill-item { font-family: var(--font-family-pixel); font-size: 1rem; display: flex; flex-direction: column; background-color: var(--color-surface-3); padding: 0.5em; border-radius: 5px; color: var(--orange); gap: 0.25rem; flex-grow: 1; }
	.skill-item-intra { display: flex; align-items: center; }
	.skill-icon { width: 32px; height: 32px; background-color: #a28269; padding: 4px 4px 7px; border-radius: 6px; box-shadow: #00000056 0 -3px 0 0 inset; border: 3px solid #3a3a3a; }
	.skill-info { display: flex; justify-content: space-between; align-items: baseline; }
	.xp-bar { width: 100%; height: 14px; background-color: var(--surface-1); border-radius: 3px; position: relative; border: 1px solid black; }
	.xp-fill { height: 100%; background-color: var(--color-primary); border-radius: 2px; }
	.xp-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.6rem; color: white; text-shadow: 1px 1px 0 black; }
</style>