<script lang="ts">
    import { isFactionChoiceModalOpen, closeFactionChoiceModal } from '$lib/stores/uiStore';
    import { handleFactionChoice } from '$lib/services/LocationEventService';

    function handleChoice(faction: 'Solis Saints' | 'Shadowhand') {
        handleFactionChoice(faction);
        closeFactionChoiceModal();
    }
</script>

{#if $isFactionChoiceModalOpen}
    <div class="modal-backdrop" on:click={closeFactionChoiceModal}>
        <div class="modal-content">
            <h2>Choose Your Allegiance</h2>
            <p>Your decision will shape the future of this island.</p>
            <div class="button-container">
                <button class="solis-button" on:click={() => handleChoice('Solis Saints')}>
                    Destroy the Tower (Solis Saints)
                </button>
                <button class="shadowhand-button" on:click={() => handleChoice('Shadowhand')}>
                    Fight Back (Shadowhand)
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .modal-content {
        background-color: #2c2c2c;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
        color: white;
        font-family: 'Silkscreen', sans-serif;
        border: 2px solid #555;
    }
    .button-container {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
    }
    button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 5px;
        font-family: 'Silkscreen', sans-serif;
        font-size: 1rem;
        cursor: pointer;
    }
    .solis-button {
        background-color: #a89a3d;
        color: white;
    }
    .shadowhand-button {
        background-color: #5a3d6b;
        color: white;
    }
</style>