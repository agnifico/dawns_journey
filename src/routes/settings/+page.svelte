<script lang="ts">
    import { goto } from '$app/navigation';
    import * as SettingsService from '$lib/services/SettingsService';
    import { modalStore } from '$lib/stores/modalStore';
    import Notification from "$lib/components/Notification.svelte";

    function handleAddAllItems() {
        modalStore.showConfirm(
            'Add All Items?',
            'This will replace your entire inventory with all items. This cannot be undone. Are you sure?',
            () => {
                SettingsService.addAllItems();
                modalStore.displayResult('Inventory Updated', 'All items have been added to your inventory.');
            }
        );
    }

    function handleApplyDevBuff() {
        modalStore.showConfirm(
            'Apply Stat Buffs?',
            'Are you sure you want to apply a massive temporary boost to combat stats for 999 steps?',
            () => {
                SettingsService.applyDevBuff();
                modalStore.displayResult('Buff Applied', 'Developer stat buffs have been applied.');
            }
        );
    }

    function handleLoadTestState() {
        modalStore.showConfirm(
            'Load Test State?',
            'This will overwrite your game state with the post-game test state. Are you sure?',
            () => {
                SettingsService.loadTestState();
                // The modal will briefly show this before navigating.
                modalStore.displayResult(
                    'State Loaded',
                    'Loading post-game state...'
                );
                goto('/map');
            }
        );
    }
</script>

<div class="settings-page">
    <header>
        <h1>Settings</h1>
        <button class="btn" on:click={() => goto('/map')}>Back to Game</button>
    </header>

    <section>
        <h2>Developer Mode</h2>
        <div class="dev-actions">
            <div class="action">
                <p><strong>Load Post-Game Test State</strong></p>
                <p class="description">Completes all quests for Hela, Sylvie, and Veres. Equips the Vine Whip and Water Whip.</p>
                <button class="btn btn-primary" on:click={handleLoadTestState}>Run</button>
            </div>
            <div class="action">
                <p><strong>Add All Items</strong></p>
                <p class="description">Replaces your current inventory with one of every item (or 5 for general items). This is irreversible.</p>
                <button class="btn btn-primary" on:click={handleAddAllItems}>Run</button>
            </div>
            <div class="action">
                <p><strong>Apply Stat Buffs</strong></p>
                <p class="description">Grants a massive temporary boost to combat stats for 999 steps.</p>
                <button class="btn btn-primary" on:click={handleApplyDevBuff}>Apply</button>
            </div>
        </div>
    </section>
    <Notification />
</div>

<style>
    .settings-page {
        width: 100%;
        max-width: 800px;
        margin: 2rem auto;
        padding: 1rem;
        color: white;
        font-family: 'Arial', sans-serif;
    }
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #4a4a6a;
        padding-bottom: 1rem;
    }
    h1, h2 {
        font-family: 'Silkscreen', sans-serif;
    }
    h2 {
        color: #e0e0e0;
        margin-bottom: 1.5rem;
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
        background-color: #2a2a3e;
        padding: 1.5rem;
        border-radius: 8px;
        border: 1px solid #4a4a6a;
        display: flex;
        flex-direction: column;
    }
    .action p {
        margin: 0;
    }
    .action strong {
        font-size: 1.1rem;
        color: #ffffff;
    }
    .action .description {
        font-size: 0.9rem;
        color: #b0b0c0;
        margin-top: 0.5rem;
        margin-bottom: 1rem;
        flex-grow: 1;
    }
    .btn {
        padding: 0.5rem 1rem;
        border-radius: 5px;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        font-weight: bold;
        transition: background-color 0.2s ease;
        background-color: #4a4a6a;
        color: #e0e0e0;
        align-self: flex-end;
    }
    .btn:hover {
        background-color: #63638c;
    }
    .btn-primary {
        background-color: #5e5edc;
        color: white;
    }
    .btn-primary:hover {
        background-color: #7878f0;
    }

    .icon-button {
        background: none;
        border: none;
        padding: 8px;
        cursor: pointer;
        background-color: rgba(215, 33, 33, 0.549);
        padding: .5rem 1rem;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .icon-button img {
        width: 24px;
        height: 24px;
        display: block;
    }
</style>
