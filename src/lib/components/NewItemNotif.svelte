<script lang="ts">
    import { notificationStore, type Notification } from '$lib/stores/notificationStore';
    import { fly } from 'svelte/transition';

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
                <!-- <img src={notification.item.image} alt="" srcset="" class="item-img"> -->
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
        position: absolute;
        bottom: 3.5rem;
        left: .5rem;
        display: flex;
        flex-direction: column;
        gap: 4px;
        z-index: 1000;
    }

    .notification {
        display: flex;
        align-items: center;
        background-color: var(--surface-3);
        /* border: 1px solid; */
        border-radius: 5px;
        padding: 0rem 0.5rem;
        width: 100px;
        /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); */
        color: var(--color-text);
        border-bottom: 1px solid white;
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
        width: 10px;
        height: 10px;
    }
    .item-img {
        width: 32px;
        height: 32px;
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
