<script lang="ts">
    import { playerStore, playerStats, playerMastery, playerActiveElements } from "../stores/playerStore";
    import * as ItemService from "$lib/services/ItemService";
    import ItemBox from "./ItemBox.svelte";
    import Stat from "./Stat.svelte";
    import StatBar from "./ui/StatBar.svelte";
    import "./ui/pixel-art-ui.css";

    $: coherenceActive = 
        $playerStore.equipment.weapon_slots[0] && 
        $playerStore.equipment.weapon_slots[1] && 
        $playerStore.equipment.weapon_slots[0].element === $playerStore.equipment.weapon_slots[1].element;

</script>

<div class="player-stats pixel-art-box">
    <h2>Player Stats</h2>

    <div class="top-bars">
        <StatBar current={$playerStats.hp} max={$playerStats.maxHp} color="#61b753" />
        <StatBar current={$playerStats.auraShield} max={$playerStats.maxAuraShield} color="#3b82f6" />
    </div>

    <div class="stats-grid">
        {#if $playerStats}
            <div class="stats-column">
                <Stat statId="hp" value={`${$playerStats.hp} / ${$playerStats.maxHp}`} />
                <Stat statId="auraShield" value={$playerStats.auraShield} />
                <Stat statId="speed" value={$playerStats.speed} />
                <Stat statId="evasion" value={$playerStats.evasion} />
            </div>
            <div class="stats-column">
                <Stat statId="physicalAttack" value={$playerStats.physicalAttack} />
                <Stat statId="physicalDefence" value={$playerStats.physicalDefence} />
                <Stat statId="elementalAttack" value={$playerStats.elementalAttack} />
                <Stat statId="elementalDefence" value={$playerStats.elementalDefence} />
            </div>
            <div class="stats-column">
                <Stat statId="critChance" value={`${($playerStats.critChance * 100).toFixed(0)}%`} />
                <Stat statId="critDamage" value={`${($playerStats.critDamage * 100).toFixed(0)}%`} />
            </div>
        {:else}
            <p>Loading stats...</p>
        {/if}
    </div>

    <div class="mastery-section">
        <Stat statId="mastery" value={$playerMastery} />
        <div class="active-elements">
            {#if $playerActiveElements.length > 0}
                {#each $playerActiveElements as element}
                    <img src={`/images/${element.toLowerCase()}.png`} alt={element} class="element-icon" title={element} />
                {/each}
            {:else}
                <span class="element-tag">None</span>
            {/if}
        </div>
    </div>

    {#if coherenceActive}
        <div class="coherence-buff">
            <img src="/game_icons/coherence.png" alt="Coherence Buff" title="Coherence Buff" />
            <span>Coherence: +30% Elemental Attack</span>
        </div>
    {/if}

    <div class="equipment">
        <div class="weapon-slots">
            {#each $playerStore.equipment.weapon_slots as item, i}
                <div class="equipment-slot weapon-slot">
                    {#if item}
                        <ItemBox item={item} viewSize="large" base="" />
                        <button class="pixel-art-button unequip-button" on:click={() => ItemService.unequipItem('weapon_slots', i)}>-</button>
                    {:else}
                        <div class="empty-slot large-empty-slot" style="background-image: url('/game_icons/bgsq1.png');">
                            <span class="slot-label">Weapon {i + 1}</span>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>

        <div class="relic-slots">
            {#each $playerStore.equipment.relic_slots as item, i}
                <div class="equipment-slot relic-slot">
                    {#if item}
                        <ItemBox item={item} viewSize="medium" base="" />
                        <button class="pixel-art-button unequip-button" on:click={() => ItemService.unequipItem('relic_slots', i)}>-</button>
                    {:else}
                        <div class="empty-slot medium-empty-slot" style="background-image: url('/game_icons/bgsq1.png');">
                            <span class="slot-label">Relic {i + 1}</span>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </div>

    <h2>Skills</h2>
    <div class="skills">
        {#if $playerStore.skills}
            {#each $playerStore.skills as skill}
                <div class="skill">
                    <span class="name">{skill.name}</span>
                    <span class="value">{skill.level}</span>
                </div>
            {/each}
        {:else}
            <p>Loading skills...</p>
        {/if}
    </div>
</div>

<style>
    .player-stats {
        min-width: 400px;
        padding: 1em;
        margin-bottom: 1em;
        margin-inline: auto;
        background-color: #2a2a2a;
        max-height: calc(100vh - 100px);
        overflow-y: auto;
    }
    .top-bars {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 1em;
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
    .mastery-section {
        margin-top: 1em;
        padding-top: 1em;
        border-top: 1px solid #444;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .coherence-buff {
        display: flex;
        align-items: center;
        gap: 0.5em;
        background-color: #1a3a3a;
        color: #a6f0f0;
        padding: 0.5em;
        border-radius: 5px;
        margin-top: 1em;
        border: 1px solid #39cccc;
    }
    .coherence-buff img {
        width: 24px;
        height: 24px;
    }
    .active-elements {
        display: flex;
        gap: 8px;
    }
    .element-icon {
        width: 24px;
        height: 24px;
    }
    .equipment {
        margin-top: 1em;
        display: flex;
        flex-direction: column;
    }

    .weapon-slots, .relic-slots {
        display: flex;
        width: 240px;
        justify-content: flex-start;
        margin: 0 auto;
    }

    .equipment-slot {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .weapon-slot {
        width: 120px;
        height: 120px;
    }

    .relic-slot {
        width: 60px;
        height: 60px;
    }

    .empty-slot {
        background-size: cover;
        background-position: center;
        image-rendering: pixelated;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #aaa;
        font-size: 0.8em;
        text-align: center;
    }

    .large-empty-slot {
        width: 80px;
        height: 80px;
    }

    .medium-empty-slot {
        width: 40px;
        height: 40px;
    }

    .slot-label {
        position: absolute;
        bottom: 2px;
        font-size: 0.6em;
        color: #eee;
        text-shadow: 1px 1px 2px black;
    }

    .unequip-button {
        position: absolute;
        bottom: 2px;
        right: 2px;
        padding: 2px 4px;
        font-size: 0.6em;
        line-height: 1;
        background-color: #a00;
        color: white;
        cursor: pointer;
        z-index: 10;
    }
    .skill {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>