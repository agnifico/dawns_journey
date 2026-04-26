import type { Item } from '../types';

export const weapons: Item[] = [

    // =========================================================================
    // BASIC / ADVANCED STARTERS
    // =========================================================================
    {
        id: "basic_sword", name: "Basic Sword",
        description: "A plain iron sword. Not much to look at, but it works.",
        image: "/weapons/basic_sword.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 30 }],
        element: "Normal", flags: [], instanceId: ''
    },
    {
        id: "advanced_sword", name: "Advanced Sword",
        description: "A well-forged steel sword with a sharper edge.",
        image: "/weapons/advanced_sword.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 60 }, { name: "elementalAttack", value: 30 }],
        element: "Normal", flags: [], instanceId: ''
    },
    {
        id: "basic_staff", name: "Basic Staff",
        description: "A gnarled wooden staff that hums faintly with latent magic.",
        image: "/weapons/basic_staff.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 50 }],
        element: "Normal", flags: ['staff'], instanceId: ''
    },
    {
        id: "basic_polearm", name: "Basic Polearm",
        description: "A standard spear with a wooden shaft.",
        image: "/weapons/basic_polearm.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 30 }, { name: "precision", value: 10 }],
        element: "Normal", flags: ['24px', 'polearm'], instanceId: ''
    },
    {
        id: "advanced_polearm", name: "Advanced Polearm",
        description: "A reinforced halberd for seasoned guards.",
        image: "/weapons/advanced_polearm.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 65 }, { name: "precision", value: 25 }],
        element: "Normal", flags: ['24px', 'polearm'], instanceId: ''
    },
    {
        id: "basic_axe", name: "Basic Axe",
        description: "A simple iron axe with sharp, blocky edges.",
        image: "/weapons/basic_axe.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 50 }],
        element: "Normal", flags: ['24px', 'heavy'], instanceId: ''
    },
    {
        id: "basic_bow", name: "Basic Bow",
        description: "A reliable shortbow for new adventurers.",
        image: "/weapons/basic_bow.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 25 }, { name: "precision", value: 15 }],
        element: "Normal", flags: ['24px', 'ranged'], instanceId: ''
    },
    {
        id: "advanced_bow", name: "Advanced Bow",
        description: "A composite bow with superior tension.",
        image: "/weapons/advanced_bow.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 60 }, { name: "precision", value: 30 }],
        element: "Normal", flags: ['24px', 'ranged'], instanceId: ''
    },
    {
        id: "basic_claw", name: "Basic Claw",
        description: "Simple brass knuckles with small spikes.",
        image: "/weapons/basic_claw.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 25 }, { name: "speed", value: 10 }],
        element: "Normal", flags: ['24px', 'claw'], instanceId: ''
    },
    {
        id: "advanced_claw", name: "Advanced Claw",
        description: "Steel gauntlets with sharpened talons.",
        image: "/weapons/advanced_claw.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 55 }, { name: "speed", value: 25 }],
        element: "Normal", flags: ['24px', 'claw'], instanceId: ''
    },
    {
        id: "basic_fan", name: "Basic Fan",
        description: "A silk fan reinforced with bamboo slats.",
        image: "/weapons/basic_fan.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 40 }, { name: "evasion", value: 15 }, { name: "speed", value: 15 }],
        element: "Normal", flags: ['24px', 'fan'], instanceId: ''
    },

    // =========================================================================
    // ROW 1 — MODERATE ATTACK + ELEMENT BONUS
    // Both ATKs at 110. Column bonus is the differentiator.
    // =========================================================================
    {
        id: "magma_sword", name: "Magma Sword",
        description: "Forged in volcanic rock, the blade runs hot with molten precision.",
        image: "/weapons/magma_sword.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 110 }, { name: "elementalAttack", value: 110 }, { name: "precision", value: 20 }],
        element: "Fire", flags: ['special'], instanceId: ''
    },
    {
        id: "pleasure", name: "Pleasure",
        description: "A deceptively beautiful weapon — bringing joy to its wielder and despair to foes.",
        image: "/weapons/pleasure.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 110 }, { name: "elementalAttack", value: 110 }, { name: "physicalDefence", value: 50 }, { name: "maxHp", value: 100 }],
        element: "Earth", flags: ['special'], instanceId: ''
    },
    {
        id: "frostfall", name: "Frostfall",
        description: "A blade cooled by deep-water currents — balanced, reliable, quietly devastating.",
        image: "/weapons/frostfall.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 110 }, { name: "elementalAttack", value: 110 }, { name: "elementalDefence", value: 50 }, { name: "maxHp", value: 100 }],
        element: "Water", flags: ['special'], instanceId: ''
    },
    {
        id: "windcaller", name: "Windcaller",
        description: "Summons miniature cyclones with every swing.",
        image: "/weapons/windcaller.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 110 }, { name: "physicalAttack", value: 80 }, { name: "evasion", value: 20 }, { name: "speed", value: 20 }],
        element: "Wind", flags: ['24px', 'fan'], instanceId: ''
    },
    {
        id: "saints_rapier", name: "Saint's Rapier",
        description: "A blessed rapier; standard issue for the Saints Ten. Fast, faithful, and lethal.",
        image: "/weapons/saints_rapier.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 110 }, { name: "elementalAttack", value: 110 }, { name: "critChance", value: .30 }],
        element: "Light", flags: ['special'], instanceId: ''
    },
    {
        id: "medusa_scissors", name: "Medusa Scissors",
        description: "...wait, what?? The blades cut through fate itself.",
        image: "/weapons/medusa_scissors.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 110 }, { name: "elementalAttack", value: 110 }, { name: "critDamage", value: .60 }],
        element: "Dark", flags: ['special'], instanceId: ''
    },

    // =========================================================================
    // ROW 2 — HIGH ATTACK + ELEMENT BONUS
    // Single ATK at 150 + column element bonus.
    // =========================================================================
    {
        id: "burning_cutlass", name: "Burning Cutlass",
        description: "A pirate's cutlass, enchanted with a fiery edge. High heat, high precision.",
        image: "/weapons/burning_cutlass.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 150 }, { name: "precision", value: 25 }],
        element: "Fire", flags: ['special', 'sword'], instanceId: ''
    },
    {
        id: "vine_whip", name: "Vine Whip",
        description: "A flexible whip made of enchanted vines — entangles foes and shrugs off earth's punishment.",
        image: "/weapons/vine_whip.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 150 }, { name: "physicalDefence", value: 55 }, { name: "maxHp", value: 100 }],
        element: "Earth", flags: ['special', 'sword'], instanceId: ''
    },
    {
        id: "water_whip", name: "Water Whip",
        description: "A whip made of solidified water, striking with fluid force.",
        image: "/weapons/water_whip.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 150 }, { name: "elementalDefence", value: 55 }, { name: "maxHp", value: 100 }],
        element: "Water", flags: ['special', 'sword'], instanceId: ''
    },
    {
        id: "falling_leaves", name: "Falling Leaves",
        description: "A blade as light as autumn air — swift, elusive, and quietly lethal.",
        image: "/weapons/falling_leaves.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 150 }, { name: "evasion", value: 25 }, { name: "speed", value: 20 }],
        element: "Wind", flags: ['special', 'sword'], instanceId: ''
    },
    {
        id: "freedom_sworn", name: "Freedom Sworn",
        description: "A blade that fights for liberation — strikes with conviction and rarely misses the mark.",
        image: "/weapons/freedom_sworn.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 150 }, { name: "critChance", value: .35 }],
        element: "Light", flags: ['special', 'ranged'], instanceId: ''
    },
    {
        id: "vampiric_sword", name: "Vampiric Sword",
        description: "Thirsts for blood. Strikes hard and capitalises brutally on every opening.",
        image: "/weapons/vampiric_sword.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 150 }, { name: "critDamage", value: .70 }],
        element: "Dark", flags: ['special', 'sword'], instanceId: ''
    },

    // =========================================================================
    // ROW 3 — VERY HIGH ATTACK / BiS
    // Single dominant ATK at 190–200. The best raw damage weapons.
    // =========================================================================
    {
        id: "dawnbringer", name: "Dawnbringer",
        description: "The legendary Dawnbringer, evolved to its ultimate form. Raw elemental devastation.",
        image: "/weapons/dawnbringer.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 200 }, { name: "precision", value: 20 }],
        element: "Fire", flags: ['legendary', 'sword'], instanceId: ''
    },
    {
        id: "xochi", name: "Xochi",
        description: "A sword vibrant with earth's power. Immune to poison — the jungle's deadliest secret.",
        image: "/weapons/xochi.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 190 }, { name: "physicalDefence", value: 55 }, { name: "maxHp", value: 120 }],
        element: "Earth", flags: ['legendary', 'sword'], instanceId: '',
        gearPassives: ['poison_immunity']
    },
    {
        id: "queens_trident", name: "Queen's Trident",
        description: "The trident of a sea queen. Absolute mastery over water — no other polearm comes close.",
        image: "/weapons/queens_trident.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 200 }, { name: "elementalDefence", value: 40 }],
        element: "Water", flags: ['polearm', 'legendary'], instanceId: ''
    },
    {
        id: "raikiri", name: "Raikiri",
        description: "A legendary sword capable of cutting lightning itself. Pure, unmatched physical force.",
        image: "/weapons/raikiri.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 200 }, { name: "evasion", value: 20 }, { name: "speed", value: 15 }],
        element: "Wind", flags: ['legendary', 'sword'], instanceId: ''
    },
    {
        id: "unity", name: "Unity",
        description: "A weapon born from all elements in harmony.",
        image: "/weapons/unity.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 190 }, { name: "critChance", value: .25 }],
        element: "Light", flags: ['legendary', 'sword'],
        exploration: [{ name: 'Fire', level: 4 }, { name: 'Wind', level: 4 }, { name: 'Water', level: 4 }, { name: 'Earth', level: 4 }],
        instanceId: ''
    },
    {
        id: "fatespinner", name: "Fatespinner",
        description: "A weapon that weaves destiny — every hit lands harder than it has any right to.",
        image: "/weapons/fatespinner.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 190 }, { name: "critDamage", value: .75 }],
        element: "Dark", flags: ['legendary', 'sword'], instanceId: ''
    },
    {
        id: "spiked_warhammer", name: "Spiked Warhammer",
        description: "Heavy stone head, slow but obliterating. The crits it lands are the stuff of nightmares.",
        image: "/weapons/spiked_warhammer.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 200 }, { name: "critChance", value: .30 }, { name: "critDamage", value: .75 }, { name: "speed", value: -20 }],
        element: "Normal", flags: ['24px', 'heavy'], instanceId: ''
    },

    // =========================================================================
    // ROW 4 — ELEMENT BONUS + HIGH ATTACK
    // Strong column element bonus + high ATK. The element bonus is the draw.
    // =========================================================================
    {
        id: "amaterasu", name: "Amaterasu",
        description: "A sword wreathed in dark flames. Ancient discipline sharpens every strike.",
        image: "/weapons/amaterasu.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 120 }, { name: "elementalAttack", value: 120 }, { name: "precision", value: 30 }],
        element: "Fire", flags: ['legendary', 'sword',], instanceId: ''
    },
    {
        id: "mountain_breaker", name: "Mountain Breaker",
        description: "An ancient stone staff that channels seismic force. Unbreakable, unyielding.",
        image: "/weapons/mountain_breaker.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 150 }, { name: "physicalDefence", value: 55 }, { name: "maxHp", value: 120 }],
        element: "Earth", flags: ['special', 'staff'], instanceId: ''
    },
    {
        id: "kyoka_suigetsu", name: "Kyoka Suigetsu",
        description: "A graceful weapon shimmering with moonlight on water. High attack, deep elemental protection.",
        image: "/weapons/kyoka_suigetsu.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 150 }, { name: "elementalDefence", value: 55 }, { name: "maxHp", value: 100 }],
        element: "Water", flags: ['legendary', 'staff'], instanceId: ''
    },
    {
        id: "lightning", name: "Lightning",
        description: "A crackling staff that moves like a thunderbolt. Elusive and blindingly fast.",
        image: "/weapons/lightning.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 150 }, { name: "evasion", value: 25 }, { name: "speed", value: 25 }],
        element: "Wind", flags: ['special', 'staff'], instanceId: ''
    },
    {
        id: "serpents_spire", name: "Serpent's Spire",
        description: "A staff coiled like a serpent — its bearer strikes true and often.",
        image: "/weapons/serpents_spire.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 150 }, { name: "critChance", value: .35 }],
        element: "Light", flags: ['special', 'staff'], instanceId: ''
    },
    {
        id: "nightsoul_staff", name: "Nightsoul Staff",
        description: "An alien-looking staff that channels dark, twisted power. Every hit crits harder.",
        image: "/weapons/nightsoul_staff.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 150 }, { name: "critDamage", value: .70 }],
        element: "Dark", flags: ['special', 'staff'], instanceId: ''
    },

    // =========================================================================
    // ROW 5 — CRITS + SPEED + NEGATIVE DEFENCE
    // ATK + crits + speed at the cost of physDef (~-40).
    // =========================================================================
    {
        id: "flame_bow", name: "Flame Bow",
        description: "Arrows ignited by fiery enchantments. Fast and precise — don't stand still.",
        image: "/weapons/flame_bow.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 130 }, { name: "critChance", value: .30 }, { name: "speed", value: 20 }, { name: "physicalDefence", value: -40 }],
        element: "Fire", flags: ['24px', 'ranged'], instanceId: ''
    },
    {
        id: "viper_bow", name: "Viper Bow",
        description: "A venomous green bow. High crit, high speed — low survivability. Pure glass cannon.",
        image: "/weapons/viper_bow.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 130 }, { name: "critChance", value: .25 }, { name: "speed", value: 25 }, { name: "physicalDefence", value: -40 }],
        element: "Earth", flags: ['24px', 'ranged'], instanceId: ''
    },
    {
        id: "frost_dagger", name: "Frost Dagger",
        description: "A short icy blade. Strips away your defences but makes you impossible to catch.",
        image: "/weapons/frost_dagger.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 130 }, { name: "critChance", value: .25 }, { name: "speed", value: 25 }, { name: "physicalDefence", value: -40 }],
        element: "Water", flags: ['special', 'sword'], instanceId: ''
    },
    {
        id: "skypiercer", name: "Skypiercer",
        description: "A bow that fires with the speed of a gale. Sacrifices defence for pure ballistic fury.",
        image: "/weapons/skypiercer.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 140 }, { name: "critChance", value: .30 }, { name: "speed", value: 25 }, { name: "physicalDefence", value: -40 }],
        element: "Wind", flags: ['24px', 'ranged'], instanceId: ''
    },
    {
        id: "her_majestys_watch", name: "Her Majesty's Watch",
        description: "A Light-blessed bow. Precise, fast — the queen is always watching.",
        image: "/weapons/her_majestys_watch.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 130 }, { name: "critChance", value: .35 }, { name: "speed", value: 20 }, { name: "physicalDefence", value: -40 }],
        element: "Light", flags: ['heavy', 'legendary'], instanceId: ''
    },
    {
        id: "nightpiercer", name: "Nightpiercer",
        description: "Fires invisible shafts of shadow. High crit damage, lethal at speed.",
        image: "/weapons/nightpiercer.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 130 }, { name: "critDamage", value: .60 }, { name: "speed", value: 20 }, { name: "physicalDefence", value: -40 }],
        element: "Dark", flags: ['24px', 'ranged'], instanceId: ''
    },
    {
        id: "royal_greatsword", name: "Royal Greatsword",
        description: "A magnificent greatsword fit for a king. Devastating crits at the cost of your guard.",
        image: "/weapons/royal_greatsword.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 140 }, { name: "critChance", value: .30 }, { name: "critDamage", value: .55 }, { name: "physicalDefence", value: -50 }],
        element: "Normal", flags: ['heavy'], instanceId: ''
    },

    // =========================================================================
    // ROW 6 — MAX HP / DEFENCES
    // ATK + large HP and defence bonuses. Tanky build enabler.
    // =========================================================================
    {
        id: "hellward_lance", name: "Hellward Lance",
        description: "A formidable lance forged to withstand hellish punishment. You don't die.",
        image: "/weapons/hellward_lance.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 130 }, { name: "physicalDefence", value: 55 }, { name: "elementalDefence", value: 55 }, { name: "maxHp", value: 150 }],
        element: "Fire", flags: ['heavy'], instanceId: ''
    },
    {
        id: "pestilence", name: "Pestilence",
        description: "A corroded heavy blade seeping with toxins. Sturdy beyond reason.",
        image: "/weapons/pestilence.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 120 }, { name: "physicalDefence", value: 60 }, { name: "elementalDefence", value: 50 }, { name: "maxHp", value: 150 }],
        element: "Earth", flags: ['heavy'], instanceId: ''
    },
    {
        id: "tsunami_fin", name: "Tsunami Fin",
        description: "A blade shaped like a wave crest — built for endurance against the tide.",
        image: "/weapons/tsunami_fin.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 120 }, { name: "elementalDefence", value: 60 }, { name: "physicalDefence", value: 50 }, { name: "maxHp", value: 150 }],
        element: "Water", flags: ['heavy'], instanceId: ''
    },
    {
        id: "phobos_and_deimos", name: "Phobos and Deimos",
        description: "Twin blades embodying fear and dread. Evasive, bulky, unstoppable.",
        image: "/weapons/phobos_and_deimos.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 120 }, { name: "physicalDefence", value: 50 }, { name: "elementalDefence", value: 50 }, { name: "maxHp", value: 130 }, { name: "evasion", value: 15 }],
        element: "Wind", flags: ['heavy'], instanceId: ''
    },
    {
        id: "saints_greatsword", name: "Saint's Greatsword",
        description: "A blessed greatsword; standard issue for the Saints Ten. Heavy faith, heavy armour.",
        image: "/weapons/saints_greatsword.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 120 }, { name: "physicalDefence", value: 60 }, { name: "elementalDefence", value: 55 }, { name: "maxHp", value: 150 }],
        element: "Light", flags: ['heavy', 'legendary'], instanceId: ''
    },
    {
        id: "beloveds_eye", name: "Beloved's Eye",
        description: "The watchful eye of an immortal sorceress, formed into a sword. Protecting and lethal.",
        image: "/weapons/beloved_eye.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 120 }, { name: "physicalDefence", value: 50 }, { name: "elementalDefence", value: 60 }, { name: "maxHp", value: 150 }],
        element: "Dark", flags: ['special', 'sword'], instanceId: ''
    },

    // =========================================================================
    // ROW 7 — EVASION + PRECISION
    // ATK + evasion + precision. Hit everything, dodge anything.
    // =========================================================================
    {
        id: "hearthfire", name: "Hearthfire",
        description: "A fire-blessed polearm. Hits accurately and slips through counterattacks like smoke.",
        image: "/weapons/hearthfire.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 130 }, { name: "evasion", value: 20 }, { name: "precision", value: 25 }],
        element: "Fire", flags: ['polearm'], instanceId: ''
    },
    {
        id: "rose_rapier", name: "Rose Rapier",
        description: "Elegant and precise — a thorn-magic staff-sword. Evasive with a hint of earthen protection.",
        image: "/weapons/rose_rapier.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 130 }, { name: "evasion", value: 20 }, { name: "precision", value: 25 }, { name: "physicalDefence", value: 30 }],
        element: "Earth", flags: ['special', 'staff'], instanceId: ''
    },
    {
        id: "lotus_rapier", name: "Lotus Rapier",
        description: "Elegant and precise — a thorn-magic staff-sword. Evasive with a hint of earthen protection.",
        image: "/weapons/lotus_rapier.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 130 }, { name: "evasion", value: 20 }, { name: "precision", value: 25 }, { name: "physicalDefence", value: 30 }],
        element: "Earth", flags: ['special', 'staff'], instanceId: ''
    },
    {
        id: "crystal_polearm", name: "Crystal Polearm",
        description: "Translucent blue spearhead — precise enough to thread a needle at distance.",
        image: "/weapons/crystal_polearm.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 130 }, { name: "evasion", value: 20 }, { name: "precision", value: 25 }],
        element: "Water", flags: ['polearm'], instanceId: ''
    },
    {
        id: "jade_spear", name: "Jade Spear",
        description: "An elegant jade spear imbued with the power of wind. Stun-immune and impossible to pin down.",
        image: "/weapons/jade_spear.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 130 }, { name: "evasion", value: 25 }, { name: "precision", value: 20 }, { name: "speed", value: 15 }],
        element: "Wind", flags: ['polearm'], instanceId: '',
        gearPassives: ['stun_immunity']
    },
    {
        id: "sun_wukongs_staff", name: "Sun Wukong's Staff",
        description: "Legendary golden staff. Hits true, dodges clean, demands mastery of light.",
        image: "/weapons/sun_wukongs_staff.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 130 }, { name: "evasion", value: 25 }, { name: "precision", value: 25 }],
        element: "Light", flags: ['24px', 'polearm'], instanceId: ''
    },
    {
        id: "raven_sword", name: "Raven Sword",
        description: "A dark sword adorned with raven feathers. Shadows your movement, sharpens your eye.",
        image: "/weapons/raven_sword.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 130 }, { name: "evasion", value: 20 }, { name: "precision", value: 25 }, { name: "critDamage", value: .40 }],
        element: "Dark", flags: ['special', 'sword'], instanceId: ''
    },

    // =========================================================================
    // ROW 8 — NEGATIVE DEFENCE, DUAL HIGH ATTACK
    // Both ATK stats high (130–150). Significant -50 penalty to both defences.
    // =========================================================================
    {
        id: "cygwins_axe", name: "Cygwin's Axe",
        description: "Cygwin's personal weapon. Dual-edged and reckless — you hit hard, you get hit harder.",
        image: "/weapons/cygwins_axe.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 140 }, { name: "elementalAttack", value: 100 }, { name: "physicalDefence", value: -50 }, { name: "elementalDefence", value: -50 }],
        element: "Fire", flags: ['24px', 'heavy'], instanceId: ''
    },
    {
        id: "toxic_fang", name: "Toxic Fang",
        description: "A poisoned blade with teeth. Devastates on both fronts, leaves you wide open.",
        image: "/weapons/toxic_fang.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 130 }, { name: "elementalAttack", value: 130 }, { name: "physicalDefence", value: -50 }, { name: "elementalDefence", value: -50 }],
        element: "Earth", flags: ['heavy'], instanceId: ''
    },
    {
        id: "snowflake", name: "Snowflake",
        description: "A crystalline axe with a jagged frozen edge. Dual damage, fragile defence.",
        image: "/weapons/snowflake.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 100 }, { name: "elementalAttack", value: 140 }, { name: "physicalDefence", value: -50 }, { name: "elementalDefence", value: -50 }],
        element: "Water", flags: ['24px', 'heavy'], instanceId: ''
    },
    {
        id: "ode_to_harmony", name: "Ode to Harmony",
        description: "A wind-tuned bow. The harmony it sings shreds through both attack types — and your armour.",
        image: "/weapons/ode_to_harmony.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 130 }, { name: "elementalAttack", value: 130 }, { name: "physicalDefence", value: -50 }, { name: "elementalDefence", value: -50 }],
        element: "Wind", flags: ['ranged'], instanceId: ''
    },
    {
        id: "gilded_claymore", name: "Gilded Claymore",
        description: "Ornate gold-plated claymore. Looks holy, fights recklessly.",
        image: "/weapons/gilded_claymore.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 140 }, { name: "elementalAttack", value: 100 }, { name: "physicalDefence", value: -50 }, { name: "elementalDefence", value: -50 }],
        element: "Light", flags: ['heavy'], instanceId: ''
    },
    {
        id: "kingslayer", name: "Kingslayer",
        description: "A heavy blade etched with dark fire. Ends fights quickly — one way or another.",
        image: "/weapons/kingslayer.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 150 }, { name: "elementalAttack", value: 100 }, { name: "physicalDefence", value: -50 }, { name: "elementalDefence", value: -50 }],
        element: "Dark", flags: ['24px', 'heavy'], instanceId: ''
    },

    // =========================================================================
    // ROW 9 — PRECISION + SPEED + ELEMENT BONUS (Claws)
    // ATK + high precision + speed + element column bonus.
    // =========================================================================
    {
        id: "blazing_claw", name: "Blazing Claw",
        description: "Claws that leave trails of cinders. Fast, accurate, burns through defences.",
        image: "/weapons/blazing_claw.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 130 }, { name: "precision", value: 25 }, { name: "speed", value: 25 }],
        element: "Fire", flags: ['24px', 'claw'], instanceId: ''
    },
    {
        id: "natures_claw", name: "Nature's Claw",
        description: "Tough briars and thorns. Precise, sturdy, and deeply grounded.",
        image: "/weapons/natures_claw.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 130 }, { name: "precision", value: 25 }, { name: "speed", value: 20 }, { name: "physicalDefence", value: 50 }, { name: "maxHp", value: 100 }],
        element: "Earth", flags: ['24px', 'claw'], instanceId: ''
    },
    {
        id: "frost_claw", name: "Frost Claw",
        description: "Ice shard fingers that find every gap in the enemy's guard.",
        image: "/weapons/frost_claw.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 130 }, { name: "precision", value: 25 }, { name: "speed", value: 20 }, { name: "elementalDefence", value: 45 }, { name: "maxHp", value: 80 }],
        element: "Water", flags: ['24px', 'claw'], instanceId: ''
    },
    {
        id: "ancient_dragon_claw", name: "Ancient Dragon Claw",
        description: "Fossilised dragon scales forged into a weapon. Wind-element, impossibly precise.",
        image: "/weapons/ancient_dragon_claw.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 140 }, { name: "precision", value: 30 }, { name: "speed", value: 25 }, { name: "evasion", value: 20 }],
        element: "Wind", flags: ['24px', 'claw'], instanceId: ''
    },
    {
        id: "royal_claw", name: "Royal Claw",
        description: "Elegant white gold with a protective aura. Precise, fast, and always lands crits.",
        image: "/weapons/royal_claw.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 130 }, { name: "precision", value: 30 }, { name: "speed", value: 20 }, { name: "critChance", value: .25 }],
        element: "Light", flags: ['24px', 'claw'], instanceId: ''
    },
    {
        id: "darkness_claw", name: "Darkness Claw",
        description: "Pitch-black metal that absorbs light. Precise strikes that punish hard on the crit.",
        image: "/weapons/darkness_claw.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 130 }, { name: "precision", value: 25 }, { name: "speed", value: 20 }, { name: "critDamage", value: .65 }],
        element: "Dark", flags: ['24px', 'claw'], instanceId: ''
    },

    // =========================================================================
    // ROW 10 — EVASION + SPEED + ELEMENT BONUS (Fans)
    // ATK + evasion + speed + element column bonus.
    // =========================================================================
    {
        id: "white_peacock_fan", name: "White Peacock Fan",
        description: "Stunning white feathers that blind foes. Elusive and precise.",
        image: "/weapons/white_peacock_fan.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 120 }, { name: "evasion", value: 25 }, { name: "speed", value: 20 }, { name: "precision", value: 20 }],
        element: "Fire", flags: ['24px', 'fan'], instanceId: ''
    },
    {
        id: "salty_winds", name: "Salty Winds",
        description: "Smells of the ocean. Evasive, fast, and quietly defensive.",
        image: "/weapons/salty_winds.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 120 }, { name: "evasion", value: 25 }, { name: "speed", value: 20 }, { name: "elementalDefence", value: 45 }, { name: "maxHp", value: 80 }],
        element: "Water", flags: ['24px', 'fan'], instanceId: ''
    },
    {
        id: "sakura_fubuki", name: "Sakura Fubuki",
        description: "Pink petal storms follow this fan's every movement. Impossibly fast, nearly untouchable.",
        image: "/weapons/sakura_fubuki.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 130 }, { name: "evasion", value: 30 }, { name: "speed", value: 25 }],
        element: "Wind", flags: ['24px', 'fan'], instanceId: ''
    },
    {
        id: "gilded_fan", name: "Gilded Fan",
        description: "Shines with holy light. Fast, evasive, and lands crits with divine regularity.",
        image: "/weapons/gilded_fan.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 120 }, { name: "evasion", value: 25 }, { name: "speed", value: 20 }, { name: "critChance", value: .25 }],
        element: "Light", flags: ['24px', 'fan'], instanceId: ''
    },
    {
        id: "night_sky", name: "Night Sky",
        description: "A dark indigo fan speckled with star-pixels. Evasive and hits for crushing dark crits.",
        image: "/weapons/night_sky.png", type: "weapon",
        stats: [{ name: "elementalAttack", value: 120 }, { name: "evasion", value: 25 }, { name: "speed", value: 20 }, { name: "critDamage", value: .60 }],
        element: "Dark", flags: ['24px', 'fan'], instanceId: ''
    },
    {
        id: "razor_fan", name: "Razor Fan",
        description: "Steel-tipped edges designed for slicing. Never misses what it aims for.",
        image: "/weapons/razor_fan.png", type: "weapon",
        stats: [{ name: "physicalAttack", value: 120 }, { name: "evasion", value: 20 }, { name: "speed", value: 20 }, { name: "critChance", value: .25 }, { name: "precision", value: 20 }],
        element: "Normal", flags: ['24px', 'fan'], instanceId: ''
    },
    // --------------------

    {
        id: "gratitude", name: "Gratitude",
        description: "A bouquet of white and blue roses. \n I put everything I had in making this game, this is my pride and joy. If you've made it this far, I am grateful for your time, and curiosity. To your health, and success.",
        image: "/weapons/white_roses.png", type: "weapon",
        stats: [{ name: "maxHp", value: 9999 }],
        exploration: [{ name: 'Fire', level: 9 }, { name: 'Wind', level: 9 }, { name: 'Water', level: 9 }, { name: 'Earth', level: 9 }, { name: 'Light', level: 9 }, { name: 'Dark', level: 9 }],
        element: "Earth", flags: ['24px', 'special'], instanceId: ''
    },
];