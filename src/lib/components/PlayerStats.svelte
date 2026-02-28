<script lang="ts">
	import { playerStore, playerStats } from '../stores/playerStore';
	import Stat from './Stat.svelte';
	import StatBar from './ui/StatBar.svelte';
	import AvatarSelector from './AvatarSelector.svelte';
	import Switch from '$lib/components/ui/Switch.svelte';
	import { getXpForLevel as getXpForSkillLevel } from '$lib/services/SkillService';
	import { getXpForLevel, getXpForLevelUp } from '$lib/services/PlayerLevelService';

	let currentView: 'stats' | 'skills' = 'stats';

	function toggleView() {
		currentView = currentView === 'stats' ? 'skills' : 'stats';
	}
</script>

<div class="player-stats">
	<div class="header">
		<div class="header-left">
			<AvatarSelector />
		</div>
		<div class="header-right">
			<Switch text1="Combat Stats" text2="Trade Skills" fn={toggleView} />
			<div class="stat-bars">
				<StatBar current={$playerStats.hp} max={$playerStats.maxHp} color="#6a994e" />
				<StatBar
					current={$playerStats.auraShield}
					max={$playerStats.maxAuraShield}
					color="#a98467"
				/>
			</div>
		</div>
	</div>

	{#if currentView === 'stats'}
		<div class="stats-grid">
			{#if $playerStats}
				{@const xpInLevel = $playerStore.xp - getXpForLevel($playerStore.level)}
				{@const xpNeeded = getXpForLevelUp($playerStore.level)}
				<div class="skill-item" style="grid-column: 1 / -1;">
					<div class="skill-info">
						<span class="name">Level</span>
						<span class="level">Lv. {$playerStore.level}</span>
					</div>
					{#if xpNeeded !== null}
						<div class="xp-bar">
							<div
								class="xp-fill"
								style="width: {Math.min(100, (xpInLevel / xpNeeded) * 100)}%;"
							></div>
							<div class="xp-text">{xpInLevel} / {xpNeeded}</div>
						</div>
					{:else}
						<div class="xp-bar">
							<div class="xp-fill" style="width: 100%;"></div>
							<div class="xp-text">Max Level</div>
						</div>
					{/if}
				</div>
				<div class="stats-column">
					<Stat
						view="full"
						statId="hp"
						value={`${$playerStats.hp} / ${$playerStats.maxHp}`}
						baseValue={$playerStore.baseStats.maxHp}
					/>
					<Stat
						view="full"
						statId="physicalAttack"
						value={$playerStats.physicalAttack}
						baseValue={$playerStore.baseStats.physicalAttack}
					/>
					<Stat
						view="full"
						statId="elementalAttack"
						value={$playerStats.elementalAttack}
						baseValue={$playerStore.baseStats.elementalAttack}
					/>
					<Stat
						view="full"
						statId="critChance"
						value={$playerStats.critChance}
						baseValue={$playerStore.baseStats.critChance}
					/>
					<Stat
						view="full"
						statId="precision"
						value={$playerStats.precision}
						baseValue={$playerStore.baseStats.precision}
					/>
					<Stat
					view="full"
					statId="speed"
					value={$playerStats.speed}
					baseValue={$playerStore.baseStats.speed}
				/>
				</div>
				<div class="stats-column">
					<Stat
						view="full"
						statId="auraShield"
						value={$playerStats.auraShield}
						baseValue={$playerStore.baseStats.maxAuraShield}
					/>

					<Stat
						view="full"
						statId="physicalDefence"
						value={$playerStats.physicalDefence}
						baseValue={$playerStore.baseStats.physicalDefence}
					/>
					<Stat
						view="full"
						statId="elementalDefence"
						value={$playerStats.elementalDefence}
						baseValue={$playerStore.baseStats.elementalDefence}
					/>
					<Stat
						view="full"
						statId="critDamage"
						value={$playerStats.critDamage}
						baseValue={$playerStore.baseStats.critDamage}
					/>
					<Stat
					view="full"
					statId="evasion"
					value={$playerStats.evasion}
					baseValue={$playerStore.baseStats.evasion}
				/>
				</div>
			{:else}
				<p>Loading stats...</p>
			{/if}
		</div>
	{:else}
		<div class="skills-grid">
			{#if $playerStore.skills}
				{#each $playerStore.skills as skill}
					<div class="skill-item">
						<div class="skill-info">
							<span class="name">{skill.name}</span>
							<span class="level">Lv. {skill.level}</span>
						</div>
						<div class="xp-bar">
							<div
								class="xp-fill"
								style="width: {Math.min(
									100,
									(skill.experience / getXpForSkillLevel(skill.id, skill.level)) * 100
								)}%;"
							></div>
							<div class="xp-text">
								{skill.experience} / {getXpForSkillLevel(skill.id, skill.level)}
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
	h2 {
		font-family: 'DePixel';
		font-size: 1rem;
		color: var(--text-header);
		text-align: left;
		width: 100%;
		padding-left: 1rem;
	}
	.player-stats {
		padding: 1rem;
		padding-bottom: 2rem;
		background-color: var(--surface-2);
		position: relative;
		border-radius: 12px;
		box-shadow: #00000056 0 -6px 0 6px inset;
		border-top: 3px solid #00000056;
		/* height: 100%; */
	}
	.header {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1em;
		height: fit-content;
	}
	.header-left {
	}
	.header-right {
		flex-grow: 1;
		/* border: 1px solid white; */
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-end;
		gap: 1rem;
	}
	.toggle-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
	}
	.toggle-button img {
		width: 24px;
		height: 24px;
	}
	.stat-bars {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: 1em;
		max-width: 200px;
	}
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1em;
	}
	.stats-column {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}
	.skills-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75em;
	}
	.skill-item {
		font-family: var(--font-family-pixel);
		font-size: 0.75rem;
		display: flex;
		flex-direction: column;
		background-color: var(--color-surface-3);
		padding: 0.5em;
		border-radius: 5px;
		color: var(--color-text-primary);
		gap: 0.25rem;
	}
	.skill-info {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}
	.xp-bar {
		width: 100%;
		height: 14px;
		background-color: var(--surface-1);
		border-radius: 3px;
		position: relative;
		border: 1px solid black;
	}
	.xp-fill {
		height: 100%;
		background-color: var(--color-primary);
		border-radius: 2px;
	}
	.xp-text {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 0.6rem;
		color: white;
		text-shadow: 1px 1px 0 black;
	}
</style>
