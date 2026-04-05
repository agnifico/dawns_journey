<script lang="ts">
    import { notificationStore, type Notification } from '$lib/stores/notificationStore';
    import { fly } from 'svelte/transition';

    // ── Icon map for item action types ───────────────────────────────────────
    const itemActionIcons: Record<string, string> = {
        item_received:   'item_received.svg',
        item_used:       'item_removed.svg',
        item_equipped:   'equipped.svg',
        item_unequipped: 'unequipped.svg',
        item_removed:    'item_removed.svg',
    };

    // ── Border accent colours per type ───────────────────────────────────────
    const borderColors: Record<string, string> = {
        item_received:   'var(--notification-received, #6a994e)',
        item_used:       'var(--notification-used,     #a98467)',
        item_equipped:   'var(--notification-equipped, #48cae4)',
        item_unequipped: 'var(--notification-unequipped, #888)',
        item_removed:    'var(--notification-used,     #a98467)',
        xp_gained:       '#90a955',
        level_up:        '#facc15',
        buff_applied:    '#48cae4',
        buff_expired:    '#888',
    };

    function getBorder(n: Notification) {
        return borderColors[n.type] ?? '#555';
    }

    // ── Type guards ───────────────────────────────────────────────────────────
    function isItem(n: Notification): n is typeof n & { item: any; quantity: number } {
        return n.type.startsWith('item_');
    }
    function isXp(n: Notification): n is typeof n & { amount: number; skill?: string } {
        return n.type === 'xp_gained';
    }
    function isLevelUp(n: Notification): n is typeof n & { level: number; skill?: string } {
        return n.type === 'level_up';
    }
    function isBuff(n: Notification): n is typeof n & { buffName: string; duration_steps?: number } {
        return n.type === 'buff_applied' || n.type === 'buff_expired';
    }

    // ── Icon path helpers ─────────────────────────────────────────────────────
    function getXpIcon(skill?: string): string {
        if (!skill) return '/game_icons/player_level.png';
        const map: Record<string, string> = {
            woodcutting: 'woodcutting.png',
            mining:      'mining.png',
            smithing:    'smithing.png',
            farming:     'farming.png',
            cooking:     'cooking.png',
            alchemy:     'alchemy.png',
        };
        return `/game_icons/${map[skill.toLowerCase()] ?? 'player_level.png'}`;
    }
</script>

