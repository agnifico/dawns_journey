<script lang="ts">
    import { farmingTechTree } from '$lib/data/skilltree/farming';
    import type { TechNode } from '$lib/types';
    import { playerStore } from '$lib/stores/playerStore';
    import { skillTreeStore } from '$lib/stores/skillTreeStore';

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

    function getPrereqName(prereq: any): string {
        if (typeof prereq === 'string') {
            return farmingTechTree.find(t => t.id === prereq)?.name || prereq;
        }
        if (prereq.operator === 'OR') {
            return prereq.items.map(getPrereqName).join(' OR ');
        }
        if (prereq.operator === 'AND') {
            return prereq.items.map(getPrereqName).join(' AND ');
        }
        return 'Unknown';
    }

</script>

<div class="skill-tree-container">
    <h1>Farming Upgrade Tree</h1>
    <p class="tech-points">Available Tech Points: {$playerStore.techPoints}</p>
    
    {#each sortedLevels as level}
        <div class="level-group">
            <h2 class="level-header">Level {level} Unlocks</h2>
            <div class="tech-grid">
                {#each techsByLevel[level] as tech (tech.id)}
                    {@const isUnlocked = $playerStore.unlockedTech.includes(tech.id)}
                    {@const canAfford = $playerStore.techPoints >= tech.costTP}
                    {@const prereqsMet = skillTreeStore.checkPrerequisites(tech.prerequisites, $playerStore.unlockedTech)}
                    {@const levelMet = $playerStore.farmingLevel >= tech.unlockLevel}
                    {@const canUnlock = !isUnlocked && canAfford && prereqsMet && levelMet}
                    
                    <div class="tech-node" class:unlocked={isUnlocked} class:can-unlock={canUnlock}>
                        <h3 class="tech-name">{tech.name}</h3>
                        <p class="tech-description">{tech.description}</p>

                        {#if tech.prerequisites && tech.prerequisites.length > 0}
                            <div class="prerequisites">
                                <strong>Requires:</strong>
                                <span>{tech.prerequisites.map(getPrereqName).join(', ')}</span>
                            </div>
                        {/if}

                        <div class="tech-footer">
                            <span class="tech-cost">Cost: {tech.costTP} TP</span>
                            {#if !isUnlocked}
                                <button 
                                    class="unlock-button" 
                                    disabled={!canUnlock} 
                                    title={!levelMet ? `Requires Level ${tech.unlockLevel}` : !prereqsMet ? 'Prerequisites not met' : !canAfford ? 'Not enough TP' : 'Click to unlock'}
                                    on:click={() => skillTreeStore.unlockTech(tech.id)}
                                >
                                    Unlock
                                </button>
                            {/if}
                        </div>
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
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
        transition: all 0.3s ease;
        opacity: 0.7;
    }

    .tech-node.unlocked {
        border-left-color: #4caf50;
        opacity: 1;
    }

    .tech-node.can-unlock {
        opacity: 1;
        border-color: #ffeb3b;
        border-left-color: #ffeb3b;
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

    .prerequisites {
        font-size: 0.8rem;
        color: #999;
        margin-bottom: 1rem;
        border-top: 1px dashed #444;
        padding-top: 0.5rem;
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
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    .unlock-button:disabled {
        background-color: #444;
        cursor: not-allowed;
        opacity: 0.6;
    }

    .unlock-button:not(:disabled) {
        background-color: #4caf50;
        color: white;
    }

    .unlock-button:not(:disabled):hover {
        background-color: #66bb6a;
    }
</style>
