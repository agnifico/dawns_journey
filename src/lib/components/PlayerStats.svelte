<script lang="ts">
	import { playerStore, playerStats, playerActiveElements, playerDualWeaponBonus, setPlayerName } from '../stores/playerStore';
	import Stat from './Stat.svelte';
	import StatBar from './ui/StatBar.svelte';
	import AvatarSelector from './AvatarSelector.svelte';
	import Switch from '$lib/components/ui/Switch.svelte';
	import { getXpForLevel as getXpForSkillLevel } from '$lib/services/SkillService';
	import { getXpForLevel, getXpForLevelUp } from '$lib/services/PlayerLevelService';
	import WRHeader from './WRHeader.svelte';
	import HPBar from './HPBar.svelte';
	import Level from './Level.svelte';
	import FactionDisplay from './FactionDisplay.svelte';
	import GearPassive from './GearPassive.svelte';

	let currentView: 'stats' | 'skills' = 'stats';
	function toggleView() { currentView = currentView === 'stats' ? 'skills' : 'stats'; }

	let editingName = false;
	let nameInput = '';
	function startEditing() { nameInput = $playerStore.profile.name ?? ''; editingName = true; }
	function commitName() { if (nameInput.trim()) setPlayerName(nameInput); editingName = false; }
	function onNameKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') commitName();
		if (e.key === 'Escape') editingName = false;
	}
</script>

<div class="player-stats">
	<div class="header">
		<div class="header-left">
			<AvatarSelector />
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
				<HPBar type="hp"   current={$playerStats.hp}         max={$playerStats.maxHp} />
				<HPBar type="aura" current={$playerStats.auraShield} max={$playerStats.maxAuraShield} />
			</div>
			{#if true}
				{@const xpInLevel = $playerStore.xp - getXpForLevel($playerStore.level)}
				{@const xpNeeded  = getXpForLevelUp($playerStore.level)}
				<Level level={$playerStore.level} currentXp={xpInLevel} maxXp={xpNeeded} />
			{/if}
		</div>
	</div>

	<WRHeader value={$playerStore.worldResonance} elements={$playerActiveElements} />

	{#if currentView === 'stats'}
		<div class="stats-grid">
			{#if $playerStats}
				<Stat view="full" statId="hp"               value={`${$playerStats.hp} / ${$playerStats.maxHp}`}    baseValue={$playerStore.baseStats.maxHp} />
				<Stat view="full" statId="maxAuraShield"    value={$playerStats.maxAuraShield}    baseValue={$playerStore.baseStats.maxAuraShield} />
				<Stat view="full" statId="physicalAttack"   value={$playerStats.physicalAttack}   baseValue={$playerStore.baseStats.physicalAttack} />
				<Stat view="full" statId="elementalAttack"  value={$playerStats.elementalAttack}  baseValue={$playerStore.baseStats.elementalAttack} />
				<Stat view="full" statId="physicalDefence"  value={$playerStats.physicalDefence}  baseValue={$playerStore.baseStats.physicalDefence} />
				<Stat view="full" statId="elementalDefence" value={$playerStats.elementalDefence} baseValue={$playerStore.baseStats.elementalDefence} />
				<Stat view="full" statId="critChance"       value={$playerStats.critChance}       baseValue={$playerStore.baseStats.critChance} />
				<Stat view="full" statId="critDamage"       value={$playerStats.critDamage}       baseValue={$playerStore.baseStats.critDamage} />
				<Stat view="full" statId="precision"        value={$playerStats.precision}        baseValue={$playerStore.baseStats.precision} />
				<Stat view="full" statId="speed"            value={$playerStats.speed}            baseValue={$playerStore.baseStats.speed} />
				<Stat view="full" statId="evasion"          value={$playerStats.evasion}          baseValue={$playerStore.baseStats.evasion} />
			{:else}
				<p class="loading">Loading stats...</p>
			{/if}
		</div>

		{#if $playerDualWeaponBonus}
			<div class="loadout-passives">
				<div class="loadout-passives-label">Loadout Passives</div>
				<GearPassive
					weaponName=""
					passiveName={$playerDualWeaponBonus.name}
					description={$playerDualWeaponBonus.description}
				/>
			</div>
		{/if}
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
				<p class="loading">Loading skills...</p>
			{/if}
		</div>

		<FactionDisplay />
	{/if}
</div>

<style>
	.player-stats {
		padding-inline: 1rem;
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
	.name-row { width: 100%; }
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
	.name-display:hover .name-edit-hint { opacity: 1; }
	.name-text { font-family: var(--font-family-pixel); font-size: 0.75rem; color: var(--color-text-primary, #eee); letter-spacing: 0.5px; }
	.name-edit-hint { font-size: 0.65rem; color: rgba(255,255,255,0.35); opacity: 0; transition: opacity 0.15s; }
	.name-input { width: 100%; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.25); border-radius: 4px; color: #eee; font-family: var(--font-family-pixel); font-size: 0.75rem; padding: 3px 6px; text-align: center; outline: none; }
	.stat-bars { display: flex; flex-direction: column; gap: 4px; max-width: 400px; width: 100%; }
	.stats-grid { display: grid; margin-top: 1rem; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); margin-top: 1rem; gap: 0.25rem; }
	.skills-grid { display: flex; flex-direction: column; gap: 0.5rem; }
	.skill-wrap { background-color: rgb(53, 37, 17); display: flex; flex-direction: column; padding: 0.5rem; gap: 0.5rem; border-radius: 6px; border: 3px solid #00000056;}
	.skill-item { font-family: var(--font-family-pixel); font-size: 1rem; display: flex; flex-direction: column; padding: 0.5em; border-radius: 5px; color: var(--orange); gap: 0.25rem; flex-grow: 1; }
	.skill-item-intra { display: flex; align-items: center; }
	.skill-icon { width: 32px; height: 32px; background-color: #2d2d2d; padding: 4px 4px 7px; border-radius: 6px; box-shadow: #00000056 0 -3px 0 0 inset; border: 3px solid #56493d; }
	.skill-info { display: flex; justify-content: space-between; align-items: baseline; }
	.xp-bar { width: 100%; height: 14px; background-color: var(--surface-2); border-radius: 3px; position: relative; border: 1px solid black; }
	.xp-fill { height: 100%; background-color: var(--color-primary); border-radius: 2px; }
	.xp-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 0.6rem; color: rgba(255, 255, 255, 0.8); text-shadow: 1px 1px 0 black; }
	.loading { font-family: var(--font-family-pixel); font-size: 0.7rem; color: var(--text-muted); }
	.loadout-passives { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.4rem; }
	.loadout-passives-label { font-family: var(--font-family-pixel); font-size: 0.75rem; color: var(--orange, #d8a85a); letter-spacing: 0.5px; }
</style>