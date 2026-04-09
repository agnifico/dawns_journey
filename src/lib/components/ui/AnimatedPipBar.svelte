<script lang="ts">
    import { fly } from 'svelte/transition';
    export let value: number;       // currentGrowthStage
    export let max: number;         // total stages
    export let isComplete: boolean = false;
</script>

<div class="pip-bar">
    {#each { length: max } as _, i}
        <div
            class="pip"
            class:done={i < value}
            class:current={i === value && !isComplete}
            class:complete={isComplete}
            in:fly={{ y: -4, duration: 220, delay: i * 50 }}
        />
    {/each}
</div>

<style>
    .pip-bar {
        display: flex;
        gap: 3px;
        align-items: center;
    }

    .pip {
        width: 12px;
        height: 8px;
        border-radius: 2px;
        background: #1a2e22;
        border: 1px solid rgba(0, 0, 0, 0.55);
        box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.5);
        transition: background 0.3s, box-shadow 0.3s, border-color 0.3s;
    }

    /* Completed stage */
    .pip.done {
        background: linear-gradient(180deg, #74d496 0%, #399e80 100%);
        border-color: #22c55e;
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(0, 0, 0, 0.3),
            0 0 5px rgba(74, 222, 128, 0.45);
    }

    /* Current stage in progress — dim pulse */
    .pip.current {
        background: #2a4a34;
        border-color: #3a6a44;
        box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.4);
        animation: currentPulse 1.6s ease-in-out infinite;
    }

    /* All done — harvest ready, gold */
    .pip.complete {
        background: linear-gradient(180deg, #f0d060 0%, #c88020 100%);
        border-color: #e0a020;
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 200, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.3),
            0 0 6px rgba(240, 200, 80, 0.5);
        animation: none;
    }

    @keyframes currentPulse {
        0%, 100% { box-shadow: inset 0 -1px 0 rgba(0,0,0,0.4), 0 0 2px rgba(74, 222, 128, 0.1); }
        50%       { box-shadow: inset 0 -1px 0 rgba(0,0,0,0.4), 0 0 7px rgba(74, 222, 128, 0.5); border-color: #5aaa6a; }
    }
</style>