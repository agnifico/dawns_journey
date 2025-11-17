<script lang="ts">
    import { isCombatModalOpen } from '$lib/stores/uiStore';
    import Combat from './Combat.svelte';
</script>

{#if $isCombatModalOpen}
    <div class="combat-modal-overlay">
        <div class="combat-modal-content">
            <Combat />
        </div>
    </div>
{/if}

<style>
    .combat-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .combat-modal-content {
        width: 80%;
        max-width: 800px;
        height: 80%;
        max-height: 600px;
    }
</style>
