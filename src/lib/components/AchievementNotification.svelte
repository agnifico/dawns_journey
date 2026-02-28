<script lang="ts">
    import { achievementQueue, dismissOne, dismissAll } from '$lib/stores/achievementStore';
    import { flip } from 'svelte/animate';
    import { fly } from 'svelte/transition';
    import type { Achievement } from '$lib/data/achievements';

    function formatReward(reward: any) {
        if (!reward) return '';
        if (reward.type === 'item') {
            return `+${reward.quantity} ${reward.id}`;
        }
        if (reward.type === 'tag') {
            return `New Tag: ${reward.id}`;
        }
        return '';
    }
</script>

{#if $achievementQueue.length > 0}
    <div class="achievement-stack-container">
        <div class="dismiss-all-container">
            <button class="dismiss-all-btn" on:click={dismissAll}>Dismiss All</button>
        </div>
        {#each $achievementQueue.slice(0, 3).reverse() as achievement, i (achievement.id)}
            {@const isTop = i === 0}
            <div
                class="achievement-notification"
                style:transform="translateY({-i * 10}px) scale({1 - i * 0.05})"
                style:z-index="{1000 - i}"
                in:fly={{ y: -30, duration: 300 }}
                animate:flip={{ duration: 300 }}
            >
                <div class="icon">🏆</div>
                <div class="text-content">
                    <div class="title">Achievement Unlocked!</div>
                    <div class="name">{achievement.name}</div>
                    <p>{achievement.description}</p>
                    {#if achievement.reward}
                        <div class="reward">Reward: {formatReward(achievement.reward)}</div>
                    {/if}
                </div>
                {#if isTop}
                    <button class="okay-btn" on:click={() => dismissOne(achievement.id)}>Okay</button>
                {/if}
            </div>
        {/each}
    </div>
{/if}

<style>
    .achievement-stack-container {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
        /* border: 1px solid white; */
    }

    .achievement-notification {
        position: absolute;
        background-color: #2a2a3e;
        color: #fff;
        padding: 12px 20px;
        border-radius: 8px;
        border: 1px solid #4a4a6a;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        font-family: 'Arial', sans-serif;
        width: 350px;
        transition: transform 0.3s ease-out;
    }

    .icon {
        font-size: 24px;
        margin-right: 15px;
    }

    .text-content {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .title {
        font-size: 12px;
        color: #aaa;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .name {
        font-size: 16px;
        font-weight: bold;
        color: #f0f0f0;
    }

    .reward {
        font-size: 14px;
        color: #aaffaa;
        margin-top: 4px;
    }

    .okay-btn {
        background-color: #5e5edc;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        transition: background-color 0.2s ease;
    }

    .okay-btn:hover {
        background-color: #7878f0;
    }

    .dismiss-all-container {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: 150px;
    }

    .dismiss-all-btn {
        background-color: #4a4a6a;
        color: #e0e0e0;
        border: 1px solid #63638c;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        transition: background-color 0.2s ease;
    }

    .dismiss-all-btn:hover {
        background-color: #63638c;
    }
</style>
