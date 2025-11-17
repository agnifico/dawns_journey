<script lang="ts">
    import { messageStore, type Message, type MessageType } from '../stores/messageStore';
    import { fade } from 'svelte/transition';
    import { onMount, afterUpdate } from 'svelte';
    import ExploBubble from './ExploBubble.svelte';

    let messagesContainer: HTMLDivElement;
    let currentFilter: MessageType | 'All' = 'All';

    const filterMessages = (messages: Message[], filter: MessageType | 'All'): Message[] => {
        if (filter === 'All') {
            return messages;
        }
        return messages.filter(m => m.types.includes(filter));
    };

    const getMessageColor = (types: MessageType[]): string => {
        if (types.includes('Combat')) return '#FF6347'; // Tomato
        if (types.includes('NPC')) return '#87CEEB'; // Sky Blue
        if (types.includes('Help')) return '#90EE90'; // Light Green
        if (types.includes('World')) return '#fff';
        if (types.includes('System')) return '#aaa';
        return '#fff';
    };

    const filters: (MessageType | 'All')[] = ['All', 'System', 'World', 'NPC', 'Help', 'Combat'];

    afterUpdate(() => {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });
</script>

<div class="message-log-container">
    <div class="filters">
        {#each filters as filter}
            <button on:click={() => currentFilter = filter} class:active={currentFilter === filter}>
                {filter}
            </button>
        {/each}
    </div>
    <div class="messages" bind:this={messagesContainer}>
        {#each filterMessages($messageStore.messages, currentFilter) as message (message.id)}
            <div class="message" style="color: {getMessageColor(message.types)}" transition:fade>
                <span class="timestamp">[CPT: {message.timestamp}]</span>
                <span class="text">{message.text}</span>
                {#if message.explorationRequirements}
                    <div class="explo-bubbles">
                        {#each message.explorationRequirements as req}
                            <ExploBubble name={req.name} level={req.level} />
                        {/each}
                    </div>
                {/if}
                {#if message.item}
                    <div class="item-thumbnail">
                        <img src={message.item.thumbnailImage} alt={message.item.name} />
                        <span>{message.item.name}</span>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</div>

<style>
    .message-log-container {
        width: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        border: 1px solid #444;
        border-radius: 5px;
        display: flex;
        flex-direction: column;
        font-family: monospace;
        font-size: 14px;
        box-sizing: border-box;
        flex-grow: 1; /* Fill available space */
        min-height: 0; /* Flexbox fix */
    }

    .filters {
        display: flex;
        border-bottom: 1px solid #444;
        flex-shrink: 0; /* Prevent filters from shrinking */
    }

    .filters button {
        flex-grow: 1;
        background-color: #222;
        color: #fff;
        border: none;
        padding: 5px;
        cursor: pointer;
    }

    .filters button.active {
        background-color: #555;
    }

    .messages {
        flex-grow: 1;
        overflow-y: auto;
        padding: 10px;
        display: flex;
        flex-direction: column;
    }

    .message {
        margin-bottom: 5px;
    }

    .message:last-child {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
    }

    .timestamp {
        margin-right: 10px;
        color: #888;
    }

    .item-thumbnail {
        display: inline-flex;
        align-items: center;
        margin-left: 10px;
        border: 1px solid #555;
        padding: 2px 5px;
        background: #333;
    }

    .item-thumbnail img {
        width: 20px;
        height: 20px;
        margin-right: 5px;
    }

    .explo-bubbles {
        display: flex;
        flex-wrap: wrap;
        margin-top: 5px;
    }
</style>