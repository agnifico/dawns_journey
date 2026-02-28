import type { CropDefinition } from '../types';

const crops: { [id: string]: Omit<CropDefinition, 'seedItemId' | 'growthMultiplierInIdealSeason' | 'totalGrowthTime' | 'imagePath' | 'xpYield' | 'leavesYield'> & { xpValue: number, yields: string, yieldsAmount: number, idealSeasonYieldMultiplier: number } } = {
    "potato_plant": {
        "id": "potato_plant",
        "name": "Potato Plant",
        "yields": "potato",
        "yieldsAmount": 1,
        "idealSeasonYieldMultiplier": 2,
        "description": "Solanum tuberosum. A starchy tuber prized for its energy content. It grows best in well-drained, loose soil, allowing the tubers to expand.",
        "unlockLevel": 1,
        "requiredEnvironment": [
            "env_open_field"
        ],
        "requiredTechs": [],
        "idealSeason": "Spring",
        "wateringRequirementType": "lifetime_based",
        "wateringRequirementValue": 2,
        "xpValue": 10,
        "growthStages": [
            { "duration": 1 * 60 * 1000 },
            { "duration": 1 * 60 * 1000 },
            { "duration": 1 * 60 * 1000 }
        ]
    },
    "wheat_plant": {
        "id": "wheat_plant",
        "name": "Wheat Plant",
        "yields": "wheat",
        "yieldsAmount": 1,
        "idealSeasonYieldMultiplier": 2,
        "description": "Triticum aestivum. A cereal grass cultivated for its seed. It is a staple food, preferring open, sunny fields where its grain can ripen.",
        "unlockLevel": 2,
        "requiredEnvironment": [
            "env_open_field"
        ],
        "requiredTechs": [],
        "idealSeason": "Summer",
        "wateringRequirementType": "lifetime_based",
        "wateringRequirementValue": 5,
        "xpValue": 12,
        "growthStages": [
            { "duration": 2 * 60 * 1000 },
            { "duration": 2 * 60 * 1000 },
            { "duration": 2 * 60 * 1000 },
            { "duration": 2 * 60 * 1000 }
        ]
    },
    "carrot_plant": {
        "id": "carrot_plant",
        "name": "Carrot Plant",
        "yields": "carrot",
        "yieldsAmount": 1,
        "idealSeasonYieldMultiplier": 2,
        "description": "Daucus carota. A biennial root vegetable, though grown as an annual. Requires loose, deep soil (like a raised bed) to prevent forking and promote a straight taproot.",
        "unlockLevel": 5,
        "requiredEnvironment": [
            "env_open_field",
            "env_cold_frame"
        ],
        "requiredTechs": [
            "tech_raised_beds"
        ],
        "idealSeason": "Autumn",
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 1,
        "xpValue": 20,
        "growthStages": [
            { "duration": 1 * 60 * 1000 },
            { "duration": 1 * 60 * 1000 },
            { "duration": 1 * 60 * 1000 },
            { "duration": 1 * 60 * 1000 },
        ]
    },
    "fava_bean_plant": {
        "id": "fava_bean_plant",
        "name": "Fava Bean Plant",
        "yields": "fava_bean",
        "yieldsAmount": 1,
        "idealSeasonYieldMultiplier": 2,
        "description": "Vicia faba. A hardy legume that grows in an upright pod. As a vining plant, it requires vertical support to maximize yield and air circulation.",
        "unlockLevel": 5,
        "requiredEnvironment": [
            "env_open_field",
            "env_greenhouse"
        ],
        "requiredTechs": [
            "tech_vertical_supports"
        ],
        "idealSeason": "Spring",
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 1,
        "xpValue": 25,
        "growthStages": [
            { "duration": 1 * 60 * 1000 },
            { "duration": 1 * 60 * 1000 },
            { "duration": 1 * 60 * 1000 },
            { "duration": 1 * 60 * 1000 },
            { "duration": 1 * 60 * 1000 },
        ]
    },
    "kale_plant": {
        "id": "kale_plant",
        "name": "Kale Plant",
        "yields": "kale",
        "yieldsAmount": 1,
        "idealSeasonYieldMultiplier": 2,
        "description": "Brassica oleracea var. sabellica. A hardy brassica with dark, leafy greens. It is exceptionally frost-tolerant; a light frost can sweeten its flavor by converting starches to sugars.",
        "unlockLevel": 8,
        "requiredEnvironment": [
            "env_cold_frame"
        ],
        "requiredTechs": [],
        "idealSeason": "Winter",
        "wateringRequirementType": "lifetime_based",
        "wateringRequirementValue": 5,
        "xpValue": 40,
        "growthStages": [
            { "duration": 2 * 60 * 1000 },
            { "duration": 2 * 60 * 1000 },
            { "duration": 2 * 60 * 1000 },
            { "duration": 2 * 60 * 1000 },
            { "duration": 2 * 60 * 1000 },
        ]
    },
    "tomato_plant": {
        "id": "tomato_plant",
        "name": "Tomato Plant",
        "yields": "tomato",
        "yieldsAmount": 1,
        "idealSeasonYieldMultiplier": 2,
        "description": "Solanum lycopersicum. A heat-loving fruit, commonly treated as a vegetable. It is sensitive to cold and requires a long, warm growing season, making a greenhouse ideal.",
        "unlockLevel": 8,
        "requiredEnvironment": [
            "env_greenhouse"
        ],
        "requiredTechs": [],
        "idealSeason": "Summer",
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 1,
        "xpValue": 45,
        "growthStages": [
            { "duration": 2 * 60 * 1000 },
            { "duration": 2 * 60 * 1000 },
            { "duration": 2 * 60 * 1000 },
            { "duration": 2 * 60 * 1000 },
            { "duration": 2 * 60 * 1000 }
        ]
    },
    "parsnip_plant": {
        "id": "parsnip_plant",
        "name": "Parsnip Plant",
        "yields": "parsnip",
        "yieldsAmount": 1,
        "idealSeasonYieldMultiplier": 2,
        "description": "Pastinaca sativa. A root vegetable closely related to the carrot. It requires a long growing season and its flavor is best developed after a few frosts.",
        "unlockLevel": 10,
        "requiredEnvironment": [
            "env_cold_frame"
        ],
        "requiredTechs": [
            "tech_raised_beds"
        ],
        "idealSeason": "Winter",
        "wateringRequirementType": "lifetime_based",
        "wateringRequirementValue": 10,
        "xpValue": 60,
        "growthStages": [
            { "duration": 3 * 60 * 1000 },
            { "duration": 3 * 60 * 1000 },
            { "duration": 3 * 60 * 1000 },
            { "duration": 3 * 60 * 1000 },
            { "duration": 3 * 60 * 1000 },
        ]
    },
    "snow_pea_plant": {
        "id": "snow_pea_plant",
        "name": "Snow Pea Plant",
        "yields": "snow_pea",
        "yieldsAmount": 1,
        "idealSeasonYieldMultiplier": 2,
        "description": "Pisum sativum var. saccharatum. A vining legume with edible pods. It prefers cool weather and will stop producing in high heat, making it a perfect crop for a cold frame.",
        "unlockLevel": 10,
        "requiredEnvironment": [
            "env_cold_frame"
        ],
        "requiredTechs": [
            "tech_vertical_supports"
        ],
        "idealSeason": "Spring",
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 1,
        "xpValue": 55,
        "growthStages": [
            { "duration": 2 * 60 * 1000 },
            { "duration": 2 * 60 * 1000 },
            { "duration": 2 * 60 * 1000 },
        ]
    },
    "cucumber_plant": {
        "id": "cucumber_plant",
        "name": "Cucumber Plant",
        "yields": "cucumber",
        "yieldsAmount": 1,
        "idealSeasonYieldMultiplier": 2,
        "description": "Cucumis sativus. A vining plant in the gourd family. It requires consistent moisture and warmth, and its climbing tendrils thrive with vertical support.",
        "unlockLevel": 10,
        "requiredEnvironment": [
            "env_greenhouse"
        ],
        "requiredTechs": [
            "tech_vertical_supports"
        ],
        "idealSeason": "Summer",
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 2,
        "xpValue": 65,
        "growthStages": [
            { "duration": 2 * 60 * 1000 },
            { "duration": 2 * 60 * 1000 },
            { "duration": 2 * 60 * 1000 },
            { "duration": 2 * 60 * 1000 },
            { "duration": 2 * 60 * 1000 },
        ]
    },
    "pumpkin_plant": {
        "id": "pumpkin_plant",
        "name": "Pumpkin Plant",
        "yields": "pumpkin",
        "yieldsAmount": 1,
        "idealSeasonYieldMultiplier": 2,
        "description": "Cucurbita pepo. A large, heavy-feeding winter squash. Its sprawling vines demand significant space and nutrient-rich soil (compost) to produce large fruit.",
        "unlockLevel": 12,
        "requiredEnvironment": [
            "env_greenhouse"
        ],
        "requiredTechs": [
            "tech_compost_bin"
        ],
        "idealSeason": "Autumn",
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 2,
        "xpValue": 100,
        "growthStages": [
            { "duration": 4 * 60 * 1000 },
            { "duration": 4 * 60 * 1000 },
            { "duration": 4 * 60 * 1000 },
            { "duration": 4 * 60 * 1000 },
            { "duration": 4 * 60 * 1000 },
        ]
    },
    "mushroom_plant": {
        "id": "mushroom_plant",
        "name": "Mushroom Log",
        "yields": "mushroom",
        "yieldsAmount": 1,
        "idealSeasonYieldMultiplier": 2,
        "description": "Agaricus bisporus. The fruiting body of a fungus, not a plant. It thrives in dark, humid conditions, drawing nutrients from a rich, decaying substrate.",
        "unlockLevel": 12,
        "requiredEnvironment": [
            "env_forest_floor"
        ],
        "requiredTechs": [],
        "idealSeason": null,
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 1,
        "xpValue": 75,
        "growthStages": [
            { "duration": 1 * 60 * 1000 },
            { "duration": 1 * 60 * 1000 },
        ]
    },
    "cardamom_plant": {
        "id": "cardamom_plant",
        "name": "Cardamom Plant",
        "yields": "cardamom",
        "yieldsAmount": 1,
        "idealSeasonYieldMultiplier": 2,
        "description": "Elettaria cardamomum. A tropical, perennial herb known for its aromatic seed pods. It requires a humid, warm environment and rich, organic soil.",
        "unlockLevel": 15,
        "requiredEnvironment": [
            "env_greenhouse"
        ],
        "requiredTechs": [
            "tech_vertical_supports",
            "tech_compost_bin"
        ],
        "idealSeason": "Summer",
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 2,
        "xpValue": 180,
        "growthStages": [
            { "duration": 9 * 60 * 1000 },
            { "duration": 9 * 60 * 1000 },
            { "duration": 9 * 60 * 1000 },
        ]
    },
    "ginseng_plant": {
        "id": "ginseng_plant",
        "name": "Ginseng Plant",
        "yields": "ginseng",
        "yieldsAmount": 1,
        "idealSeasonYieldMultiplier": 2,
        "description": "Panax quinquefolius. A perennial herb prized for its slow-growing medicinal root. It requires deep shade and well-drained, rich soil, simulating its native forest floor environment.",
        "unlockLevel": 15,
        "requiredEnvironment": [
            "env_forest_floor"
        ],
        "requiredTechs": [
            "tech_raised_beds"
        ],
        "idealSeason": "Autumn",
        "wateringRequirementType": "lifetime_based",
        "wateringRequirementValue": 20,
        "xpValue": 300,
        "growthStages": [
            { "duration": 24 * 60 * 1000 },
            { "duration": 24 * 60 * 1000 },
            { "duration": 24 * 60 * 1000 },
            { "duration": 24 * 60 * 1000 },
        ]
    },
    "wasabi_plant": {
        "id": "wasabi_plant",
        "name": "Wasabi Plant",
        "yields": "wasabi",
        "yieldsAmount": 1,
        "idealSeasonYieldMultiplier": 2,
        "description": "Eutrema japonicum. A notoriously difficult-to-grow semi-aquatic plant. It demands cool, shaded conditions and a constant flow of clean water to mimic its native mountain streambeds.",
        "unlockLevel": 20,
        "requiredEnvironment": [
            "env_forest_floor"
        ],
        "requiredTechs": [
            // "tech_irrigation",
        ],
        "idealSeason": "Spring",
        "wateringRequirementType": "lifetime_based",
        "wateringRequirementValue": 1,
        "xpValue": 500,
        "growthStages": [
            { "duration": 12 * 60 * 1000 },
            { "duration": 12 * 60 * 1000 },
            { "duration": 12 * 60 * 1000 },
            { "duration": 12 * 60 * 1000 },
            { "duration": 12 * 60 * 1000 },
        ]
    },
    "dragon_fruit_plant": {
        "id": "dragon_fruit_plant",
        "name": "Dragon Fruit Plant",
        "yields": "dragon_fruit",
        "yieldsAmount": 1,
        "idealSeasonYieldMultiplier": 2,
        "description": "Hylocereus undatus. A vining, sub-tropical cactus that produces a stunning fruit. It requires high heat, vertical support for its climbing habit, and a distinct seasonal trigger to set fruit.",
        "unlockLevel": 30,
        "requiredEnvironment": [
            "env_greenhouse"
        ],
        "requiredTechs": [
            "tech_vertical_supports",
            "tech_compost_bin"
        ],
        "idealSeason": "Summer",
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 3,
        "xpValue": 1000,
        "growthStages": [
            { "duration": 18 * 60 * 1000 },
            { "duration": 18 * 60 * 1000 },
            { "duration": 18 * 60 * 1000 },
            { "duration": 18 * 60 * 1000 },
            { "duration": 18 * 60 * 1000 },
        ]
    },
    "saffron_plant": {
        "id": "saffron_plant",
        "name": "Saffron Plant",
        "yields": "saffron",
        "yieldsAmount": 1,
        "idealSeasonYieldMultiplier": 2,
        "description": "Crocus sativus. A flowering corm known for producing the world's most expensive spice from its tiny stigma. It requires a dormant period in well-drained soil and flowers for a brief period.",
        "unlockLevel": 35,
        "requiredEnvironment": [
            "env_cold_frame"
        ],
        "requiredTechs": [
            "tech_raised_beds"
        ],
        "idealSeason": "Autumn",
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 1,
        "xpValue": 2000,
        "growthStages": [
            { "duration": 36 * 60 * 1000 },
            { "duration": 36 * 60 * 1000 },
            { "duration": 36 * 60 * 1000 },
            { "duration": 36 * 60 * 1000 },
            { "duration": 36 * 60 * 1000 }
        ]
    }
};

