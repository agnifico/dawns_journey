<script lang="ts">
    import { notificationStore, type Notification } from '$lib/stores/notificationStore';
    import { fly } from 'svelte/transition';
    import ItemBox from './ItemBox.svelte';

    const typeIcons = {
        item_received: 'item_received.svg',
        item_used: 'item_removed.svg',
        item_equipped: 'equipped.svg',
        item_unequipped: 'unequipped.svg',
    };
</script>

<div class="notification-container">
    {#each $notificationStore as notification (notification.id)}
        <div
            class="notification type-{notification.type}"
            in:fly={{ y: 20, duration: 300 }}
            out:fly={{ y: 20, duration: 300 }}
        >
            <div class="icon">
                <img src="/game_icons/{typeIcons[notification.type]}" alt={notification.type} />
            </div>
            <div class="item-info">
                <ItemBox item={notification.item} viewSize="small" base="" />
                <span class="item-name">{notification.item.name}</span>
                {#if notification.quantity > 1}
                    <span class="item-quantity">x{notification.quantity}</span>
                {/if}
            </div>
        </div>
    {/each}
</div>

<style>
    .notification-container {
        position: fixed;
        bottom: 20px;
        left: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 1000;
    }

    .notification {
        display: flex;
        align-items: center;
        background-color: var(--surface-3);
        border: 1px solid;
        border-radius: 5px;
        padding: 0.25rem 0.5rem;
        width: 200px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        color: var(--color-text);
    }

    .notification.type-item_received {
        border-color: var(--notification-received);
    }
    .notification.type-item_used {
        border-color: var(--notification-used);
    }
    .notification.type-item_equipped {
        border-color: var(--notification-equipped);
    }
    .notification.type-item_unequipped {
        border-color: var(--notification-unequipped);
    }

    .icon {
        margin-right: 0.5rem;
    }

    .icon img {
        width: 20px;
        height: 20px;
    }

    .item-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .item-name {
        font-weight: bold;
        font-family: var(--font-family-pixel);
        font-size: .5rem;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
    }

    .item-quantity {
        font-size: 0.6em;
        color: var(--color-text-muted);
        text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
    }
</style>
