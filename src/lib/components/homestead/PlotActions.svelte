<script lang="ts">
    import type { FarmPlot, Prerequisite, TechNode } from '$lib/types';
    import { playerStore } from '$lib/stores/playerStore';
    import { skillTreeStore } from '$lib/stores/skillTreeStore';
    import * as FarmingService from '$lib/services/FarmingService';
    import { derived } from 'svelte/store';

    export let plot: FarmPlot;

    let selectedTechToApply: string | null = null;

    const availableBuildables = derived([playerStore, skillTreeStore], ([$playerStore, $skillTreeStore]) => {
        console.log('--- PlotActions: availableBuildables derived store ---');
        console.log('Current Plot Environment:', plot.environment);
        console.log('Player Unlocked Tech:', $playerStore.unlockedTech);
        console.log('Plot Applied Tech:', plot.appliedTech);

        const techNodes = Array.from($skillTreeStore.techNodes.values());
        
        const filtered = techNodes.filter(node => {
            console.log('  Checking node:', node.id);

            // Only consider tech nodes that are buildable on a plot (e.g., tech_ prefix)
            if (!node.id.startsWith('tech_')) {
                console.log('    - Not a tech_ node, skipping.');
                return false;
            }
            
            // Check if player has unlocked the tech globally
            if (!$playerStore.unlockedTech.includes(node.id)) {
                console.log('    - Player has not unlocked tech globally, skipping.');
                return false;
            }

            // Check if already applied to this specific plot
            if (plot.appliedTech.includes(node.id)) {
                console.log('    - Tech already applied to plot, skipping.');
                return false;
            }

            // --- Use the new 'applicableTo' field for filtering ---
            if (node.applicableTo) {
                console.log('    - Node has applicableTo:', node.applicableTo);
                if (node.applicableTo.environments) {
                    if (!node.applicableTo.environments.includes(plot.environment)) {
                        console.log('      - Not applicable to this environment, skipping.');
                        return false; // Not applicable to this environment
                    }
                    console.log('      - Applicable to this environment.');
                }
                if (node.applicableTo.tech) {
                    // Check if the plot has all required applied tech
                    if (!node.applicableTo.tech.every(requiredTech => plot.appliedTech.includes(requiredTech))) {
                        console.log('      - Missing required applied tech on this plot, skipping.');
                        return false; // Missing required applied tech on this plot
                    }
                    console.log('      - Required applied tech present.');
                }
            } else {
                // If 'applicableTo' is not defined, assume it's not a plot-specific tech
                // or it's universally applicable (which should be explicitly defined if so)
                console.log('    - applicableTo is undefined, skipping.');
                return false; 
            }
            console.log('  - Node is buildable:', node.id);
            return true;
        });
        console.log('--- Filtered Buildables:', filtered.map(n => n.id));
        return filtered;
    });

    function handleApplyTech() {
        if (selectedTechToApply && plot.id) {
            FarmingService.applyTechToPlot(plot.id, selectedTechToApply);
            selectedTechToApply = null; // Reset selection
        }
    }
</script>

<div class="plot-actions">
    {#if $availableBuildables.length > 0}
        <select bind:value={selectedTechToApply}>
            <option value={null}>Select Tech</option>
            {#each $availableBuildables as tech}
                <option value={tech.id}>{tech.name}</option>
            {/each}
        </select>
        <button on:click={handleApplyTech} disabled={!selectedTechToApply}>Apply Tech</button>
    {:else}
        <p>No buildable tech available for this plot.</p>
    {/if}
</div>

<style>
    .plot-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1rem;
    }
    select, button {
        width: 100%;
        padding: 0.5rem;
    }
</style>
