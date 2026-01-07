<script lang="ts">
	import { dialogueStore } from '$lib/stores/dialogueStore';
    import { fly } from 'svelte/transition';

    function handleAdvance() {
        dialogueStore.advanceDialogue();
    }
</script>

<svelte:window on:keydown={(e) => {
    if ($dialogueStore.isOpen && (e.key === 'z' || e.key === 'Enter')) {
        e.preventDefault();
        handleAdvance();
    }
}} />

{#if $dialogueStore.isOpen}
    <div class="dialogue-overlay" transition:fly={{ y: 50, duration: 200 }}>
        <div class="dialogue-box" on:click={handleAdvance}>
            {#if $dialogueStore.speaker}
                <div class="speaker-name">{$dialogueStore.speaker}</div>
            {/if}
            <p class="dialogue-text">
                {$dialogueStore.lines[$dialogueStore.currentIndex]}
            </p>
            <div class="continue-prompt">
                <span>Z ►</span>
            </div>
        </div>
    </div>
{/if}

<style>
    .dialogue-overlay {
        position: absolute;
        bottom: 2%;
        left: 5%;
        right: 5%;
        z-index: 50;
        -webkit-font-smoothing: none;
        font-smooth: never;
    }

    .dialogue-box {
        background-color: rgba(0, 0, 0, 0.8);
        border: 2px solid var(--color-border);
        border-radius: 8px;
        color: white;
        padding: 1.5rem;
        font-family: var(--font-family-pixel);
        font-size: 1.2rem;
        line-height: 1.5;
        cursor: pointer;
        position: relative;
    }

    .speaker-name {
        position: absolute;
        top: -1.2rem;
        left: 1rem;
        background-color: var(--color-primary);
        color: var(--color-surface-1);
        padding: 0.3rem 1rem;
        border-radius: 5px;
        font-size: 1.1rem;
        border: 2px solid var(--color-border);
    }

    .dialogue-text {
        margin: 0;
    }

    .continue-prompt {
        position: absolute;
        bottom: 0.8rem;
        right: 1.5rem;
        font-size: 1rem;
        animation: blink 1.5s infinite;
    }

    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }
</style>