<div class="notification-container">
    {#each $notificationStore as n (n.id)}
        <div
            class="notification"
            class:is-level-up={n.type === 'level_up'}
            class:is-special={n.type === 'item_received' && n.isSpecial}
            style="border-color: {getBorder(n)}"
            in:fly={{ x: -24, duration: 260 }}
            out:fly={{ x: -24, duration: 200 }}
        >

            <!-- ── ITEM NOTIFICATIONS ── -->
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
                    <div class="notif-icon">
                        <img src="/game_icons/{itemActionIcons[n.type]}" alt="" />
                    </div>
                    <div class="notif-body">
                        <img src={n.item.image} alt="" class="item-img" />
                        <!-- <span class="notif-name">{n.item.name}</span> -->
                        {#if n.quantity > 1}
                            <span class="notif-qty">x{n.quantity}</span>
                        {/if}
                    </div>
                {/if}

            <!-- ── XP GAINED ── -->
            {:else if isXp(n)}
                <div class="notif-icon">
                    <img src={getXpIcon(n.skill)} alt="" />
                </div>
                <div class="notif-body">
                    <span class="notif-name">
                        {#if n.skill}{n.skill}{:else}XP{/if}
                    </span>
                    <span class="notif-qty xp-amount">+{n.amount}</span>
                </div>

            <!-- ── LEVEL UP ── -->
            {:else if isLevelUp(n)}
                <div class="notif-icon level-up-icon">
                    <img src={getXpIcon(n.skill)} alt="" />
                </div>
                <div class="notif-body">
                    <span class="notif-label">LEVEL UP</span>
                    <span class="notif-name">
                        {n.skill ? n.skill : 'Player'} {n.level}
                    </span>
                </div>

            <!-- ── FACTION SCORE ── -->
            {:else if n.type === 'faction_score'}
                <div class="notif-icon">
                    <img src="/game_icons/reputation.png" alt="" />
                </div>
                <div class="notif-body">
                    <span class="notif-name">{n.factionName}</span>
                    <span class="notif-qty" style="color: #a78bfa">+{n.amount}</span>
                </div>

            <!-- ── BUFF APPLIED / EXPIRED ── -->
            {:else if isBuff(n)}
                <div class="notif-icon">
                    <img
                        src="/game_icons/{n.type === 'buff_applied' ? 'buff_applied.png' : 'buff_expired.png'}"
                        alt=""
                    />
                </div>
                <div class="notif-body">
                    <span class="notif-name">{n.buffName}</span>
                    {#if n.type === 'buff_applied' && n.duration_steps}
                        <span class="notif-qty">{n.duration_steps} steps</span>
                    {:else if n.type === 'buff_expired'}
                        <span class="notif-qty expired">worn off</span>
                    {/if}
                </div>
            {/if}

        </div>
    {/each}
</div>

<style>
	.notification-container {
		position: absolute;
		bottom: 1rem;
		left: 0.5rem;
		display: flex;
		/* flex-direction: column; */
        flex-direction: row-reverse;
		gap: 4px;
		z-index: 1000;
        /* background-color: #1a1200a2; */
        /* padding-inline: 2rem; */
	}

    /* ── Standard notif ── */
    .notification {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        background-color: var(--surface-3, #1e1e1e);
        border: 1.5px solid #555;
        border-left-width: 3px;     /* accent on left edge */
        border-radius: 6px;
        padding: 0.3rem 0.6rem 0.3rem 0.4rem;
        /* min-width: 160px; */
        max-width: 220px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    }

    /* Legendary / special — full loot card */
    .notification.is-special {
        min-width: 240px;
        max-width: 280px;
        padding: 0;
        border: none;
        overflow: hidden;
        background: linear-gradient(135deg, #1a1200 0%, #2a1f00 50%, #1a1200 100%);
        box-shadow: 0 0 0 1.5px #facc15, 0 0 16px rgba(250,204,21,0.3), 0 4px 20px rgba(0,0,0,0.6);
        animation: loot-entrance 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes loot-entrance {
        0%   { opacity: 0; transform: scale(0.85) translateX(-8px); }
        100% { opacity: 1; transform: scale(1)   translateX(0); }
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
        background: radial-gradient(circle, rgba(250,204,21,0.2) 0%, transparent 70%);
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
        text-shadow: 0 0 8px rgba(250,204,21,0.5);
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

    /* Level up gets slightly more presence */
    .notification.is-level-up {
        min-width: 180px;
        padding: 0.4rem 0.7rem 0.4rem 0.5rem;
        background: color-mix(in srgb, var(--surface-3, #1e1e1e) 85%, #facc1520);
    }

    /* ── Icon ── */
    .notif-icon img {
        width: 16px;
        height: 16px;
        object-fit: contain;
        image-rendering: pixelated;
        flex-shrink: 0;
    }

    .level-up-icon img {
        width: 16px;
        height: 16px;
        filter: drop-shadow(0 0 4px #facc15aa);
    }

    /* ── Body ── */
    .notif-body {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        min-width: 0;
    }

    .notif-label {
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.42rem;
        letter-spacing: 0.12em;
        color: #facc15;
        flex-shrink: 0;
    }

    .notif-name {
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.5rem;
        color: #eee;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
    }

    .notif-qty {
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.48rem;
        color: var(--text-muted, #888);
        flex-shrink: 0;
    }

    .xp-amount {
        color: #90a955;
    }

    .expired {
        color: #888;
        font-style: italic;
    }

    .item-img {
        width: 24px;
        height: 24px;
        object-fit: contain;
        flex-shrink: 0;
        image-rendering: pixelated;
    }
</style>