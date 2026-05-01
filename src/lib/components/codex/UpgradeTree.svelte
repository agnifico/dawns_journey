<script lang="ts">
    import { farmingTechTree } from '$lib/data/skilltree/farming';
    import type { TechNode } from '$lib/types';
    import { playerStore } from '$lib/stores/playerStore';
    import { skillTreeStore } from '$lib/stores/skillTreeStore';

    // IDs treated as special / legendary nodes
    const SPECIAL_IDS = new Set(['hire_sylvie', 'thunders_blessing', 'decree_of_gaia']);

    const techsByLevel: { [level: number]: TechNode[] } = {};
    farmingTechTree.forEach(tech => {
        const lvl = tech.unlockLevel;
        if (!techsByLevel[lvl]) techsByLevel[lvl] = [];
        techsByLevel[lvl].push(tech);
    });
    const sortedLevels = Object.keys(techsByLevel).map(Number).sort((a, b) => a - b);

    function getPrereqLabel(prereq: any): string {
        if (typeof prereq === 'string') {
            return farmingTechTree.find(t => t.id === prereq)?.name ?? prereq;
        }
        if (prereq.operator === 'OR')  return prereq.items.map(getPrereqLabel).join(' or ');
        if (prereq.operator === 'AND') return prereq.items.map(getPrereqLabel).join(' + ');
        return '?';
    }
</script>

