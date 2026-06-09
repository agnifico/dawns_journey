import type { Ability, ActiveEffect, Item } from '$lib/types';

export const abilityPhysical: Ability = {
	id: 'power_strike',
	name: 'Power Strike',
	description: 'A heavy physical blow.',
	abilityType: 'Physical Damage',
	effects: [{ type: 'damage', damageType: 'physical', multiplier: 1.8 }],
	category: 'damage',
	targetType: 'enemy',
	tags: ['physical_strike']
};

export const abilityElemental: Ability = {
	id: 'flame_burst',
	name: 'Flame Burst',
	description: 'Unleash a burst of fire.',
	abilityType: 'Elemental Damage',
	accuracy: 0.85,
	effects: [{ type: 'damage', damageType: 'elemental', multiplier: 2.0 }],
	category: 'damage',
	targetType: 'enemy',
	tags: ['fire']
};

export const abilitySpecial: Ability = {
	id: 'iron_will',
	name: 'Iron Will',
	description: 'Raise your defences.',
	abilityType: 'Special',
	effects: [{
		type: 'stat_modifier',
		target: 'self',
		duration: 3,
		modifiers: { physicalDefence: 20 }
	}],
	category: 'buff',
	targetType: 'self'
};

export const buffEffect: ActiveEffect = {
	id: 'atk-up',
	name: 'Attack Up',
	duration: 3,
	type: 'flat',
	stat: 'physicalAttack',
	value: 15,
	source: 'Battle Brew'
};

export const debuffEffect: ActiveEffect = {
	id: 'spd-down',
	name: 'Slow',
	duration: 2,
	type: 'flat',
	stat: 'speed',
	value: -8,
	source: 'Mud Trap'
};

export const critBuff: ActiveEffect = {
	id: 'crit-up',
	name: 'Sharpened',
	duration: 4,
	type: 'percentage',
	stat: 'critChance',
	value: 0.15,
	source: 'Honing Stone'
};

export const mockWeapon: Item = {
	id: 'ember_blade',
	name: 'Ember Blade',
	description: 'A sword imbued with smouldering fire.',
	image: '/items/ember_blade.png',
	type: 'weapon',
	element: 'Fire',
	flags: []
};

export const mockRelic: Item = {
	id: 'storm_ring',
	name: 'Storm Ring',
	description: 'A ring crackling with wind energy.',
	image: '/items/storm_ring.png',
	type: 'relic',
	flags: ['special']
};

export const mockConsumable: Item = {
	id: 'health_potion',
	name: 'Health Potion',
	description: 'Restores 50 HP.',
	image: '/items/health_potion.png',
	type: 'general',
	effects: [{ hp: 50 }],
	flags: []
};

export const mockLegendary: Item = {
	id: 'void_blade',
	name: 'Void Blade',
	description: 'A weapon from beyond the veil.',
	image: '/items/void_blade.png',
	type: 'weapon',
	flags: ['legendary']
};
