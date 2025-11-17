<script lang="ts">
    import { farmingTechTree } from '$lib/data/skilltree/farming';
    import type { TechNode } from '$lib/types';
    import { playerStore } from '$lib/stores/playerStore';

    // Group techs by unlock level for a structured view
    const techsByLevel: { [level: number]: TechNode[] } = {};
    farmingTechTree.forEach(tech => {
        const level = tech.unlockLevel;
        if (!techsByLevel[level]) {
            techsByLevel[level] = [];
        }
        techsByLevel[level].push(tech);
    });

    const sortedLevels = Object.keys(techsByLevel).map(Number).sort((a, b) => a - b);

</script>

<div class="skill-tree-container">
    <h1>Farming Skill Tree</h1>
    <p class="tech-points">Available Tech Points: {$playerStore.techPoints}</p>
    
    {#each sortedLevels as level}
        <div class="level-group">
            <h2 class="level-header">Level {level}</h2>
            <div class="tech-grid">
                {#each techsByLevel[level] as tech (tech.id)}
                    {@const isUnlocked = $playerStore.unlockedTech.includes(tech.id)}
                    <div class="tech-node" class:unlocked={isUnlocked}>
                        <h3 class="tech-name">{tech.name}</h3>
                        <p class="tech-description">{tech.description}</p>
                        <div class="tech-footer">
                            <span class="tech-cost">Cost: {tech.costTP} TP</span>
                            {#if !isUnlocked}
                                <button class="unlock-button" disabled={true} title="Unlocking not yet implemented">
                                    Unlock
                                </button>
                            {/if}
                        </div>
                        {#if tech.prerequisites && tech.prerequisites.length > 0}
                            <div class="prerequisites">
                                <strong>Requires:</strong>
                                {#each tech.prerequisites as prereq, i}
                                    <span>
                                        {typeof prereq === 'string' ? farmingTechTree.find(t => t.id === prereq)?.name || prereq : 'Multiple'}
                                    </span>
                                {/each}
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    {/each}
</div>

<style>
    .skill-tree-container {
        padding: 1rem;
    }

    h1 {
        text-align: center;
        color: #61dafb;
        margin-bottom: 0.5rem;
    }

    .tech-points {
        text-align: center;
        font-size: 1.2rem;
        margin-bottom: 2rem;
        color: #ffeb3b;
    }

    .level-group {
        margin-bottom: 2rem;
    }

    .level-header {
        border-bottom: 2px solid #444;
        padding-bottom: 0.5rem;
        margin-bottom: 1rem;
        color: #aaa;
    }

    .tech-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
    }

    .tech-node {
        background-color: rgba(0,0,0,0.2);
        border: 1px solid #555;
        border-left: 5px solid #555;
        border-radius: 5px;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        transition: border-color 0.3s ease;
    }

    .tech-node.unlocked {
        border-left-color: #4caf50;
    }

    .tech-name {
        margin: 0 0 0.5rem 0;
        color: #eee;
    }

    .tech-description {
        font-size: 0.9rem;
        color: #ccc;
        flex-grow: 1;
        margin-bottom: 1rem;
    }

    .tech-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: auto;
    }

    .tech-cost {
        font-weight: bold;
        color: #ffeb3b;
    }

    .unlock-button {
        padding: 0.3rem 0.8rem;
        background-color: #666;
        color: #ddd;
        border: none;
        border-radius: 4px;
        cursor: not-allowed;
    }

    .prerequisites {
        font-size: 0.8rem;
        color: #999;
        margin-top: 1rem;
        border-top: 1px dashed #444;
        padding-top: 0.5rem;
    }
</style>
