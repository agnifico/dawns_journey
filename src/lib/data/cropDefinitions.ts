import type { CropDefinition } from '../types';

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
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/fava_bean_00.png"
            },
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/fava_bean_01.png"
            },
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/fava_bean_02.png"
            },
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/fava_bean_03.png"
            },
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/fava_bean_04.png"
            },
            {
                "duration": 1 * 60 * 1000, // 1 minute
                "imagePath": "/crops/fava_bean_05.png"
            }
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
    "tomato": {
        "id": "tomato",
        "name": "Tomato",
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
                "imagePath": "/crops/tomato_00.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/tomato_01.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/tomato_02.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/tomato_03.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/tomato_04.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/tomato_05.png"
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
            {
                "duration": 2 * 60 * 1000, // 2 minutes (rounded from 1.5)
                "imagePath": "/crops/snow_pea_00.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/snow_pea_01.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/snow_pea_02.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/snow_pea_03.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/snow_pea_04.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/snow_pea_05.png"
            }
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
            {
                "duration": 2 * 60 * 1000, // 2 minutes (rounded from 1.75)
                "imagePath": "/crops/cucumber_00.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/cucumber_01.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/cucumber_02.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/cucumber_03.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/cucumber_04.png"
            },
            {
                "duration": 2 * 60 * 1000, // 2 minutes
                "imagePath": "/crops/cucumber_05.png"
            }
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
            {
                "duration": 9 * 60 * 1000, // 9 minutes
                "imagePath": "/crops/cardamom_00.png"
            },
            {
                "duration": 9 * 60 * 1000, // 9 minutes
                "imagePath": "/crops/cardamom_01.png"
            },
            {
                "duration": 9 * 60 * 1000, // 9 minutes
                "imagePath": "/crops/cardamom_02.png"
            },
            {
                "duration": 9 * 60 * 1000, // 9 minutes
                "imagePath": "/crops/cardamom_03.png"
            },
            {
                "duration": 9 * 60 * 1000, // 9 minutes
                "imagePath": "/crops/cardamom_04.png"
            },
            {
                "duration": 9 * 60 * 1000, // 9 minutes
                "imagePath": "/crops/cardamom_05.png"
            }
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
            {
                "duration": 24 * 60 * 1000, // 24 minutes
                "imagePath": "/crops/ginseng_00.png"
            },
            {
                "duration": 24 * 60 * 1000, // 24 minutes
                "imagePath": "/crops/ginseng_01.png"
            },
            {
                "duration": 24 * 60 * 1000, // 24 minutes
                "imagePath": "/crops/ginseng_02.png"
            },
            {
                "duration": 24 * 60 * 1000, // 24 minutes
                "imagePath": "/crops/ginseng_03.png"
            },
            {
                "duration": 24 * 60 * 1000, // 24 minutes
                "imagePath": "/crops/ginseng_04.png"
            },
            {
                "duration": 24 * 60 * 1000, // 24 minutes
                "imagePath": "/crops/ginseng_05.png"
            }
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
            {
                "duration": 18 * 60 * 1000, // 18 minutes
                "imagePath": "/crops/dragon_fruit_00.png"
            },
            {
                "duration": 18 * 60 * 1000, // 18 minutes
                "imagePath": "/crops/dragon_fruit_01.png"
            },
            {
                "duration": 18 * 60 * 1000, // 18 minutes
                "imagePath": "/crops/dragon_fruit_02.png"
            },
            {
                "duration": 18 * 60 * 1000, // 18 minutes
                "imagePath": "/crops/dragon_fruit_03.png"
            },
            {
                "duration": 18 * 60 * 1000, // 18 minutes
                "imagePath": "/crops/dragon_fruit_04.png"
            },
            {
                "duration": 18 * 60 * 1000, // 18 minutes
                "imagePath": "/crops/dragon_fruit_05.png"
            }
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
                "imagePath": "/crops/saffron_00.png"
            },
            {
                "duration": 36 * 60 * 1000, // 36 minutes
                "imagePath": "/crops/saffron_01.png"
            },
            {
                "duration": 36 * 60 * 1000, // 36 minutes
                "imagePath": "/crops/saffron_02.png"
            },
            {
                "duration": 36 * 60 * 1000, // 36 minutes
                "imagePath": "/crops/saffron_03.png"
            },
            {
                "duration": 36 * 60 * 1000, // 36 minutes
                "imagePath": "/crops/saffron_04.png"
            },
            {
                "duration": 36 * 60 * 1000, // 36 minutes
                "imagePath": "/crops/saffron_05.png"
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
