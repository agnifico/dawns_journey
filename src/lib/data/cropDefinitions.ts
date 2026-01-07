import type { CropDefinition } from '../types';

// --- HELPER FUNCTIONS (from imageUtils.ts) ---

/**
 * Generates a two-letter abbreviation for a crop name.
 * e.g., "Snow Pea" -> "SP", "Ginseng" -> "Gi"
 * @param name The full name of the crop.
 * @returns A two-letter string.
 */
function getAbbreviation(name: string): string {
    const words = name.split(' ');
    if (words.length > 1) {
        return (words[0][0] + (words[1][0] || '')).toUpperCase();
    }
    return name.substring(0, 2);
}

/**
 * Generates a data URI for a square SVG placeholder image with two letters.
 * @param abbreviation The two-letter string to display.
 * @returns A data URI string.
 */
function generatePlaceholder(abbreviation: string): string {
    const bgColor = '#5a5a5a'; // A neutral dark grey
    const textColor = '#ffffff';
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
            <rect width="80" height="80" fill="${bgColor}" />
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-size="32" font-family="monospace" font-weight="bold">
                ${abbreviation}
            </text>
        </svg>
    `.trim().replace(/\s\s+/g, ' ');

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}


// --- CROP DATA ---

const crops: { [id: string]: Omit<CropDefinition, 'seedItemId' | 'yield' | 'growthMultiplierInIdealSeason' | 'yieldMultiplierInIdealSeason' | 'totalGrowthTime'> & { xpValue: number } } = {
    "potato": {
        "id": "potato",
        "name": "Potato",
        "description": "Solanum tuberosum. A starchy tuber prized for its energy content. It grows best in well-drained, loose soil, allowing the tubers to expand.",
        "unlockLevel": 1,
        "requiredEnvironment": [
            "env_open_field"
        ],
        "requiredTech": [],
        "idealSeason": "Spring",
        "wateringRequirementType": "lifetime_based",
        "wateringRequirementValue": 2,
        "xpValue": 10,
        "growthStages": [
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/potato_00.png"
            },
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/potato_01.png"
            },
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/potato_02.png"
            },
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/potato_03.png"
            },
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/potato_04.png"
            },
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/potato_05.png"
            }
        ]
    },
    "wheat": {
        "id": "wheat",
        "name": "Wheat",
        "description": "Triticum aestivum. A cereal grass cultivated for its seed. It is a staple food, preferring open, sunny fields where its grain can ripen.",
        "unlockLevel": 2,
        "requiredEnvironment": [
            "env_open_field"
        ],
        "requiredTech": [],
        "idealSeason": "Summer",
        "wateringRequirementType": "lifetime_based",
        "wateringRequirementValue": 5,
        "xpValue": 12,
        "growthStages": [
            {
                "duration": 2 * 60 * 1000, // 2 minutes (rounded from 1.5)
                "imagePath": "/crops/wheat_00.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/wheat_01.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/wheat_02.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/wheat_03.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/wheat_04.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/wheat_05.png"
            }
        ]
    },
    "carrot": {
        "id": "carrot",
        "name": "Carrot",
        "description": "Daucus carota. A biennial root vegetable, though grown as an annual. Requires loose, deep soil (like a raised bed) to prevent forking and promote a straight taproot.",
        "unlockLevel": 5,
        "requiredEnvironment": [
            "env_open_field",
            "env_cold_frame"
        ],
        "requiredTech": [
            "tech_raised_beds"
        ],
        "idealSeason": "Autumn",
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 1,
        "xpValue": 20,
        "growthStages": [
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/carrot_00.png"
            },
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/carrot_01.png"
            },
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/carrot_02.png"
            },
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/carrot_03.png"
            },
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/carrot_04.png"
            },
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/carrot_05.png"
            }
        ]
    },
    "fava_bean": {
        "id": "fava_bean",
        "name": "Fava Bean",
        "description": "Vicia faba. A hardy legume that grows in an upright pod. As a vining plant, it requires vertical support to maximize yield and air circulation.",
        "unlockLevel": 5,
        "requiredEnvironment": [
            "env_open_field",
            "env_greenhouse"
        ],
        "requiredTech": [
            "tech_vertical_supports"
        ],
        "idealSeason": "Spring",
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 1,
        "xpValue": 25,
        "growthStages": [
            { "duration": 1 * 60 * 1000, "imagePath": "" },
            { "duration": 1 * 60 * 1000, "imagePath": "" },
            { "duration": 1 * 60 * 1000, "imagePath": "" },
            { "duration": 1 * 60 * 1000, "imagePath": "" },
            { "duration": 1 * 60 * 1000, "imagePath": "" },
            { "duration": 1 * 60 * 1000, "imagePath": "" }
        ]
    },
    "kale": {
        "id": "kale",
        "name": "Kale",
        "description": "Brassica oleracea var. sabellica. A hardy brassica with dark, leafy greens. It is exceptionally frost-tolerant; a light frost can sweeten its flavor by converting starches to sugars.",
        "unlockLevel": 8,
        "requiredEnvironment": [
            "env_cold_frame"
        ],
        "requiredTech": [],
        "idealSeason": "Winter",
        "wateringRequirementType": "lifetime_based",
        "wateringRequirementValue": 5,
        "xpValue": 40,
        "growthStages": [
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/kale_00.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/kale_01.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/kale_02.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/kale_03.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/kale_04.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/kale_05.png"
            }
        ]
    },
    "tomatoo": {
        "id": "tomatoo",
        "name": "Tomato X",
        "description": "Solanum lycopersicum. A heat-loving fruit, commonly treated as a vegetable. It is sensitive to cold and requires a long, warm growing season, making a greenhouse ideal.",
        "unlockLevel": 8,
        "requiredEnvironment": [
            "env_greenhouse"
        ],
        "requiredTech": [],
        "idealSeason": "Summer",
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 1,
        "xpValue": 45,
        "growthStages": [
            {
                "duration": 2 * 60 * 1000, // 2 minutes (rounded from 1.5)
                "imagePath": ""
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": ""
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": ""
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": ""
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": ""
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": ""
            }
        ]
    },
    "parsnip": {
        "id": "parsnip",
        "name": "Parsnip",
        "description": "Pastinaca sativa. A root vegetable closely related to the carrot. It requires a long growing season and its flavor is best developed after a few frosts.",
        "unlockLevel": 10,
        "requiredEnvironment": [
            "env_cold_frame"
        ],
        "requiredTech": [
            "tech_raised_beds"
        ],
        "idealSeason": "Winter",
        "wateringRequirementType": "lifetime_based",
        "wateringRequirementValue": 10,
        "xpValue": 60,
        "growthStages": [
            {
                "duration": 3 * 60 * 1000, // 3 minutes
                "imagePath": "/crops/parsnip_00.png"
            },
            {
                "duration": 3 * 60 * 1000, // 3 minutes
                "imagePath": "/crops/parsnip_01.png"
            },
            {
                "duration": 3 * 60 * 1000, // 3 minutes
                "imagePath": "/crops/parsnip_02.png"
            },
            {
                "duration": 3 * 60 * 1000, // 3 minutes
                "imagePath": "/crops/parsnip_03.png"
            },
            {
                "duration": 3 * 60 * 1000, // 3 minutes
                "imagePath": "/crops/parsnip_04.png"
            },
            {
                "duration": 3 * 60 * 1000, // 3 minutes
                "imagePath": "/crops/parsnip_05.png"
            }
        ]
    },
    "snow_pea": {
        "id": "snow_pea",
        "name": "Snow Pea",
        "description": "Pisum sativum var. saccharatum. A vining legume with edible pods. It prefers cool weather and will stop producing in high heat, making it a perfect crop for a cold frame.",
        "unlockLevel": 10,
        "requiredEnvironment": [
            "env_cold_frame"
        ],
        "requiredTech": [
            "tech_vertical_supports"
        ],
        "idealSeason": "Spring",
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 1,
        "xpValue": 55,
        "growthStages": [
            { "duration": 2 * 60 * 1000, "imagePath": "" },
            { "duration": 2 * 60 * 1000, "imagePath": "" },
            { "duration": 2 * 60 * 1000, "imagePath": "" },
            { "duration": 2 * 60 * 1000, "imagePath": "" },
            { "duration": 2 * 60 * 1000, "imagePath": "" },
            { "duration": 2 * 60 * 1000, "imagePath": "" }
        ]
    },
    "cucumber": {
        "id": "cucumber",
        "name": "Cucumber",
        "description": "Cucumis sativus. A vining plant in the gourd family. It requires consistent moisture and warmth, and its climbing tendrils thrive with vertical support.",
        "unlockLevel": 10,
        "requiredEnvironment": [
            "env_greenhouse"
        ],
        "requiredTech": [
            "tech_vertical_supports"
        ],
        "idealSeason": "Summer",
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 2,
        "xpValue": 65,
        "growthStages": [
            { "duration": 2 * 60 * 1000, "imagePath": "" },
            { "duration": 2 * 60 * 1000, "imagePath": "" },
            { "duration": 2 * 60 * 1000, "imagePath": "" },
            { "duration": 2 * 60 * 1000, "imagePath": "" },
            { "duration": 2 * 60 * 1000, "imagePath": "" },
            { "duration": 2 * 60 * 1000, "imagePath": "" }
        ]
    },
    "pumpkin": {
        "id": "pumpkin",
        "name": "Pumpkin",
        "description": "Cucurbita pepo. A large, heavy-feeding winter squash. Its sprawling vines demand significant space and nutrient-rich soil (compost) to produce large fruit.",
        "unlockLevel": 12,
        "requiredEnvironment": [
            "env_greenhouse"
        ],
        "requiredTech": [
            "tech_compost_bin"
        ],
        "idealSeason": "Autumn",
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 2,
        "xpValue": 100,
        "growthStages": [
            {
                "duration": 4 * 60 * 1000, // 4 minutes
                "imagePath": "/crops/pumpkin_00.png"
            },
            {
                "duration": 4 * 60 * 1000, // 4 minutes
                "imagePath": "/crops/pumpkin_01.png"
            },
            {
                "duration": 4 * 60 * 1000, // 4 minutes
                "imagePath": "/crops/pumpkin_02.png"
            },
            {
                "duration": 4 * 60 * 1000, // 4 minutes
                "imagePath": "/crops/pumpkin_03.png"
            },
            {
                "duration": 4 * 60 * 1000, // 4 minutes
                "imagePath": "/crops/pumpkin_04.png"
            },
            {
                "duration": 4 * 60 * 1000, // 4 minutes
                "imagePath": "/crops/pumpkin_05.png"
            }
        ]
    },
    "mushroom": {
        "id": "mushroom",
        "name": "Mushroom",
        "description": "Agaricus bisporus. The fruiting body of a fungus, not a plant. It thrives in dark, humid conditions, drawing nutrients from a rich, decaying substrate.",
        "unlockLevel": 12,
        "requiredEnvironment": [
            "env_forest_floor"
        ],
        "requiredTech": [],
        "idealSeason": null,
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 1,
        "xpValue": 75,
        "growthStages": [
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/mushroom_00.png"
            },
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/mushroom_01.png"
            },
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/mushroom_02.png"
            },
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/mushroom_03.png"
            }
        ]
    },
    "cardamom": {
        "id": "cardamom",
        "name": "Cardamom",
        "description": "Elettaria cardamomum. A tropical, perennial herb known for its aromatic seed pods. It requires a humid, warm environment and rich, organic soil.",
        "unlockLevel": 15,
        "requiredEnvironment": [
            "env_greenhouse"
        ],
        "requiredTech": [
            "tech_vertical_supports",
            "tech_compost_bin"
        ],
        "idealSeason": "Summer",
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 2,
        "xpValue": 180,
        "growthStages": [
            { "duration": 9 * 60 * 1000, "imagePath": "" },
            { "duration": 9 * 60 * 1000, "imagePath": "" },
            { "duration": 9 * 60 * 1000, "imagePath": "" },
            { "duration": 9 * 60 * 1000, "imagePath": "" },
            { "duration": 9 * 60 * 1000, "imagePath": "" },
            { "duration": 9 * 60 * 1000, "imagePath": "" }
        ]
    },
    "ginseng": {
        "id": "ginseng",
        "name": "Ginseng",
        "description": "Panax quinquefolius. A perennial herb prized for its slow-growing medicinal root. It requires deep shade and well-drained, rich soil, simulating its native forest floor environment.",
        "unlockLevel": 15,
        "requiredEnvironment": [
            "env_forest_floor"
        ],
        "requiredTech": [
            "tech_raised_beds"
        ],
        "idealSeason": "Autumn",
        "wateringRequirementType": "lifetime_based",
        "wateringRequirementValue": 20,
        "xpValue": 300,
        "growthStages": [
            { "duration": 24 * 60 * 1000, "imagePath": "" },
            { "duration": 24 * 60 * 1000, "imagePath": "" },
            { "duration": 24 * 60 * 1000, "imagePath": "" },
            { "duration": 24 * 60 * 1000, "imagePath": "" },
            { "duration": 24 * 60 * 1000, "imagePath": "" },
            { "duration": 24 * 60 * 1000, "imagePath": "" }
        ]
    },
    "wasabi": {
        "id": "wasabi",
        "name": "Wasabi",
        "description": "Eutrema japonicum. A notoriously difficult-to-grow semi-aquatic plant. It demands cool, shaded conditions and a constant flow of clean water to mimic its native mountain streambeds.",
        "unlockLevel": 20,
        "requiredEnvironment": [
            "env_forest_floor"
        ],
        "requiredTech": [
            "tech_irrigation"
        ],
        "idealSeason": "Spring",
        "wateringRequirementType": "lifetime_based",
        "wateringRequirementValue": 1,
        "xpValue": 500,
        "growthStages": [
            {
                "duration": 12 * 60 * 1000, // 12 minutes
                "imagePath": "/crops/wasabi_00.png"
            },
            {
                "duration": 12 * 60 * 1000, // 12 minutes
                "imagePath": "/crops/wasabi_01.png"
            },
            {
                "duration": 12 * 60 * 1000, // 12 minutes
                "imagePath": "/crops/wasabi_02.png"
            },
            {
                "duration": 12 * 60 * 1000, // 12 minutes
                "imagePath": "/crops/wasabi_03.png"
            },
            {
                "duration": 12 * 60 * 1000, // 12 minutes
                "imagePath": "/crops/wasabi_04.png"
            },
            {
                "duration": 12 * 60 * 1000, // 12 minutes
                "imagePath": "/crops/wasabi_05.png"
            }
        ]
    },
    "dragon_fruit": {
        "id": "dragon_fruit",
        "name": "Dragon Fruit",
        "description": "Hylocereus undatus. A vining, sub-tropical cactus that produces a stunning fruit. It requires high heat, vertical support for its climbing habit, and a distinct seasonal trigger to set fruit.",
        "unlockLevel": 30,
        "requiredEnvironment": [
            "env_greenhouse"
        ],
        "requiredTech": [
            "tech_vertical_supports",
            "tech_compost_bin"
        ],
        "requiredUpgrades": [
            "upgrade_season_control"
        ],
        "idealSeason": "Summer",
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 3,
        "xpValue": 1000,
        "growthStages": [
            { "duration": 18 * 60 * 1000, "imagePath": "" },
            { "duration": 18 * 60 * 1000, "imagePath": "" },
            { "duration": 18 * 60 * 1000, "imagePath": "" },
            { "duration": 18 * 60 * 1000, "imagePath": "" },
            { "duration": 18 * 60 * 1000, "imagePath": "" },
            { "duration": 18 * 60 * 1000, "imagePath": "" }
        ]
    },
    "saffron": {
        "id": "saffron",
        "name": "Saffron",
        "description": "Crocus sativus. A flowering corm known for producing the world's most expensive spice from its tiny stigma. It requires a dormant period in well-drained soil and flowers for a brief period.",
        "unlockLevel": 35,
        "requiredEnvironment": [
            "env_cold_frame"
        ],
        "requiredTech": [
            "tech_raised_beds"
        ],
        "requiredUpgrades": [
            "upgrade_super_compost"
        ],
        "idealSeason": "Autumn",
        "wateringRequirementType": "stage_based",
        "wateringRequirementValue": 1,
        "xpValue": 2000,
        "growthStages": [
            {
                "duration": 36 * 60 * 1000, // 36 minutes
                "imagePath": ""
            },
            {
                "duration": 36 * 60 * 1000, // 36 minutes
                "imagePath": ""
            },
            {
                "duration": 36 * 60 * 1000, // 36 minutes
                "imagePath": ""
            },
            {
                "duration": 36 * 60 * 1000, // 36 minutes
                "imagePath": ""
            },
            {
                "duration": 36 * 60 * 1000, // 36 minutes
                "imagePath": ""
            },
            {
                "duration": 36 * 60 * 1000, // 36 minutes
                "imagePath": ""
            }
        ]
    }
};

export const cropDefinitions: { [id: string]: CropDefinition } = {};

for (const key in crops) {
    const crop = crops[key];
    
    let seedId = `${crop.id}_seed`;
    if (crop.id === 'mushroom') seedId = 'mushroom_spores';
    if (crop.id === 'wasabi') seedId = 'wasabi_rhizome';
    if (crop.id === 'saffron') seedId = 'saffron_corm';
    if (crop.id === 'ginseng') seedId = 'ginseng_root';

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
        yield: [{ itemId: crop.id, amount: 1 }],
        growthMultiplierInIdealSeason: 1.5,
        yieldMultiplierInIdealSeason: 1.5,
        totalGrowthTime: totalGrowthTime,
        leavesYield: leavesYield,
    };
}

// --- DATA CLEANUP ---
const placeholderCrops = new Set(['fava_bean', 'ginseng', 'cardamom', 'dragon_fruit', 'cucumber', 'snow_pea']);

for (const key in cropDefinitions) {
    const crop = cropDefinitions[key];
    
    // Handle crops that need a placeholder
    if (placeholderCrops.has(crop.id)) {
        const placeholder = generatePlaceholder(getAbbreviation(crop.name));
        crop.growthStages.forEach(stage => stage.imagePath = placeholder);
    } 
    // Handle other crops that might be missing some images
    else {
        const finalStageImage = crop.growthStages[crop.growthStages.length - 1]?.imagePath;
        if (finalStageImage) {
            crop.growthStages.forEach(stage => {
                if (!stage.imagePath) {
                    stage.imagePath = finalStageImage;
                }
            });
        }
        // If even the final image is missing for a non-placeholder crop, generate a placeholder as a last resort
        else {
            const placeholder = generatePlaceholder(getAbbreviation(crop.name));
            crop.growthStages.forEach(stage => stage.imagePath = placeholder);
        }
    }
}