<div class="tree-container">
    <!-- TP banner -->
    <div class="tp-banner">
        <span class="tp-label">Available Tech Points</span>
        <span class="tp-value">{$playerStore.techPoints}</span>
    </div>

    {#each sortedLevels as level}
        <!-- Tier divider -->
        <div class="tier-divider">
            <span class="tier-label">Lv {level}</span>
            <div class="tier-line" />
        </div>

        <!-- Node grid -->
        <div class="tech-grid">
            {#each techsByLevel[level] as tech (tech.id)}
                {@const isUnlocked   = $playerStore.unlockedTech.includes(tech.id)}
                {@const canAfford    = $playerStore.techPoints >= tech.costTP}
                {@const prereqsMet   = skillTreeStore.checkPrerequisites(tech.prerequisites, $playerStore.unlockedTech)}
                {@const levelMet     = $playerStore.farmingLevel >= tech.unlockLevel}
                {@const canUnlock    = !isUnlocked && canAfford && prereqsMet && levelMet}
                {@const isSpecial    = SPECIAL_IDS.has(tech.id)}
                {@const isAvailable  = !isUnlocked && prereqsMet && levelMet}

                <div
                    class="tech-node"
                    class:unlocked={isUnlocked}
                    class:available={isAvailable}
                    class:special={isSpecial}
                >
                    <!-- State accent bar -->
                    <div class="accent-bar" />

                    <div class="node-body">
                        <!-- Top row: name + cost badge -->
                        <div class="node-top">
                            <span class="node-name" class:special-name={isSpecial}>{tech.name}</span>
                            <span class="cost-badge" class:free={tech.costTP === 0} class:special-cost={isSpecial}>
                                {tech.costTP === 0 ? 'Free' : `${tech.costTP} TP`}
                            </span>
                        </div>

                        <!-- Description -->
                        <p class="node-desc">{tech.description}</p>

                        <!-- Prerequisites chips -->
                        {#if tech.prerequisites && tech.prerequisites.length > 0}
                            <div class="prereq-row">
                                <span class="prereq-label">Req:</span>
                                {#each tech.prerequisites as prereq}
                                    <span class="prereq-chip">{getPrereqLabel(prereq)}</span>
                                {/each}
                            </div>
                        {/if}

                        <!-- Footer: unlock state -->
                        <div class="node-footer">
                            {#if isUnlocked}
                                <span class="state-tag unlocked-tag">✓ Unlocked</span>
                            {:else}
                                <button
                                    class="unlock-btn"
                                    class:ready={canUnlock}
                                    class:special-btn={isSpecial && canUnlock}
                                    disabled={!canUnlock}
                                    title={
                                        !levelMet    ? `Requires Farming Lv${tech.unlockLevel}` :
                                        !prereqsMet  ? 'Prerequisites not met' :
                                        !canAfford   ? `Need ${tech.costTP} TP` :
                                        'Click to unlock'
                                    }
                                    on:click={() => skillTreeStore.unlockTech(tech.id)}
                                >
                                    {#if !levelMet}Lv{tech.unlockLevel} Required
                                    {:else if !prereqsMet}Locked
                                    {:else if !canAfford}Need {tech.costTP} TP
                                    {:else}Unlock{/if}
                                </button>
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/each}
</div>

<style>
    .tree-container {
        padding: 1rem 1.25rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0;
    }

    /* ── TP Banner ── */
    .tp-banner {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 0.6rem 1rem;
        margin-bottom: 1rem;
        background: rgba(0,0,0,0.25);
        border: 1px solid #2a4a2a;
        border-radius: 6px;
        box-shadow: rgba(0,0,0,0.4) 0 -2px 0 0 inset;
    }

    .tp-label {
        font-size: 0.75rem;
        color: #5a7a5a;
        text-transform: uppercase;
        letter-spacing: 0.1em;
    }

    .tp-value {
        font-size: 1.1rem;
        color: #f0d060;
        text-shadow: 0 0 10px rgba(240, 208, 96, 0.4);
    }

    /* ── Tier divider ── */
    .tier-divider {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 1rem 0 0.6rem;
    }

    .tier-label {
        font-size: 0.75rem;
        color: #4a6a4a;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        white-space: nowrap;
        flex-shrink: 0;
    }

    .tier-line {
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, #2a4a2a, transparent);
    }

    /* ── Tech grid ── */
    .tech-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 8px;
    }

    /* ── Node card ── */
    .tech-node {
        display: flex;
        background: rgba(0,0,0,0.22);
        border: 1px solid #253525;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: rgba(0,0,0,0.45) 0 -3px 0 0 inset;
        opacity: 0.6;
        transition: opacity 0.2s, border-color 0.2s;
    }

    .tech-node.available {
        opacity: 1;
        border-color: #3a6a3a;
    }

    .tech-node.unlocked {
        opacity: 1;
        border-color: #2a5a2a;
        background: rgba(0,0,0,0.15);
    }

    .tech-node.special {
        border-color: #5a4a10;
        background: rgba(20, 14, 0, 0.35);
    }

    .tech-node.special.available {
        border-color: #8a6a10;
    }

    .tech-node.special.unlocked {
        border-color: #6a8a20;
        background: rgba(10,20,0,0.3);
    }

    /* ── Accent bar ── */
    .accent-bar {
        width: 4px;
        align-self: stretch;
        flex-shrink: 0;
        background: #253525;
        transition: background 0.2s;
    }

    .tech-node.available  .accent-bar { background: linear-gradient(180deg, #f0d060, #c88020); }
    .tech-node.unlocked   .accent-bar { background: linear-gradient(180deg, #74d496, #399e80); }
    .tech-node.special.available .accent-bar { background: linear-gradient(180deg, #f8e890, #e0a030); }
    .tech-node.special.unlocked  .accent-bar { background: linear-gradient(180deg, #aacc40, #6a9010); }

    /* ── Node body ── */
    .node-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 9px 11px 9px 10px;
        min-width: 0;
    }

    /* Top row */
    .node-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
    }

    .node-name {
        font-size: 0.85rem;
        color: #c0e0c0;
        letter-spacing: 0.04em;
        line-height: 1.3;
        flex: 1;
        min-width: 0;
    }

    .node-name.special-name {
        color: #f0e090;
    }

    .cost-badge {
        font-size: 0.75rem;
        background: rgba(0,0,0,0.3);
        border: 1px solid #3a5a3a;
        border-radius: 3px;
        padding: 1px 6px;
        color: #f0d060;
        white-space: nowrap;
        flex-shrink: 0;
        box-shadow: 0 1px 0 #1a2a1a;
    }

    .cost-badge.free {
        color: #7aaa7a;
        border-color: #2a5a2a;
    }

    .cost-badge.special-cost {
        color: #f8e060;
        border-color: #7a5a10;
        background: rgba(30,20,0,0.4);
    }

    /* Description */
    .node-desc {
        font-size: 0.78rem;
        color: #6a8a6a;
        line-height: 1.5;
        margin: 0;
        font-style: italic;
    }

    /* Prereq chips */
    .prereq-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        padding-top: 4px;
        border-top: 1px solid rgba(255,255,255,0.04);
    }

    .prereq-label {
        font-size: 0.75rem;
        color: #4a6a4a;
        letter-spacing: 0.06em;
        flex-shrink: 0;
    }

    .prereq-chip {
        font-size: 0.75rem;
        color: #7a9a7a;
        background: rgba(0,0,0,0.25);
        border: 1px solid #2a4a2a;
        border-radius: 3px;
        padding: 1px 6px;
    }

    /* Footer */
    .node-footer {
        margin-top: 4px;
        display: flex;
        justify-content: flex-end;
    }

    .state-tag {
        font-size: 0.75rem;
        letter-spacing: 0.06em;
        padding: 2px 8px;
        border-radius: 3px;
    }

    .unlocked-tag {
        color: #5aaa6a;
        background: rgba(0,80,20,0.2);
        border: 1px solid #2a5a2a;
    }

    /* Unlock button */
    .unlock-btn {
        font-family: var(--font-family-pixel, monospace);
        font-size: 0.75rem;
        padding: 4px 12px 7px;
        border-radius: 4px;
        cursor: not-allowed;
        border: 2px solid #253525;
        background: #1a2a1a;
        color: #4a6a4a;
        box-shadow: rgba(0,0,0,0.5) 0 -3px 0 0 inset;
        transition: 0.1s all ease-in;
        letter-spacing: 0.04em;
    }

    .unlock-btn.ready {
        cursor: pointer;
        background: #2a4a1a;
        border-color: #4a8a2a;
        color: #a0d860;
        box-shadow: rgba(0,0,0,0.5) 0 -3px 0 0 inset;
    }

    .unlock-btn.ready:hover {
        background: #355a22;
        padding-bottom: 4px;
        box-shadow: rgba(0,0,0,0.5) 0 -1px 0 0 inset;
    }

    .unlock-btn.ready:active {
        transform: translateY(2px);
        box-shadow: none;
        padding-bottom: 4px;
    }

    .unlock-btn.special-btn {
        background: linear-gradient(180deg, #4a3a08 0%, #2a2008 100%);
        border-color: #8a6a10;
        color: #f0d060;
        box-shadow: rgba(0,0,0,0.6) 0 -3px 0 0 inset, 0 0 8px rgba(240,200,60,0.15);
    }

    .unlock-btn.special-btn:hover {
        filter: brightness(1.2);
    }
</style>