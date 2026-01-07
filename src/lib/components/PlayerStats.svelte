<script lang="ts">
    import { playerStore, playerStats } from "../stores/playerStore";
    import Stat from "./Stat.svelte";
    import StatBar from "./ui/StatBar.svelte";

    let currentView: 'stats' | 'skills' = 'stats';

    function toggleView() {
        currentView = currentView === 'stats' ? 'skills' : 'stats';
    }
</script>

<div class="player-stats">
    <div class="header">
        <button class="toggle-button" on:click={toggleView}>
            <img src="/game_icons/cycle.png" alt="Toggle View" />
        </button>
        <h2>{currentView === 'stats' ? 'Player Stats' : 'Player Skills'}</h2>
    </div>

    <div class="stat-bars">
        <StatBar current={$playerStats.hp} max={$playerStats.maxHp} color="#6a994e" />
        <StatBar current={$playerStats.auraShield} max={$playerStats.maxAuraShield} color="#a98467"/>
    </div>

    {#if currentView === 'stats'}
        <div class="stats-grid">
            {#if $playerStats}
                <div class="stats-column">
                    <Stat statId="hp" value={`${$playerStats.hp} / ${$playerStats.maxHp}`} baseValue={$playerStore.baseStats.maxHp} />
                    <Stat statId="auraShield" value={$playerStats.auraShield} baseValue={$playerStore.baseStats.maxAuraShield} />
                    <Stat statId="speed" value={$playerStats.speed} baseValue={$playerStore.baseStats.speed} />
                    <Stat statId="evasion" value={$playerStats.evasion} baseValue={$playerStore.baseStats.evasion} />
                </div>
                <div class="stats-column">
                    <Stat statId="physicalAttack" value={$playerStats.physicalAttack} baseValue={$playerStore.baseStats.physicalAttack} />
                    <Stat statId="physicalDefence" value={$playerStats.physicalDefence} baseValue={$playerStore.baseStats.physicalDefence} />
                    <Stat statId="elementalAttack" value={$playerStats.elementalAttack} baseValue={$playerStore.baseStats.elementalAttack} />
                    <Stat statId="elementalDefence" value={$playerStats.elementalDefence} baseValue={$playerStore.baseStats.elementalDefence} />
                </div>
                <div class="stats-column">
                    <Stat statId="critChance" value={$playerStats.critChance} baseValue={$playerStore.baseStats.critChance} />
                    <Stat statId="critDamage" value={$playerStats.critDamage} baseValue={$playerStore.baseStats.critDamage} />
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
                        <span class="name">{skill.name}</span>
                        <span class="value">{skill.level}</span>
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
        font-family: "DePixel";
        font-size: 1rem;
        color: var(--text-header);
        text-align: left;
        width: 100%;
        padding-left: 1rem;
    }
    .player-stats {
        padding: 1em;
        background-color: var(--color-surface-2);
        position: relative;
        padding-bottom: 2rem;
        border-radius: 12px;
        box-shadow: #00000056 0 -6px 0 6px inset;
        border-top: 3px solid #00000056;
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1em;
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
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1em;
    }
    .stats-column {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
    }
    .skills-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5em 1em;
    }
    .skill-item {
        font-family: var(--font-family-pixel);
        font-size: .75rem;
        display: flex;
        justify-content: space-between;
        background-color: var(--color-secondary);
        padding: 0.5em;
        border-radius: 5px;
        color: var(--color-surface-1);
    }
</style>