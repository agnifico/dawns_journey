<script lang="ts">
    import { dialogueStore } from '$lib/stores/dialogueStore';
    import { playerStore } from '$lib/stores/playerStore';
    import SceneChoices from '$lib/components/SceneChoices.svelte';
    import { elementBgs, elementColors } from '$lib/data/statDefinitions';
    import { fly } from 'svelte/transition';

    let lastAdvanceTime = 0;

    function handleAdvance() {
        const now = Date.now();
        if (now - lastAdvanceTime < 80) return;
        const current = $dialogueStore.flatLines?.[$dialogueStore.currentIndex];
        if (current?.isChoice) return;
        lastAdvanceTime = now;
        dialogueStore.advanceDialogue();
    }

    $: currentFlat       = $dialogueStore.flatLines?.[$dialogueStore.currentIndex] ?? null;
    $: isChoiceLine      = currentFlat?.isChoice === true;
    $: activeSpeaker     = currentFlat?.speaker      ?? $dialogueStore.speaker      ?? null;
    $: activeSpeakerImage = currentFlat?.speakerImage ?? $dialogueStore.speakerImage ?? null;
    $: activeElements    = currentFlat?.speakerElements ?? $dialogueStore.speakerElements ?? [];
    $: isPlayer          = activeSpeaker === 'You' || activeSpeaker === 'Player';

    // Element colour derivation — falls back to default if no elements
    $: primaryElement   = activeElements[0]?.toLowerCase() ?? null;
    $: secondaryElement = activeElements[1]?.toLowerCase() ?? null;

    $: nameplateColor  = primaryElement  ? elementColors[primaryElement]  : 'var(--color-secondary)';
    $: nameplateBg     = primaryElement  ? elementBgs[primaryElement]     : 'var(--color-primary)';
    $: avatarBorder    = secondaryElement ? elementColors[secondaryElement] : nameplateColor;

    function handleChoice(option) {
        const tags = $playerStore.worldTags ?? [];
        if (option.tag && !tags.includes(option.tag)) {
            playerStore.update(p => ({
                ...p,
                worldTags: [...(p.worldTags ?? []), option.tag]
            }));
        }
        dialogueStore.resolveChoice(option, $playerStore.worldTags ?? []);
    }
</script>

<svelte:window
    on:keydown={(e) => {
        if (!$dialogueStore.isOpen) return;

        if (isChoiceLine && currentFlat?.choices) {
            const keymap = ['z', 'x', 'c', 'v'];
            const idx = keymap.indexOf(e.key.toLowerCase());
            if (idx !== -1 && currentFlat.choices[idx]) {
                e.preventDefault();
                e.stopPropagation();
                handleChoice(currentFlat.choices[idx]);
                return;
            }
        }

        if (e.key === 'z' || e.key === 'Z' || e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            handleAdvance();
        }
    }}
/>

{#if $dialogueStore.isOpen}
    <div
        class="dialogue-overlay"
        class:player-speaking={isPlayer}
        on:click={handleAdvance}
        transition:fly={{ y: 50, duration: 200 }}
    >
        <div
            class="dialogue-box"
            class:is-choice={isChoiceLine}
            style:--nameplate-color={nameplateColor}
            style:--nameplate-bg={nameplateBg}
            style:--avatar-border={avatarBorder}
        >
            <!-- Speaker nameplate + avatar -->
            {#if activeSpeaker}
                <div class="speaker-row" class:flipped={isPlayer}>
                    {#if activeSpeakerImage}
                        <img
                            class="speaker-avatar"
                            src={activeSpeakerImage}
                            alt={activeSpeaker}
                        />
                    {/if}
                    <div class="speaker-name">{activeSpeaker}</div>
                </div>
            {/if}

            {#if isChoiceLine && currentFlat?.choices}
                {#if currentFlat.text}
                    <p class="dialogue-text prompt-text">{currentFlat.text}</p>
                {/if}
                <div class="choices-wrapper">
                    <SceneChoices choices={currentFlat.choices} onChoose={handleChoice} />
                </div>
            {:else}
                <p class="dialogue-text">{currentFlat?.text ?? ''}</p>
                <div class="continue-prompt"><span>Z ►</span></div>
            {/if}
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

    .dialogue-overlay.player-speaking {
        left: 20%;
    }

    .dialogue-box {
        background-color: rgba(0, 0, 0, 0.85);
        border: 2px solid var(--nameplate-bg, var(--color-border));
        border-radius: 8px;
        color: white;
        padding: 1.5rem;
        padding-top: 1.8rem;
        padding-bottom: 3rem;
        font-family: var(--font-family-pixel);
        font-size: 1.2rem;
        line-height: 1.5;
        cursor: pointer;
        position: relative;
        transition: border-color 0.2s ease;
    }

    .dialogue-box.is-choice {
        padding-bottom: 1.5rem;
        cursor: default;
    }

    /* ── Speaker row ── */
    .speaker-row {
        position: absolute;
        top: -1.4rem;
        left: 1rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }

    .speaker-row.flipped {
        left: auto;
        right: 1rem;
        flex-direction: row-reverse;
    }

    .speaker-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid var(--avatar-border, var(--color-border));
        object-fit: cover;
        image-rendering: pixelated;
        background-color: var(--surface-2);
        flex-shrink: 0;
        transition: border-color 0.2s ease;
    }

    .speaker-name {
        background-color: var(--nameplate-bg, var(--color-primary));
        color: var(--nameplate-color, var(--color-secondary));
        padding: 0.3rem 0.8rem;
        border-radius: 5px;
        font-size: 1.1rem;
        border: 2px solid var(--nameplate-color, var(--color-border));
        white-space: nowrap;
        transition: background-color 0.2s ease, color 0.2s ease;
    }

    /* ── Text ── */
    .dialogue-text {
        margin: 0;
        margin-right: 1rem;
    }

    .prompt-text {
        margin-bottom: 0.75rem;
        opacity: 0.85;
    }

    .choices-wrapper {
        margin-top: 0.5rem;
    }

    /* ── Continue prompt ── */
    .continue-prompt {
        position: absolute;
        bottom: 0.8rem;
        right: 1.5rem;
        font-size: 1rem;
        animation: blink 1.5s infinite;
    }

    @keyframes blink {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.3; }
    }
</style>