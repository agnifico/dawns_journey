<script lang="ts">
    /**
     * ToastStack.svelte
     *
     * Renders toasts from toastStore at top-centre of the screen.
     * Mount ONCE in _layout.svelte.
     *
     * Flavours:
     *   success → green left border, blink-in animation
     *   info    → blue left border, slide-down
     *   warning → red left border, shake animation
     */
    import { toastStore, type Toast } from '$lib/stores/toastStore';
    import { fly } from 'svelte/transition';
</script>

<div class="toast-stack">
    {#each $toastStore as toast (toast.id)}
        <div
            class="toast flavour-{toast.flavour}"
            in:fly={{ y: -12, duration: 250 }}
            out:fly={{ y: -12, duration: 200 }}
        >
            <div class="toast-dot"></div>
            <span class="toast-msg">{toast.message}</span>
        </div>
    {/each}
</div>

<style>
    .toast-stack {
        position: fixed;
        top: 1rem;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        z-index: 900;
        pointer-events: none;
    }

    .toast {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.35rem 0.9rem 0.35rem 0.6rem;
        border-radius: 6px;
        border-left: 3px solid;
        background: rgba(10, 10, 10, 0.82);
        backdrop-filter: blur(4px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.5);
        white-space: nowrap;
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.75rem;
        letter-spacing: 0.04em;
    }

    /* ── Dot indicator ── */
    .toast-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    /* ── Success — green, blink ── */
    .flavour-success {
        border-color: #4ade80;
        color: #d1fae5;
        animation: toast-blink 0.5s ease-in-out 2;
    }
    .flavour-success .toast-dot { background: #4ade80; }

    @keyframes toast-blink {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.4; }
    }

    /* ── Info — blue, plain slide (handled by fly transition) ── */
    .flavour-info {
        border-color: #60a5fa;
        color: #dbeafe;
    }
    .flavour-info .toast-dot { background: #60a5fa; }

    /* ── Warning — red, shake ── */
    .flavour-warning {
        border-color: #f87171;
        color: #fee2e2;
        animation: toast-shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
    }
    .flavour-warning .toast-dot { background: #f87171; }

    @keyframes toast-shake {
        0%,  100% { transform: translateX(0); }
        15%        { transform: translateX(-5px); }
        30%        { transform: translateX(5px); }
        45%        { transform: translateX(-4px); }
        60%        { transform: translateX(4px); }
        75%        { transform: translateX(-2px); }
        90%        { transform: translateX(2px); }
    }
</style>