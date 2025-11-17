import { writable, get } from 'svelte/store';
import type { TechNode, Prerequisite, Player, FarmPlot } from '$lib/types';
import { playerStore } from './playerStore';
import { messageStore } from './messageStore';

interface SkillTreeState {
    techNodes: Map<string, TechNode>;
    isInitialized: boolean;
}

function createSkillTreeStore() {
    const { subscribe, update } = writable<SkillTreeState>({
        techNodes: new Map(),
        isInitialized: false,
    });

    async function initialize() {
        if (get({ subscribe }).isInitialized) return;

        const modules = import.meta.glob('/src/lib/data/skilltree/*.ts');
        const allNodes: TechNode[] = [];

        for (const path in modules) {
            const module = await modules[path]();
            const key = path.split('/').pop().replace('.ts', '');
            const techTreeData = module[`${key}TechTree`];
            if (techTreeData) {
                allNodes.push(...techTreeData);
            }
        }

        const nodeMap = new Map(allNodes.map(node => [node.id, node]));
        update(state => ({ ...state, techNodes: nodeMap, isInitialized: true }));
    }

    function checkPrerequisites(prerequisites: Prerequisite[], unlockedTech: string[]): boolean {
        return prerequisites.every(prereq => {
            if (typeof prereq === 'string') {
                return unlockedTech.includes(prereq);
            }
            if (prereq.operator === 'OR') {
                return prereq.items.some(item => unlockedTech.includes(item));
            }
            if (prereq.operator === 'AND') {
                return prereq.items.every(item => unlockedTech.includes(item));
            }
            return false;
        });
    }

    function unlockTech(nodeId: string) {
        const player = get(playerStore);
        const node = get({ subscribe }).techNodes.get(nodeId);

        if (!node) {
            messageStore.addMessage('Tech node not found.', ['System']);
            return;
        }

        if (player.unlockedTech.includes(nodeId)) {
            messageStore.addMessage('You have already unlocked this.', ['System']);
            return;
        }

        if (player.farmingLevel < node.unlockLevel) {
            messageStore.addMessage(`Requires Farming Level ${node.unlockLevel}.`, ['System']);
            return;
        }

        if (player.techPoints < node.costTP) {
            messageStore.addMessage(`You need ${node.costTP} Tech Points.`, ['System']);
            return;
        }

        if (!checkPrerequisites(node.prerequisites, player.unlockedTech)) {
            messageStore.addMessage('You have not met the prerequisites.', ['System']);
            return;
        }

        playerStore.update(p => {
            const newPlayer = {
                ...p,
                techPoints: p.techPoints - node.costTP,
                unlockedTech: [...p.unlockedTech, nodeId],
            };

            // Handle special unlocks for environments and plot expansions
            switch (nodeId) {
                case 'env_greenhouse':
                    // Add initial 6 plots for Greenhouse
                    for (let i = 0; i < 6; i++) {
                        newPlayer.homestead.farmPlots.push({
                            id: `greenhouse_plot_${i + 1}`,
                            x: i % 3, // Example coordinates
                            y: Math.floor(i / 3),
                            environment: 'env_greenhouse',
                            crop: null,
                            appliedTech: []
                        });
                    }
                    break;
                case 'env_forest_floor':
                    // Add initial 6 plots for Forest Floor
                    for (let i = 0; i < 6; i++) {
                        newPlayer.homestead.farmPlots.push({
                            id: `forest_plot_${i + 1}`,
                            x: i % 3, // Example coordinates
                            y: Math.floor(i / 3),
                            environment: 'env_forest_floor',
                            crop: null,
                            appliedTech: []
                        });
                    }
                    break;
                case 'upgrade_open_field_plots':
                    // Add 4 more plots to Open Field
                    const currentOpenFieldPlots = newPlayer.homestead.farmPlots.filter(plot => plot.environment === 'env_open_field').length;
                    for (let i = 0; i < 4; i++) {
                        newPlayer.homestead.farmPlots.push({
                            id: `plot_${currentOpenFieldPlots + i + 1}`,
                            x: (currentOpenFieldPlots + i) % 4, // Example coordinates
                            y: Math.floor((currentOpenFieldPlots + i) / 4),
                            environment: 'env_open_field',
                            crop: null,
                            appliedTech: []
                        });
                    }
                    break;
                case 'upgrade_greenhouse_plots':
                    // Add 4 more plots to Greenhouse
                    const currentGreenhousePlots = newPlayer.homestead.farmPlots.filter(plot => plot.environment === 'env_greenhouse').length;
                    for (let i = 0; i < 4; i++) {
                        newPlayer.homestead.farmPlots.push({
                            id: `greenhouse_plot_${currentGreenhousePlots + i + 1}`,
                            x: (currentGreenhousePlots + i) % 4,
                            y: Math.floor((currentGreenhousePlots + i) / 4),
                            environment: 'env_greenhouse',
                            crop: null,
                            appliedTech: []
                        });
                    }
                    break;
                case 'upgrade_forest_floor_plots':
                    // Add 4 more plots to Forest Floor
                    const currentForestFloorPlots = newPlayer.homestead.farmPlots.filter(plot => plot.environment === 'env_forest_floor').length;
                    for (let i = 0; i < 4; i++) {
                        newPlayer.homestead.farmPlots.push({
                            id: `forest_plot_${currentForestFloorPlots + i + 1}`,
                            x: (currentForestFloorPlots + i) % 4,
                            y: Math.floor((currentForestFloorPlots + i) / 4),
                            environment: 'env_forest_floor',
                            crop: null,
                            appliedTech: []
                        });
                    }
                    break;
            }

            return newPlayer;
        });

        messageStore.addMessage(`Unlocked: ${node.name}!`, ['World', 'Update']);
    }

    return {
        subscribe,
        initialize,
        unlockTech,
        checkPrerequisites, // Exposing for UI logic if needed
    };
}

export const skillTreeStore = createSkillTreeStore();