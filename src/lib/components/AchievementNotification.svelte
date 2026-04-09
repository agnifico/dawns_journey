<script lang="ts">
    import { achievementQueue, dismissOne, dismissAll } from '$lib/stores/achievementStore';
    import { flip } from 'svelte/animate';
    import { fly } from 'svelte/transition';
    import type { Achievement } from '$lib/data/achievements';

    function formatReward(reward: any) {
        if (!reward) return '';
        if (reward.type === 'item') return `+${reward.quantity} ${reward.id}`;
        if (reward.type === 'tag') return `New Tag: ${reward.id}`;
        return '';
    }
</script>

{#if $achievementQueue.length > 0}
    <div class="achievement-stack-container">
        {#each $achievementQueue.slice(0, 3).reverse() as achievement, i (achievement.id)}
            {@const isTop = i === 0}
            <div
                class="achievement-notification"
                class:is-top={isTop}
                style:transform="translateY({-i * 14}px) scale({1 - i * 0.04})"
                style:z-index="{1000 - i}"
                style:opacity="{1 - i * 0.25}"
                in:fly={{ y: -40, duration: 350 }}
                animate:flip={{ duration: 300 }}
            >
                <!-- Shimmer sweep on entry -->
                <div class="shimmer" />

                <!-- Left accent bar -->
                <div class="accent-bar" />

                <!-- Trophy icon -->
                <div class="icon-wrap">
                    <span class="trophy">🏆</span>
                </div>

                <!-- Text -->
                <div class="text-content">
                    <span class="eyebrow">Achievement Unlocked</span>
                    <span class="ach-name">{achievement.name}</span>
                    {#if isTop}
                        <p class="ach-desc">{achievement.description}</p>
                        {#if achievement.reward}
                            <span class="reward-pill">✦ {formatReward(achievement.reward)}</span>
                        {/if}
                    {/if}
                </div>

                <!-- Dismiss button — only on top card -->
                {#if isTop}
                    <div class="actions">
                        <button class="okay-btn" on:click={() => dismissOne(achievement.id)}>OK</button>
                        {#if $achievementQueue.length > 1}
                            <button class="dismiss-all-btn" on:click={dismissAll}>All</button>
                        {/if}
                    </div>
                {/if}
            </div>
        {/each}
    </div>
{/if}

<style>
    /* ── Container ─────────────────────────────────────────────────────────── */
    .achievement-stack-container {
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: none;
    }

    /* ── Card ───────────────────────────────────────────────────────────────── */
    .achievement-notification {
        pointer-events: all;
        position: absolute;
        width: 360px;
        display: flex;
        align-items: center;
        gap: 12px;

        /* Forge palette */
        background: linear-gradient(160deg, #1a1408 0%, #0e0c06 100%);
        border: 1px solid #c8a96e;
        border-radius: 6px;
        overflow: hidden;

        padding: 14px 16px 14px 0;

        /* Blocky inset shadow — bottom-heavy like the game UI */
        box-shadow:
            0 6px 0 0 #6b4f10,          /* bottom ledge */
            0 0 0 1px #3a2a08,           /* outer dark ring */
            inset 0 1px 0 rgba(255, 210, 100, 0.15),   /* inner top highlight */
            inset 0 -3px 0 rgba(0, 0, 0, 0.5),         /* inner bottom shadow */
            0 16px 40px rgba(0, 0, 0, 0.7);

        transition: transform 0.3s ease-out, opacity 0.3s ease-out;
    }

    /* Shimmer sweep — plays once on mount via animation */
    .shimmer {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            105deg,
            transparent 30%,
            rgba(255, 210, 100, 0.12) 50%,
            transparent 70%
        );
        background-size: 200% 100%;
        animation: shimmerSweep 0.7s ease-out forwards;
        pointer-events: none;
        z-index: 1;
    }

    @keyframes shimmerSweep {
        from { background-position: 200% 0; }
        to   { background-position: -200% 0; }
    }

    /* ── Left accent bar ────────────────────────────────────────────────────── */
    .accent-bar {
        width: 4px;
        align-self: stretch;
        flex-shrink: 0;
        background: linear-gradient(180deg, #f0d060 0%, #c87820 60%, #7a4010 100%);
        border-radius: 0 2px 2px 0;
    }

    /* ── Trophy ─────────────────────────────────────────────────────────────── */
    .icon-wrap {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(200, 169, 110, 0.08);
        border: 1px solid rgba(200, 169, 110, 0.2);
        border-radius: 4px;

        /* Blocky inset on the icon box too */
        box-shadow:
            inset 0 -2px 0 rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 210, 100, 0.1);
    }

    .trophy {
        font-size: 20px;
        filter: drop-shadow(0 0 6px rgba(240, 200, 60, 0.7));
        animation: trophyPulse 2s ease-in-out infinite;
    }

    @keyframes trophyPulse {
        0%, 100% { filter: drop-shadow(0 0 5px rgba(240, 200, 60, 0.6)); }
        50%       { filter: drop-shadow(0 0 12px rgba(240, 200, 60, 1.0)); }
    }

    /* ── Text ───────────────────────────────────────────────────────────────── */
    .text-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .eyebrow {
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.6rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #c8a96e;
        opacity: 0.75;
    }

    .ach-name {
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.95rem;
        color: #f5e8c0;
        letter-spacing: 0.04em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        /* Gold text glow */
        text-shadow: 0 0 12px rgba(240, 200, 80, 0.45);
    }

    .ach-desc {
        font-size: 0.72rem;
        color: #9e7d4a;
        margin: 4px 0 0;
        line-height: 1.45;
        font-style: italic;
    }

    .reward-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-top: 6px;
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.65rem;
        color: #1a1008;
        background: linear-gradient(135deg, #f0d060, #c88020);
        border-radius: 3px;
        padding: 2px 8px;
        letter-spacing: 0.06em;
        box-shadow:
            0 2px 0 #7a4a08,
            inset 0 1px 0 rgba(255, 255, 200, 0.4);
        width: fit-content;
    }

    /* ── Actions ────────────────────────────────────────────────────────────── */
    .actions {
        display: flex;
        flex-direction: column;
        gap: 5px;
        flex-shrink: 0;
        padding-right: 2px;
    }

    .okay-btn,
    .dismiss-all-btn {
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.65rem;
        letter-spacing: 0.06em;
        border-radius: 3px;
        cursor: pointer;
        padding: 5px 10px;
        transition: filter 0.15s, transform 0.1s;
        border: none;
    }

    .okay-btn:active,
    .dismiss-all-btn:active {
        transform: translateY(2px);
    }

    /* Primary — gold forge button */
    .okay-btn {
        background: linear-gradient(180deg, #e8b840 0%, #a06010 100%);
        color: #1a0e00;
        box-shadow:
            0 3px 0 #5a3008,
            inset 0 1px 0 rgba(255, 240, 160, 0.4),
            inset 0 -2px 0 rgba(0, 0, 0, 0.3);
    }

    .okay-btn:hover {
        filter: brightness(1.15);
    }

    /* Secondary — muted dark */
    .dismiss-all-btn {
        background: #1e1810;
        color: #7a6040;
        box-shadow:
            0 2px 0 #0a0806,
            inset 0 1px 0 rgba(200, 169, 110, 0.08),
            inset 0 -1px 0 rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(200, 169, 110, 0.15);
    }

    .dismiss-all-btn:hover {
        color: #c8a96e;
        border-color: rgba(200, 169, 110, 0.3);
    }
</style>