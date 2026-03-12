<script lang="ts">
	import { notificationStore } from '$lib/stores/notificationStore';
	import { fly } from 'svelte/transition';

    const typeIcons: Record<string, string> = {
        item_received:   'item_received.svg',
        item_used:       'item_removed.svg',
        item_equipped:   'equipped.svg',
        item_unequipped: 'unequipped.svg',
        item_removed:    'item_removed.svg',
    };
</script>

<div class="notification-container">
	{#each $notificationStore as n (n.id)}
		{#if n.type === 'item_received' || n.type === 'item_equipped' || n.type === 'item_used' || n.type === 'item_removed' || n.type === 'item_unequipped'}

            {#if n.isSpecial}
                <!-- ── LEGENDARY LOOT CARD ── -->
                <div
                    class="loot-card"
                    in:fly={{ x: -16, duration: 300 }}
                    out:fly={{ x: -16, duration: 200 }}
                >
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
                <!-- ── STANDARD ITEM NOTIF ── -->
                <div
                    class="notification type-{n.type}"
                    in:fly={{ y: 20, duration: 300 }}
                    out:fly={{ y: 20, duration: 300 }}
                >
                    <div class="icon">
                        <img src="/game_icons/{typeIcons[n.type]}" alt={n.type} />
                    </div>
                    <div class="item-info">
                        <span class="item-name">{n.item.name}</span>
                        {#if n.quantity > 1}
                            <span class="item-quantity">x{n.quantity}</span>
                        {/if}
                    </div>
                </div>
            {/if}

		{/if}
	{/each}
</div>

<style>
	.notification-container {
		position: absolute;
		bottom: 3.5rem;
		left: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 4px;
		z-index: 1000;
	}

    /* ── Standard notif ── */
	.notification {
		display: flex;
		align-items: center;
		/* background-color: var(--surface-3); */
		border-radius: 5px;
		padding: 0rem 0.5rem;
		width: 100px;
        width: fit-content;
		color: rgba(255, 255, 255, 0.7);
		border-bottom: 1px solid rgba(255, 255, 255, 0.7);
	}
	.notification.type-item_received  { border-color: var(--notification-received); }
	.notification.type-item_used, .notification.type-item_removed      { border-color: var(--notification-used); }
	.notification.type-item_equipped  { border-color: var(--notification-equipped); }
	.notification.type-item_unequipped { border-color: var(--notification-unequipped); }

	.icon { margin-right: 0.5rem; opacity: .5;}
	.icon img { width: 10px; height: 10px; }

	.item-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.item-name {
		font-weight: bold;
		font-family: var(--font-family-pixel);
		font-size: 0.5rem;
		text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
	}
	.item-quantity {
		font-size: 0.6em;
		color: var(--color-text-muted);
		text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
	}

    /* ── Legendary loot card ── */
    .loot-card {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.5rem 0.7rem;
        border-radius: 8px;
        background: linear-gradient(135deg, #1a1200 0%, #2a1f00 50%, #1a1200 100%);
        box-shadow: 0 0 0 1.5px #facc15, 0 0 14px rgba(250,204,21,0.25), 0 4px 16px rgba(0,0,0,0.6);
        animation: loot-entrance 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        min-width: 160px;
    }

    @keyframes loot-entrance {
        0%   { opacity: 0; transform: scale(0.85) translateX(-8px); }
        100% { opacity: 1; transform: scale(1)   translateX(0); }
    }

    .loot-icon-wrap {
        position: relative;
        width: 32px;
        height: 32px;
        flex-shrink: 0;
    }

    .loot-img {
        width: 32px;
        height: 32px;
        object-fit: contain;
        image-rendering: pixelated;
        filter: drop-shadow(0 0 5px #facc15aa);
        position: relative;
        z-index: 1;
    }

    .loot-shine {
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(250,204,21,0.18) 0%, transparent 70%);
        animation: loot-pulse 1.5s ease-in-out infinite;
    }

    @keyframes loot-pulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50%       { opacity: 1;   transform: scale(1.2); }
    }

    .loot-info {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
    }

    .loot-tag {
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.36rem;
        letter-spacing: 0.15em;
        color: #facc15;
        opacity: 0.8;
    }

    .loot-name {
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.52rem;
        color: #fff8e0;
        text-shadow: 0 0 6px rgba(250,204,21,0.4);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .loot-sub {
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.36rem;
        color: #666;
    }
</style>