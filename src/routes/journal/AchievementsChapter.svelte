<script lang="ts">
    import { playerStore } from '$lib/stores/playerStore';
    import { allAchievements } from '$lib/data/achievements';

    const unlockedAchievements = $playerStore.achievements;
</script>

<div class="achievements-list">
    <h2>Achievements</h2>
    <ul>
        {#each allAchievements as achievement}
            {@const isUnlocked = unlockedAchievements[achievement.id]?.unlocked}
            <li class:unlocked={isUnlocked}>
                <div class="achievement-info">
                    <h3>{isUnlocked || !achievement.isSecret ? achievement.name : '???'}</h3>
                    <p>{isUnlocked || !achievement.isSecret ? achievement.description : '???'}</p>
                    
                    {#if achievement.tiers}
                        <ul class="tier-list">
                            {#each Object.entries(achievement.tiers) as [tier, tierData]}
                                {@const currentTier = unlockedAchievements[achievement.id]?.currentTier || 0}
                                {@const isTierUnlocked = parseInt(tier) <= currentTier}
                                <li class="tier-item" class:unlocked={isTierUnlocked}>
                                    <span>Tier {tier}: {tierData.threshold}</span>
                                    <span>{isTierUnlocked ? '✓' : '✗'}</span>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </div>
                <div class="achievement-status">
                    {#if achievement.tiers}
                        {@const currentTier = unlockedAchievements[achievement.id]?.currentTier || 0}
                        Tier {currentTier} / {Object.keys(achievement.tiers).length}
                    {:else}
                        {isUnlocked ? 'Unlocked' : 'Locked'}
                    {/if}
                </div>
            </li>
        {/each}
    </ul>
</div>

<style>
    .achievements-list {
        background-color: #fdf6e3;
        padding: 1.5rem;
        border-radius: 8px;
        border: 2px solid #c7895d;
    }
    h2 {
        font-family: 'Silkscreen';
        text-align: center;
        margin-bottom: 1.5rem;
        color: #634041;
    }
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background-color: #fff;
        border-radius: 5px;
        border: 1px solid #ddd;
        opacity: 0.7;
        transition: opacity 0.2s;
    }
    li.unlocked {
        opacity: 1;
        border-color: #859900; /* A green color from the solarized palette */
    }
    .achievement-info {
        flex-grow: 1;
    }
    h3 {
        margin: 0 0 0.25rem 0;
        font-family: 'Silkscreen';
        color: #586e75;
    }
    p {
        margin: 0;
        font-size: 0.9rem;
        color: #657b83;
    }
    .achievement-status {
        font-weight: bold;
        font-family: 'Silkscreen';
    }
    li.unlocked .achievement-status {
        color: #859900;
    }
    li:not(.unlocked) .achievement-status {
        color: #dc322f; /* A red color */
    }
    .tier-list {
        margin-top: 0.5rem;
        padding-left: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    .tier-item {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        opacity: 0.8;
    }
    .tier-item.unlocked {
        opacity: 1;
        color: #586e75;
    }
</style>
