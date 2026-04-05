<script lang="ts">
    // SceneChoices.svelte
    // Renders player choice buttons during a scene.
    // Intentionally position-agnostic — drop it wherever in the layout.
    // Parent is responsible for showing/hiding this based on dialogueStore state.

    import type { SceneChoiceOption } from '$lib/stores/dialogueStore';

    export let choices: SceneChoiceOption[] = [];
    export let onChoose: (option: SceneChoiceOption) => void;

    const keymap = ['z', 'x', 'c', 'v'];
</script>

<div class="scene-choices">
    <ul>
        {#each choices as option, i}
            <li>
                <button
                    on:click={() => onChoose(option)}
                    class="choice-btn"
                >
                    <span class="choice-label">{option.text}</span>
                    {#if keymap[i]}
                        <span class="hotkey">[{keymap[i].toUpperCase()}]</span>
                    {/if}
                </button>
            </li>
        {/each}
    </ul>
</div>

<style>
    .scene-choices {
        width: 100%;
    }

    ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    .choice-btn {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 0.25rem 0.5rem 0.5rem;
        background-color: var(--surface-3);
        color: var(--text-header);
        box-shadow: #00000056 0 -3px 0 3px inset;
        border: none;
        border-radius: 6px;
        font-family: 'Silkscreen', sans-serif;
        text-align: left;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background-color 0.1s ease;
    }

    .choice-btn:hover,
    .choice-btn:focus {
        background-color: #51bfc1;
        color: #343a40;
    }

    .choice-btn:hover .hotkey,
    .choice-btn:focus .hotkey {
        color: #343a40;
    }

    .choice-label {
        color: var(--text-muted);
    }

    .choice-btn:hover .choice-label,
    .choice-btn:focus .choice-label {
        color: #343a40;
    }

    .hotkey {
        color: #ffffff56;
        flex-shrink: 0;
    }
</style>