<script lang="ts">
    import { modalStore } from '$lib/stores/modalStore';

    function handleConfirm() {
        if ($modalStore.data?.type === 'confirm' && $modalStore.data.onConfirm) {
            $modalStore.data.onConfirm();
        }
        modalStore.close();
    }

    function handleCancel() {
        if ($modalStore.data?.type === 'confirm' && $modalStore.data.onCancel) {
            $modalStore.data.onCancel();
        }
        modalStore.close();
    }

    function handleClose() {
        modalStore.close();
    }
</script>

{#if $modalStore.isOpen}
<div class="modal-backdrop" on:click={handleClose}>
    <div class="modal-content" on:click|stopPropagation>
        <h2 class="modal-title">{$modalStore.data?.title}</h2>
        <p class="modal-body">{@html $modalStore.data?.content}</p>
        <div class="modal-actions">
            {#if $modalStore.data?.type === 'confirm'}
                <button class="btn btn-primary" on:click={handleConfirm}>Yes</button>
                <button class="btn btn-secondary" on:click={handleCancel}>No</button>
            {:else if $modalStore.data?.type === 'message'}
                <button class="btn btn-primary" on:click={handleClose}>OK</button>
            {/if}
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
        background: #2a2a3e;
        border: 2px solid #4a4a6a;
        border-radius: 8px;
        padding: 2rem;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        color: #e0e0e0;
        font-family: 'Arial', sans-serif;
    }

    .modal-title {
        margin-top: 0;
        margin-bottom: 1rem;
        font-size: 1.5rem;
        color: #ffffff;
        border-bottom: 1px solid #4a4a6a;
        padding-bottom: 0.5rem;
    }

    .modal-body {
        margin-bottom: 1.5rem;
        line-height: 1.6;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }

    .btn {
        padding: 0.5rem 1rem;
        border-radius: 5px;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        font-weight: bold;
        transition: background-color 0.2s ease;
    }

    .btn-primary {
        background-color: #5e5edc;
        color: white;
    }

    .btn-primary:hover {
        background-color: #7878f0;
    }

    .btn-secondary {
        background-color: #4a4a6a;
        color: #e0e0e0;
    }

    .btn-secondary:hover {
        background-color: #63638c;
    }
</style>
