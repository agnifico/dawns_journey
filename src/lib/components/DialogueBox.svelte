<script lang="ts">
	import { dialogueStore } from '$lib/stores/dialogueStore';
    import { fly } from 'svelte/transition';

    let lastAdvanceTime = 0;

    // Single advance handler used by both keyboard and click.
    // 80ms debounce prevents keydown + click firing together
    // and skipping two slides (the "second-to-last slide" bug).
    function handleAdvance() {
        const now = Date.now();
        if (now - lastAdvanceTime < 80) return;
        lastAdvanceTime = now;
        dialogueStore.advanceDialogue();
    }
</script>

<svelte:window
    on:keydown={(e) => {
        if ($dialogueStore.isOpen && (e.key === 'z' || e.key === 'Z' || e.key === 'Enter')) {
            e.preventDefault();
            handleAdvance();
        }
    }}
/>

{#if $dialogueStore.isOpen}
    <div class="dialogue-overlay" on:click={handleAdvance} transition:fly={{ y: 50, duration: 200 }}>
        <div class="dialogue-box">
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
        position: fixed;
        bottom: 2%;
        left: 2%;
        right: 2%;
        z-index: 500;
        height: max-content;
        -webkit-font-smoothing: none;
        font-smooth: never;
    }

    .dialogue-box {
        background-color: rgba(0, 0, 0, 0.8);
        border: 2px solid var(--color-border);
        border-radius: 8px;
        color: white;
        padding: 1.5rem;
        padding-bottom: 3rem;
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
        color: var(--color-secondary);
        padding: 0.3rem 1rem;
        border-radius: 5px;
        font-size: 1.1rem;
        border: 2px solid var(--color-border);
    }

    .dialogue-text {
        margin: 0;
        margin-right: 1rem;
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