<script lang="ts">
    import { goto } from '$app/navigation';
    import * as SaveLoadService from '$lib/services/SaveLoadService';
    import TimeDisplay from './ui/TimeDisplay.svelte';
    import { playerStats } from '$lib/stores/playerStore';
    import StatBar from './ui/StatBar.svelte';
</script>

<nav class="navbar">
    <div class="navbar-left">
        <a href="/" class="brand">Dawn's Journey</a>
        <div class="nav-stat-bars">
            <StatBar current={$playerStats.hp} max={$playerStats.maxHp} color="#6a994e" />
            <StatBar current={$playerStats.auraShield} max={$playerStats.maxAuraShield} color="#a98467" />
        </div>
    </div>
    <div class="navbar-right">
        <!-- Page Links -->
        <button class="icon-button" on:click={() => goto('/map')} title="Map">
            <img src="/game_icons/map.png" alt="Map" />
        </button>
        <button class="icon-button" on:click={() => goto('/inventory')} title="Inventory">
            <img src="/game_icons/inventory.png" alt="Inventory" />
        </button>
        <button class="icon-button" on:click={() => goto('/journal')} title="Journal">
            <img src="/game_icons/journal.png" alt="Journal" />
        </button>
        <button class="icon-button" on:click={() => goto('/homestead')} title="Homestead">
            <img src="/game_icons/homestead.png" alt="Homestead" />
        </button>
        <button class="icon-button" on:click={() => goto('/settings')} title="Settings">
            <img src="/game_icons/settings.png" alt="Settings" />
        </button>

        <TimeDisplay />

        <div class="divider"></div>

        <!-- Game Actions -->
        <button class="icon-button" on:click={SaveLoadService.saveGame} title="Save Game">
            <img src="/game_icons/save.png" alt="Save" />
        </button>
        <button class="icon-button" on:click={SaveLoadService.loadGame} title="Load Game">
            <img src="/game_icons/load.png" alt="Load" />
        </button>
        <button class="icon-button danger" on:click={SaveLoadService.clearSave} title="Delete Save">
            <img src="/game_icons/cancel.png" alt="Delete" />
        </button>
    </div>
</nav>

<style>
    .navbar {
        position: absolute;
        inset: 0;
        height: 50px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--color-secondary);
        padding: 1rem 1rem;
        color: white;
        border-bottom: 4px solid #00000056;
        z-index: 1; 
    }

    .navbar-left {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .navbar-left .brand {
        color: white;
        text-decoration: none;
        font-weight: bold;
        font-family: 'Silkscreen';
        font-size: 1.2em;
    }

    .nav-stat-bars {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .navbar-right {
        display: flex;
        align-items: center;
        gap: 0.5em;
    }

    .icon-button {
        background: none;
        border: 2px solid #555;
        padding: 0.25em;
        cursor: pointer;
        background-color: #333;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .icon-button:hover {
        background-color: #444;
        border-color: #777;
    }

    .icon-button.danger:hover {
        background-color: #c53030;
    }

    .icon-button img {
        width: 24px;
        height: 24px;
        display: block;
    }

    .divider {
        width: 2px;
        height: 32px;
        background-color: #444;
        margin: 0 0.5em;
    }
</style>