export const cropDefinitions: { [id: string]: CropDefinition } = {};

for (const key in crops) {
    const crop = crops[key];

    let seedId = `${crop.yields}_seed`;
    if (crop.yields === 'mushroom') seedId = 'mushroom_spores';
    if (crop.yields === 'wasabi') seedId = 'wasabi_rhizome';
    if (crop.yields === 'saffron') seedId = 'saffron_corm';
    if (crop.yields === 'ginseng') seedId = 'ginseng_root';

    const totalGrowthTime = crop.growthStages.reduce((acc, stage) => acc + stage.duration, 0);
    const totalGrowthTimeInMinutes = totalGrowthTime / (60 * 1000);
    const numberOfStages = crop.growthStages.length;
    const timeBonus = totalGrowthTimeInMinutes / 10;
    const stageBonus = numberOfStages / 4;
    const leavesYield = Math.ceil(1 + (timeBonus * 1.5) + (stageBonus * 1.5));

    cropDefinitions[key] = {
        ...crop,
        xpYield: crop.xpValue,
        seedItemId: seedId,
        yields: crop.yields,
        yieldsAmount: crop.yieldsAmount,
        idealSeasonYieldMultiplier: crop.idealSeasonYieldMultiplier,
        growthMultiplierInIdealSeason: 1.5,
        totalGrowthTime: totalGrowthTime,
        leavesYield: leavesYield,
    };
}