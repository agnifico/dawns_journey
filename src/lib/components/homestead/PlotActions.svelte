<script lang="ts">
    import type { FarmPlot } from '$lib/types';
    import { playerStore } from '$lib/stores/playerStore';
    import { skillTreeStore } from '$lib/stores/skillTreeStore';
    import * as FarmingService from '$lib/services/FarmingService';
    import { derived } from 'svelte/store';

    export let plot: FarmPlot;

    const applicableTech = derived([playerStore, skillTreeStore], ([$playerStore, $skillTreeStore]) => {
        const techNodes = Array.from($skillTreeStore.techNodes.values());
        return techNodes.filter((node) => {
            if (!node.id.startsWith('tech_')) return false;
            if (!$playerStore.unlockedTech.includes(node.id)) return false;
            if (node.applicableTo) {
                if (node.applicableTo.environments && !node.applicableTo.environments.includes(plot.environment)) return false;
                if (node.applicableTo.tech && !node.applicableTo.tech.every((t: string) => plot.appliedTech.includes(t))) return false;
            } else {
                return false;
            }
            return true;
        });
    });

    function handleToggle(techId: string) {
        if (!plot.appliedTech.includes(techId) && plot.id) {
            FarmingService.applyTechToPlot(plot.id, techId);
        }
    }
</script>

<div class="plot-actions">
    {#if $applicableTech.length > 0}
        <div class="tech-list">
            {#each $applicableTech as tech (tech.id)}
                {@const isApplied = plot.appliedTech.includes(tech.id)}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                    class="tech-row"
                    class:applied={isApplied}
                    on:click={() => handleToggle(tech.id)}
                    role="button"
                    tabindex="0"
                >
                    <span class="tech-name">{tech.name}</span>
                    <div class="toggle-track" class:on={isApplied}>
                        <div class="toggle-knob" />
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <p class="no-tech">No tech available for this plot.</p>
    {/if}
</div>

<style>
    .plot-actions { width: 100%; }

    .tech-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .tech-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        background: #2a3e2a;
        border: 2px solid #1a2e1a;
        border-radius: 8px;
        cursor: pointer;
        box-shadow: #000 0 -3px 0 0 inset;
        transition: background 0.15s;
        user-select: none;
    }

    .tech-row:hover:not(.applied) {
        background: #354a35;
    }

    .tech-row.applied {
        cursor: default;
        background: #1e3020;
        border-color: #2a5030;
    }

    .tech-name {
        font-family: var(--font-family-pixel);
        font-size: 0.7rem;
        color: #b0c8b0;
        text-transform: capitalize;
        letter-spacing: 0.04em;
    }

    .tech-row.applied .tech-name {
        color: #6aaa7a;
    }

    /* ── Sliding toggle ── */
    .toggle-track {
        position: relative;
        width: 38px;
        height: 20px;
        border-radius: 10px;
        background: #1a2a1a;
        border: 2px solid #0a1a0a;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
        transition: background 0.25s, border-color 0.25s, box-shadow 0.25s;
        flex-shrink: 0;
    }

    .toggle-track.on {
        background: #256830;
        border-color: #3a8a4a;
        box-shadow:
            inset 0 2px 4px rgba(0, 0, 0, 0.3),
            0 0 8px rgba(74, 222, 128, 0.3);
    }

    .toggle-knob {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #5a7a5a;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
        transition: transform 0.25s cubic-bezier(0.34, 1.3, 0.64, 1), background 0.25s;
    }

    .toggle-track.on .toggle-knob {
        transform: translateX(18px);
        background: #90e890;
        box-shadow: 0 0 5px rgba(144, 232, 144, 0.7), 0 1px 3px rgba(0, 0, 0, 0.4);
    }

    .no-tech {
        font-family: var(--font-family-pixel);
        font-size: 0.7rem;
        color: #6a7a6a;
        font-style: italic;
        text-align: center;
        padding: 0.75rem 0;
    }
</style>