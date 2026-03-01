import type { Item } from '../types';

export const generalItems: Item[] = [
    // General Items
    {
        id: "leaves",
        name: "Leaves",
        description: "Leftover organic material from harvesting. Can be composted.",
        image: "/general/leaves.png", // Assuming a path, will need asset
        type: "general",
        flags: ['stackable', 'homestead_resource'],
        instanceId: ''
    },
    {
        id: "amethyst",
        name: "Amethyst",
        description: "A beautiful purple gemstone.",
        image: "/general/amethyst.png",
        type: "general",
        flags: ['stackable',],
        instanceId: ''
    },
    {
        id: "aquamarine",
        name: "Aquamarine",
        description: "A sparkling blue-green gemstone.",
        image: "/general/aquamarine.png",
        type: "general",
        flags: ['stackable',],
        instanceId: ''
    },
    {
        id: "citrine",
        name: "Citrine",
        description: "A warm yellow gemstone.",
        image: "/general/citrine.png",
        type: "general",
        flags: ['stackable',],
        instanceId: ''
    },
    {
        id: "ruby",
        name: "Ruby",
        description: "An intense red gemstone.",
        image: "/general/ruby.png",
        type: "general",
        flags: ['stackable',],
        instanceId: ''
    },
    {
        id: "sapphire",
        name: "Sapphire",
        description: "A deep blue gemstone.",
        image: "/general/sapphire.png",
        type: "general",
        flags: ['stackable',],
        instanceId: ''
    },
    {
        id: "emerald",
        name: "Emerald",
        description: "A lush green gemstone.",
        image: "/general/emerald.png",
        type: "general",
        flags: ['stackable',],
        instanceId: ''
    },
    {
        id: "argentum",
        name: "Argentum",
        description: "A rare and valuable silver-like metal.",
        image: "/general/argentum.png",
        type: "general",
        flags: ['stackable',],
        instanceId: ''
    },
    {
        id: "azurite",
        name: "Azurite",
        description: "A vibrant blue crystal, said to hold the essence of clear skies and calm waters.",
        image: "/general/azurite.png",
        type: "general",
        flags: ['stackable',],
        instanceId: ''
    },
    {
        id: "bear_skin",
        name: "Bear Skin",
        description: "The hide of a bear, useful for crafting.",
        image: "/general/bear_skin.png",
        type: "general",
        flags: ['stackable',],
        instanceId: ''
    },
    {
        id: "blueberries",
        name: "Blueberries",
        description: "Small, sweet berries.",
        image: "/general/blueberries.png",
        type: "general",
        flags: ['stackable'],
        effects: [{ auraShield: 500 }],
        activeEffects: [{ id: "blueberry_buff", name: "Blueberry Buff", stat: "physicalDefence", value: 20, duration: 50, type: "flat", source: "blueberries" }],
    },
    {
        id: "bread",
        name: "Bread",
        description: "A loaf of freshly baked bread.",
        image: "/general/bread.png",
        type: "general",
        effects: [{ hp: 100 }, { auraShield: 500 }],
        flags: ['stackable',],
    },
    {
        id: "coral_reef",
        name: "Coral Reef",
        description: "A piece of colorful coral from the reef.",
        image: "/general/coral_reef.png",
        type: "general",
        flags: ['stackable',],
        instanceId: ''
    },
    {
        id: "corn",
        name: "Corn",
        description: "A cob of sweet corn.",
        image: "/general/corn.png",
        type: "general",
        effects: [{ auraShield: 100 }],
        flags: ['stackable',],
    },
    {
        id: "cotton",
        name: "Cotton",
        description: "Soft cotton fibers, useful for crafting.",
        image: "/general/cotton.png",
        type: "general",
        flags: ['stackable',],
        instanceId: ''
    },
    {
        id: "cuprum",
        name: "Cuprum",
        description: "A reddish-brown ore, commonly used in crafting and known for its conductivity.",
        image: "/general/cuprum.png",
        type: "general",
        flags: ['stackable',],
        instanceId: ''
    },
    {
        id: "dragon_fang",
        name: "Dragon Fang",
        description: "A razor-sharp fang from a fearsome dragon, a rare and powerful crafting component.",
        image: "/general/dragon_fang.png",
        type: "general",
        flags: ['stackable', 'special'],
        instanceId: ''
    },
    {
        id: "feather",
        name: "Feather",
        description: "A light feather, perhaps from a bird of prey.",
        image: "/general/feather.png",
        type: "general",
        flags: ['stackable',],
        instanceId: ''
    },
    {
        id: "fish",
        name: "Fish",
        description: "A freshly caught fish, good for a quick meal.",
        image: "/general/fish.png",
        type: "general",
        effects: [{ hp: 100 }, { auraShield: 100 }],
        flags: ['stackable',],
    },
    {
        id: "forza_mead",
        name: "Forza Mead",
        description: "A potent mead that invigorates the spirit for 150 steps.",
        image: "/general/forza_mead.png",
        type: "general",
        flags: ['stackable','special'],
        activeEffects: [{ id: "forza_buff", name: "Forza Buff", stat: "physicalAttack", value: 10, duration: 150, type: "flat", source: "forza_mead" }],
    },
    {
        id: "four_leaf_clover",
        name: "Four-Leaf Clover",
        description: "A legendary clover, said to bring immense luck to its possessor.",
        image: "/general/four_leaf_clover.png",
        type: "general",
        flags: ['stackable', 'special'],
        instanceId: ''
    },
    {
        id: "gold",
        name: "Gold",
        description: "A gleaming nugget of pure gold, highly prized by merchants and dragons alike.",
        image: "/general/gold.png",
        type: "general",
        flags: ['stackable',],
        instanceId: ''
    },
    {
        id: "island_herb",
        name: "Island Herb",
        description: "A common herb found on the island. Slightly boosts magic defence for 150 steps.",
        image: "/general/island_herb.png",
        type: "general",
        flags: ['stackable',],
        effects: [{ hp: 5 }],
        activeEffects: [{ id: "herb_buff", name: "Herb Buff", stat: "elementalDefence", value: 5, duration: 150, type: "flat", source: "island_herb" }],
    },
    {
        id: "meat",
        name: "Meat",
        description: "A piece of raw meat.",
        image: "/general/meat.png",
        type: "general",
        effects: [{ hp: 20 }],
        flags: ['stackable',],
    },
    {
        id: "omelette",
        name: "Omelette",
        description: "A fluffy omelette, a good source of protein.",
        image: "/general/omelette.png",
        type: "general",
        effects: [{ hp: 25 }],
        flags: ['stackable',],
    },
    {
        id: "onigiri",
        name: "Onigiri",
        description: "A traditional Japanese rice ball.",
        image: "/general/onigiri.png",
        type: "general",
        effects: [{ hp: 12 }],
        flags: ['stackable',],
    },
    {
        id: "onion",
        name: "Onion",
        description: "A pungent onion.",
        image: "/general/onion.png",
        type: "general",
        flags: ['stackable',],
        effects: [{ hp: 2 }],
        activeEffects: [
            { id: "onion_pd_buff", name: "Onion PD Buff", stat: "physicalAttack", value: 15, duration: 50, type: "flat", source: "onion" },
            { id: "onion_pd_debuff", name: "Onion PD Debuff", stat: "physicalDefence", value: -.10, duration: 50, type: "percentage", source: "onion" },
        ],
    },
    {
        id: "shark_fin",
        name: "Shark Fin",
        description: "A sharp shark fin, a valuable crafting material.",
        image: "/general/shark_fin.png",
        type: "general",
        flags: ['stackable',],
        instanceId: ''
    },
    {
        id: "tomato",
        name: "Tomato",
        description: "A tomato",
        image: "/crops/tomato.png",
        type: "general",
        flags: ['stackable', "crop"],
        instanceId: ''
    },
    {
        id: "stone",
        name: "Stone",
        description: "A common stone, useful for basic crafting.",
        image: "/general/stone.png",
        type: "general",
        flags: ['stackable',],
        instanceId: ''
    },
    {
        id: "metal",
        name: "Metal",
        description: "A sheet of scrap metal.",
        image: "/general/metal.png",
        type: "general",
        flags: ['stackable',],
        instanceId: ''
    },
    {
        id: "wood",
        name: "Wood",
        description: "A sturdy log of freshly cut wood, a fundamental resource for building and crafting.",
        image: "/general/wood.png",
        type: "general",
        flags: ['stackable',],
        instanceId: ''
    },
    {
        id: "tranquility_pearl",
        name: "Tranquility Pearl",
        description: "A luminous pearl said to bring peace and balance to the waters.",
        image: "/general/tranquility_pearl.png",
        type: "general",
        flags: ['stackable', 'special'],
        instanceId: ''
    },
    {
        id: "potato",
        name: "Potato",
        description: "A starchy tuber.",
        image: "/crops/potato.png",
        type: "general",
        flags: ['stackable', "crop"],
        instanceId: ''
    },
    {
        id: "wheat",
        name: "Wheat",
        description: "A cereal grain.",
        image: "/crops/wheat.png",
        type: "general",
        flags: ['stackable', "crop"],
        instanceId: ''
    },
    {
        id: "carrot",
        name: "Carrot",
        description: "A root vegetable.",
        image: "/crops/carrot.png",
        type: "general",
        flags: ['stackable', "crop"],
        instanceId: ''
    },
    {
        id: "fava_bean",
        name: "Fava Bean",
        description: "A type of bean.",
        image: "/crops/fava_beans.png",
        type: "general",
        flags: ['stackable', "crop"],
        instanceId: ''
    },
    {
        id: "kale",
        name: "Kale",
        description: "A leafy green vegetable.",
        image: "/crops/kale.png",
        type: "general",
        flags: ['stackable', "crop"],
        instanceId: ''
    },
    {
        id: "parsnip",
        name: "Parsnip",
        description: "A root vegetable.",
        image: "/crops/parsnip.png",
        type: "general",
        flags: ['stackable', "crop"],
        instanceId: ''
    },
    {
        id: "snow_pea",
        name: "Snow Pea",
        description: "An edible-pod pea.",
        image: "/crops/snow_pea.png",
        type: "general",
        flags: ['stackable', "crop"],
        instanceId: ''
    },
    {
        id: "cucumber",
        name: "Cucumber",
        description: "A widely-cultivated creeping vine plant in the gourd family.",
        image: "/crops/cucumber.png",
        type: "general",
        flags: ['stackable', "crop"],
        instanceId: ''
    },
    {
        id: "pumpkin",
        name: "Pumpkin",
        description: "A cultivar of winter squash.",
        image: "/crops/pumpkin.png",
        type: "general",
        flags: ['stackable', "crop"],
        instanceId: ''
    },
    {
        id: "mushroom",
        name: "Mushroom",
        description: "The fleshy, spore-bearing fruiting body of a fungus.",
        image: "/crops/mushroom.png",
        type: "general",
        flags: ['stackable', "crop"],
        instanceId: ''
    },
    {
        id: "cardamom",
        name: "Cardamom",
        description: "A spice made from the seeds of several plants in the genera Elettaria and Amomum.",
        image: "/crops/cardamom.png",
        type: "general",
        flags: ['stackable', "crop"],
        instanceId: ''
    },
    {
        id: "ginseng",
        name: "Ginseng",
        description: "The root of plants in the genus Panax.",
        image: "/crops/ginseng.png",
        type: "general",
        flags: ['stackable', "crop"],
        instanceId: ''
    },
    {
        id: "wasabi",
        name: "Wasabi",
        description: "A plant of the family Brassicaceae, which also includes horseradish and mustard.",
        image: "/crops/wasabi.png",
        type: "general",
        flags: ['stackable', "crop"],
        instanceId: ''
    },
    {
        id: "dragon_fruit",
        name: "Dragon Fruit",
        description: "The fruit of several different cactus species indigenous to the Americas.",
        image: "/crops/dragon_fruit.png",
        type: "general",
        flags: ['stackable', "crop"],
        instanceId: ''
    },
    {
        id: "saffron",
        name: "Saffron",
        description: "A spice derived from the flower of Crocus sativus.",
        image: "/crops/saffron_flower.png",
        type: "general",
        flags: ['stackable', "crop"],
        instanceId: ''
    },
    {
        id: "level_up_point",
        name: "Level-Up Point",
        description: "A point used to improve your character.",
        image: "/general/level_up_point.png",
        type: "general",
        flags: ['stackable', 'internal'],
        instanceId: ''
    },
    {
        id: "arena_silver",
        name: "Silver Arena Coin",
        description: "A mark of victory - in silver.",
        image: "/general/arena_silver.png",
        type: "general",
        flags: ['stackable', ''],
        instanceId: ''
    },
    {
        id: "arena_gold",
        name: "Arena Gold Coin",
        description: "A mark of victory - in gold.",
        image: "/general/arena_gold.png",
        type: "general",
        flags: ['stackable', ''],
        instanceId: ''
    },
    {
        id: "red_bar",
        name: "Red Bar",
        description: "Red Ele-Metal Bar.",
        image: "/general/red_bar.png",
        type: "general",
        flags: ['stackable', 'material'],
        instanceId: ''
    },
    {
        id: "purple_bar",
        name: "Purple Metal Bar",
        description: "purple Ele-Metal Bar.",
        image: "/general/purple_bar.png",
        type: "general",
        flags: ['stackable', 'material'],
        instanceId: ''
    },
    {
        id: "light_bar",
        name: "Divine Gold Bar",
        description: "Light Ele-Metal Bar.",
        image: "/general/gilded_bar.png",
        type: "general",
        flags: ['stackable', 'material'],
        instanceId: ''
    },
    {
        id: "earth_bar",
        name: "Green Bar",
        description: "green Ele-Metal Bar.",
        image: "/general/green_bar.png",
        type: "general",
        flags: ['stackable', 'material'],
        instanceId: ''
    },
    {
        id: "sky_bar",
        name: "Sky Bar",
        description: "Sky Ele-Metal Bar.",
        image: "/general/sky_bar.png",
        type: "general",
        flags: ['stackable', 'material'],
        instanceId: ''
    },
    {
        id: "water_bar",
        name: "Water Bar",
        description: "Water Ele-Metal Bar.",
        image: "/general/water_bar.png",
        type: "general",
        flags: ['stackable', 'material'],
        instanceId: ''
    },
    {
        id: "water_sigil",
        name: "Water Sigil",
        description: "Water Sigil - Symbol of Victory.",
        image: "/general/water_sigil.png",
        type: "general",
        flags: ['stackable', 'material'],
        instanceId: ''
    },
    {
        id: "wind_sigil",
        name: "Wind Sigil",
        description: "Wind Sigil - Symbol of Victory.",
        image: "/general/wind_sigil.png",
        type: "general",
        flags: ['stackable', 'material'],
        instanceId: ''
    },
    {
        id: "earth_sigil",
        name: "Earth Sigil",
        description: "Earth Sigil - Symbol of Victory.",
        image: "/general/earth_sigil.png",
        type: "general",
        flags: ['stackable', 'material'],
        instanceId: ''
    },
    {
        id: "light_sigil",
        name: "Light Sigil",
        description: "Light Sigil - Symbol of Victory.",
        image: "/general/light_sigil.png",
        type: "general",
        flags: ['stackable', 'material'],
        instanceId: ''
    },
    {
        id: "dark_sigil",
        name: "Dark Sigil",
        description: "dark Sigil - Symbol of Victory.",
        image: "/general/dark_sigil.png",
        type: "general",
        flags: ['stackable', 'material'],
        instanceId: ''
    },
    {
        id: "fire_sigil",
        name: "Fire Sigil",
        description: "fire Sigil - Symbol of Victory.",
        image: "/general/fire_sigil.png",
        type: "general",
        flags: ['stackable', 'material'],
        instanceId: ''
    },

    
];
