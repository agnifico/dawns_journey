<script lang="ts">
    import { modalStore } from '$lib/stores/modalStore';
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';

    function handleConfirm() {
        if ($modalStore.data?.type === 'confirm') {
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

    function handleKeydown(e: KeyboardEvent) {
        if (!$modalStore.isOpen) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            // Escape = cancel / close — same as clicking outside or Cancel button
            handleCancel();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            // Enter / Space = confirm for confirm modals, close for message modals
            handleConfirm();
        }
    }

    onMount(() => { if (browser) window.addEventListener('keydown', handleKeydown, { capture: true }); });
    onDestroy(() => { if (browser) window.removeEventListener('keydown', handleKeydown, { capture: true }); });

    $: isDanger = $modalStore.data?.type === 'confirm' && $modalStore.data.danger;
    $: confirmLabel = ($modalStore.data?.type === 'confirm' && $modalStore.data.confirmLabel) || 'Confirm';
    $: cancelLabel  = ($modalStore.data?.type === 'confirm' && $modalStore.data.cancelLabel)  || 'Cancel';
</script>

{#if $modalStore.isOpen}
<div class="modal-backdrop" on:click={modalStore.close} role="dialog" aria-modal="true">
    <div class="modal-box" on:click|stopPropagation>
        <!-- Top accent bar — red if danger, teal if normal -->
        <div class="modal-accent" class:danger={isDanger}></div>

        <div class="modal-inner">
            <h2 class="modal-title">{$modalStore.data?.title}</h2>
            <p class="modal-body">{@html $modalStore.data?.content}</p>

            <div class="modal-actions">
                {#if $modalStore.data?.type === 'confirm'}
                    <button
                        class="modal-btn"
                        class:btn-danger={isDanger}
                        class:btn-confirm={!isDanger}
                        on:click={handleConfirm}
                    >
                        {confirmLabel}
                    </button>
                    <button class="modal-btn btn-cancel" on:click={handleCancel}>
                        {cancelLabel}
                    </button>
                {:else}
                    <button class="modal-btn btn-confirm" on:click={modalStore.close}>
                        OK
                    </button>
                {/if}
            </div>
        </div>
    </div>
</div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.72);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9000;
        backdrop-filter: blur(2px);
    }

    .modal-box {
        background: var(--surface-1, #1a1a1a);
        border: 3px solid #00000056;
        box-shadow:
            #00000056 0 -8px 0 0px inset,
            0 12px 40px rgba(0, 0, 0, 0.6);
        border-radius: 14px;
        width: 90%;
        max-width: 420px;
        overflow: hidden;
        font-family: var(--font-family-pixel, monospace);
    }

    /* Top colour strip */
    .modal-accent {
        height: 4px;
        background: #51bfc1;
    }
    .modal-accent.danger {
        background: #c53030;
    }

    .modal-inner {
        padding: 1.5rem 1.5rem 1.25rem;
    }

    .modal-title {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-header, #eee);
        letter-spacing: 0.06em;
        text-transform: uppercase;
        margin: 0 0 0.75rem;
        padding-bottom: 0.6rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }

    .modal-body {
        font-size: 0.82rem;
        color: var(--text-muted, #aaa);
        line-height: 1.65;
        margin: 0 0 1.25rem;
    }

    .modal-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
    }

    .modal-btn {
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.75rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 0.35rem 0.9rem 0.5rem;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        transition: all 0.1s ease;
        border: 3px solid #00000056;
        box-shadow: #00000056 0 -3px 0 0px inset;
    }
    .modal-btn:hover { filter: brightness(1.15); }
    .modal-btn:active { transform: translateY(2px); box-shadow: none; }

    .btn-confirm {
        background: var(--surface-3, #3a3a3a);
        color: #51bfc1;
        border-color: rgba(81, 191, 193, 0.3);
    }
    .btn-confirm:hover {
        background: #51bfc1;
        color: #111;
    }

    .btn-danger {
        background: rgba(197, 48, 48, 0.2);
        color: #e07a5f;
        border-color: rgba(197, 48, 48, 0.4);
    }
    .btn-danger:hover {
        background: #c53030;
        color: #fff;
    }

    .btn-cancel {
        background: var(--surface-3, #2a2a2a);
        color: var(--text-muted, #888);
    }
    .btn-cancel:hover {
        background: var(--surface-2, #333);
        color: var(--text-header, #eee);
    }
</style>