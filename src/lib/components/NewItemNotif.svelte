<script lang="ts">
    import { notificationStore, type Notification } from '$lib/stores/notificationStore';
    import { fly } from 'svelte/transition';

    // ── Config ───────────────────────────────────────────────────────────────
    // Cap the visible row so it doesn't sprawl across the bottom into the
    // weapon dock. Older entries silently fall off as new ones come in;
    // their `out` transition handles the visual exit.
    const MAX_VISIBLE = 6;

    // ── Filter: only item-related entries belong here. ───────────────────────
    // XP / level / faction / buff are owned by MapEventNotif (top-right).
    $: itemNotifs = $notificationStore
        .filter((n) => n.type.startsWith('item_'))
        .slice(-MAX_VISIBLE);

    // ── Border accent colours per item action type ───────────────────────────
    const borderColors: Record<string, string> = {
        item_received:   'var(--notification-received,   #6a994e)',
        item_used:       'var(--notification-used,       #a98467)',
        item_equipped:   'var(--notification-equipped,   #48cae4)',
        item_unequipped: 'var(--notification-unequipped, #888)',
        item_removed:    'var(--notification-used,       #a98467)',
    };

    function getBorder(n: Notification) {
        return borderColors[n.type] ?? '#555';
    }

    function isItem(n: Notification): n is typeof n & { item: any; quantity: number } {
        return n.type.startsWith('item_');
    }
</script>

<div class="notification-container">
    {#each itemNotifs as n (n.id)}
        <div
            class="notification"
            class:is-special={n.type === 'item_received' && n.isSpecial}
            style="border-color: {getBorder(n)}"
            in:fly={{ x: 24, duration: 260 }}
            out:fly={{ x: -24, duration: 200 }}
        >
            {#if isItem(n)}
                {#if n.isSpecial}
                    <!-- ── LEGENDARY / SPECIAL LOOT CARD ── -->
                    <div class="loot-card-inner">
                        <div class="loot-icon-wrap">
                            <img src={n.item.image} alt="" class="loot-img" />
                            <div class="loot-shine"></div>
                        </div>
                        <div class="loot-info">
                            <span class="loot-tag">{n.item.type?.toUpperCase()}</span>
                            <span class="loot-name">{n.item.name}</span>
                            <span class="loot-sub">Added to inventory</span>
                        </div>
                    </div>
                {:else}
                    <div class="notif-body">
                        <img src={n.item.image} alt="" class="item-img" />
                        {#if n.quantity > 1}
                            <span class="notif-qty">x{n.quantity}</span>
                        {/if}
                    </div>
                {/if}
            {/if}
        </div>
    {/each}
</div>

<style>
    .notification-container {
        position: absolute;
        bottom: 1rem;
        left: 0.5rem;

        /* Hard width limit: never intrude on bottom-center dock.
           ~360px reserved on the right covers the WeaponWidget + bread + buffer. */
        max-width: calc(100% - 360px);
        /* overflow: hidden; */

        display: flex;
        flex-direction: row;
        gap: 4px;
        z-index: 1000;
        pointer-events: none;
    }

    /* New entries enter on the right, oldest pushed off the left. */
    .notification {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        background-color: #0000009e;
        border-left-width: 3px;
        border-radius: 6px;
        padding: 0.3rem 0.6rem 0.3rem 0.4rem;
        max-width: 220px;
        flex-shrink: 0;
        pointer-events: auto;
    }

    /* Legendary / special — full loot card */
    .notification.is-special {
        min-width: 240px;
        max-width: 280px;
        box-sizing: border-box;
        padding: 0;
        border: none;
        overflow: hidden;
        background: linear-gradient(135deg, #1a1200 0%, #2a1f00 50%, #1a1200 100%);
        box-shadow:
            0 0 0 1.5px #facc15,
            0 0 16px rgba(250, 204, 21, 0.3),
            0 4px 20px rgba(0, 0, 0, 0.6);
        animation: loot-entrance 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes loot-entrance {
        0%   { opacity: 0; transform: scale(0.85) translateX(8px); }
        100% { opacity: 1; transform: scale(1)    translateX(0); }
    }

    .loot-card-inner {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.6rem 0.8rem;
        position: relative;
    }

    .loot-icon-wrap {
        position: relative;
        flex-shrink: 0;
        width: 40px;
        height: 40px;
    }

    .loot-img {
        width: 40px;
        height: 40px;
        object-fit: contain;
        image-rendering: pixelated;
        filter: drop-shadow(0 0 6px #facc15aa);
        position: relative;
        z-index: 1;
    }

    .loot-shine {
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(250, 204, 21, 0.2) 0%, transparent 70%);
        animation: loot-pulse 1.5s ease-in-out infinite;
        z-index: 0;
    }

    @keyframes loot-pulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50%       { opacity: 1;   transform: scale(1.15); }
    }

    .loot-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    .loot-tag {
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.75rem;
        letter-spacing: 0.15em;
        color: #facc15;
        opacity: 0.8;
    }

    .loot-name {
        font-family: var(--font-family-pixel, monospace);
        font-size: 1rem;
        color: #fff8e0;
        text-shadow: 0 0 8px rgba(250, 204, 21, 0.5);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .loot-sub {
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.5rem;
        color: #888;
        letter-spacing: 0.05em;
    }

    /* Standard pill body */
    .notif-body {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        min-width: 0;
    }

    .notif-qty {
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.75rem;
        color: var(--text-muted, #888);
        flex-shrink: 0;
    }

    .item-img {
        width: 24px;
        height: 24px;
        object-fit: contain;
        flex-shrink: 0;
        image-rendering: pixelated;
    }

    @media (max-width: 768px) {
        .notification-container {
            max-width: calc(100% - 1rem);
            bottom: 0.5rem;
        }
    }
</style>