<script lang="ts">
    import type { FarmPlot, Prerequisite, TechNode } from '$lib/types';
    import { playerStore } from '$lib/stores/playerStore';
    import { skillTreeStore } from '$lib/stores/skillTreeStore';
    import * as FarmingService from '$lib/services/FarmingService';
    import { derived } from 'svelte/store';
    
    export let plot: FarmPlot;
    
    // Get ALL tech that COULD be applied to this plot (unlocked + meets requirements)
    const applicableTech = derived([playerStore, skillTreeStore], ([$playerStore, $skillTreeStore]) => {
        const techNodes = Array.from($skillTreeStore.techNodes.values());
        const filtered = techNodes.filter(node => {
            // Only consider tech nodes that are buildable on a plot
            if (!node.id.startsWith('tech_')) {
                return false;
            }
            // Check if player has unlocked the tech globally
            if (!$playerStore.unlockedTech.includes(node.id)) {
                return false;
            }
            // Check applicableTo requirements
            if (node.applicableTo) {
                if (node.applicableTo.environments) {
                    if (!node.applicableTo.environments.includes(plot.environment)) {
                        return false;
                    }
                }
                if (node.applicableTo.tech) {
                    if (!node.applicableTo.tech.every(requiredTech => plot.appliedTech.includes(requiredTech))) {
                        return false;
                    }
                }
            } else {
                return false; 
            }
            return true;
        });
        return filtered;
    });
    
    function handleTechClick(techId: string, event: Event) {
        event.preventDefault();
        
        const isApplied = plot.appliedTech.includes(techId);
        
        // Only apply if not already applied
        if (!isApplied && plot.id) {
            FarmingService.applyTechToPlot(plot.id, techId);
        }
    }
</script>

<div class="plot-actions">
    {#if $applicableTech.length > 0}
        <div class="tech-grid">
            {#each $applicableTech as tech (tech.id)}
                {@const isApplied = plot.appliedTech.includes(tech.id)}
                <label class="tech-option" class:applied={isApplied}>
                    <input 
                        type="checkbox" 
                        checked={isApplied}
                        disabled={isApplied}
                        on:click={(e) => handleTechClick(tech.id, e)}
                    />
                    <span class="tech-name">{tech.name}</span>
                    {#if isApplied}
                        <span class="applied-badge">✓</span>
                    {/if}
                </label>
            {/each}
        </div>
    {:else}
        <p class="no-tech-message">No tech available for this plot.</p>
    {/if}
</div>

<style>
    .plot-actions {
        position: relative;
        width: 100%;
        height: 100%;
        /* border: 1px solid salmon; */
        margin: 0 auto;
        scrollbar-width: none;
    }
    
    .tech-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        /* gap: 0.5rem; */
    }
    
    .tech-option {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem;
        background-color: transparent;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        user-select: none;
    }
    
    .tech-option:hover:not(.applied) {
        background: #e9ecef;
        border-color: #adb5bd;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        color: black;
        .tech-name {
            color: black;
        }
    }
    
    .tech-option.applied {
        background: #e9ecef;
        border-color: #6c757d;
        cursor: not-allowed;
        opacity: 0.7;
    }
    
    .tech-option input[type="checkbox"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
        flex-shrink: 0;
        accent-color: #28a745;
    }
    
    .tech-option.applied input[type="checkbox"] {
        cursor: not-allowed;
    }
    
    .tech-name {
        flex: 1;
        font-weight: 500;
        color: #ffffff;
        transition: all 0.3s ease;
    }
    
    .tech-option.applied .tech-name {
        color: #6c757d;
        text-decoration: line-through;
    }
    
    .applied-badge {
        width: 20px;
        height: 20px;
        background: #28a745;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        flex-shrink: 0;
    }
    
    .no-tech-message {
        text-align: center;
        padding: 2rem;
        color: #6c757d;
        font-style: italic;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .tech-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 0.5rem;
        }
        
        .tech-option {
            padding: 0.5rem;
        }
    }
</style>