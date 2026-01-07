<script lang="ts">
    import { goto } from '$app/navigation';
    import * as SettingsService from '$lib/services/SettingsService';

    function handleAddAllItems() {
        if (confirm('This will replace your entire inventory with all items. This cannot be undone. Are you sure?')) {
            SettingsService.addAllItems();
            alert('All items have been added to your inventory.');
        }
    }

    function handleApplyDevBuff() {
        SettingsService.applyDevBuff();
        alert('Developer stat buffs have been applied for 999 steps.');
    }

    function handleLoadTestState() {
        if (confirm('This will overwrite your current game state to test Hela\'s questline. Are you sure?')) {
            SettingsService.loadTestState();
            alert('Hela test state loaded. You have the Vine Whip equipped and are ready to fight Hela.');
            goto('/map');
        }
    }
</script>

<div class="settings-page">
    <header>
        <h1>Settings</h1>
        <button on:click={() => goto('/map')}>Back to Game</button>
    </header>

    <section>
        <h2>Developer Mode</h2>
        <div class="dev-actions">
            <div class="action">
                <p><strong>Load Hela Test State</strong></p>
                <p class="description">Instantly sets your game state to the point where Sylvie has sent you to fight Hela. Equips the Vine Whip.</p>
                <button on:click={handleLoadTestState}>Run</button>
            </div>
            <div class="action">
                <p><strong>Add All Items</strong></p>
                <p class="description">Replaces your current inventory with one of every item (or 5 for general items). This is irreversible.</p>
                <button on:click={handleAddAllItems}>Run</button>
            </div>
            <div class="action">
                <p><strong>Apply Stat Buffs</strong></p>
                <p class="description">Grants a massive temporary boost to combat stats for 999 steps.</p>
                <button on:click={handleApplyDevBuff}>Apply</button>
            </div>
        </div>
    </section>
</div>

<style>
    .settings-page {
        width: 100%;
        max-width: 800px;
        margin: 2rem auto;
        padding: 1rem;
        color: white;
        font-family: sans-serif;
    }
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #444;
        padding-bottom: 1rem;
    }
    h1, h2 {
        font-family: 'Silkscreen', sans-serif;
    }
    section {
        margin-top: 2rem;
    }
    .dev-actions {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    .action {
        background-color: #2a2a2a;
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid #444;
    }
    .action p {
        margin: 0;
    }
    .action .description {
        font-size: 0.9rem;
        color: #aaa;
        margin-top: 0.5rem;
        margin-bottom: 1rem;
    }
    button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
</style>