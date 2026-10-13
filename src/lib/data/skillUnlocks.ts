// What each skill unlocks, by level, collected from the data the game already
// uses: resource nodes (gathering), crafting + material recipes, crops and fish.
// New nodes / recipes / crops / fish show up on the Skills page automatically.

import { resourceNodeDefinitions } from './resourceNodeDefinitions';
import { craftingRecipes } from './craftingRecipes';
import { materialRecipes } from './materialRecipes';
import { cropDefinitions } from './cropDefinitions';
import { FISH, ZONE_NAMES, RARITY_XP } from './fishing';
import { getItemById } from '$lib/services/InventoryService';

export type UnlockKind = 'gather' | 'craft' | 'grow' | 'catch';

export interface SkillUnlock {
	kind: UnlockKind;
	id: string;
	name: string;
	level: number;
	image: string;
	/** XP per action. Gathering XP shrinks as the skill levels up, so it's a function. */
	xp: (skillLevel: number) => number;
	/** What the action gives, e.g. "2× Wood" */
	yields?: string;
	/** Collectibles (fish): shown as an unknown silhouette until it's in player.fishLog. */
	collectId?: string;
}

const itemName = (id: string) => getItemById(id)?.name ?? id;
const itemImage = (id: string) => getItemById(id)?.image ?? '';

// Same formula as InteractionService.gatherResource
const gatherXp = (xpPerLevel: number) => (skillLevel: number) =>
	Math.max(1, Math.floor(xpPerLevel / Math.max(1, skillLevel)));

function buildUnlocks(): Record<string, SkillUnlock[]> {
	const bySkill: Record<string, SkillUnlock[]> = {};
	const add = (skillId: string, u: SkillUnlock) => (bySkill[skillId] ??= []).push(u);

	for (const node of Object.values(resourceNodeDefinitions)) {
		add(node.skillId, {
			kind: 'gather',
			id: node.id,
			name: node.name,
			level: node.requiredLevel,
			image: node.image.replace(/^\.\//, '/'),
			xp: gatherXp(node.xpPerLevel),
			yields: `${node.reward.amount}× ${itemName(node.reward.itemId)}`
		});
	}

	for (const r of [...craftingRecipes, ...materialRecipes]) {
		if (!r.skillId) continue;
		add(r.skillId, {
			kind: 'craft',
			id: r.id,
			// Some recipes reuse a placeholder name; the output item's name is the truth
			name: itemName(r.output.itemId) || r.name,
			level: r.requiredLevel ?? 1,
			image: itemImage(r.output.itemId) || r.image,
			xp: () => r.xpYield ?? 0,
			yields: r.output.quantity > 1 ? `${r.output.quantity}×` : undefined
		});
	}

	for (const crop of Object.values(cropDefinitions)) {
		add('farming', {
			kind: 'grow',
			id: crop.id,
			name: crop.name,
			level: crop.unlockLevel,
			image: itemImage(crop.yields),
			xp: () => crop.xpYield ?? 0,
			yields: `${crop.yieldsAmount}× ${itemName(crop.yields)}`
		});
	}

	for (const f of FISH) {
		const when = [f.time === 'any' ? '' : f.time, f.seasons.join('/')].filter(Boolean).join(' · ');
		add('fishing', {
			kind: 'catch',
			id: f.id,
			name: f.name,
			level: f.level,
			image: f.image,
			xp: () => RARITY_XP[f.rarity],
			yields: f.zones.map((z) => ZONE_NAMES[z]).join(', ') + (when ? ` · ${when}` : ''),
			collectId: f.id
		});
	}

	for (const list of Object.values(bySkill)) {
		list.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
	}
	return bySkill;
}

export const skillUnlocks = buildUnlocks();
