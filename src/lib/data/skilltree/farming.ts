import type { TechNode } from '$lib/types';

export const farmingTechTree: TechNode[] = [
  // --- Environments ---
  {
    id: "env_open_field",
    name: "Open Field",
    description: "Your basic farming area, exposed to the elements. Starts with 6 plots.",
    unlockLevel: 1, // Already unlocked by default
    costTP: 0,
    prerequisites: []
  },
  {
    id: "env_greenhouse",
    name: "Greenhouse",
    description: "Unlocks a large, climate-controlled area for heat-loving and tropical crops. Starts with 6 plots.",
    unlockLevel: 8,
    costTP: 3,
    prerequisites: []
  },
  {
    id: "env_forest_floor",
    name: "Forest Floor",
    description: "Unlocks a cool, shady area ideal for fungi and shade-loving plants. Starts with 6 plots.",
    unlockLevel: 10,
    costTP: 4,
    prerequisites: []
  },

  // --- Plot Expansion Upgrades ---
  {
    id: "upgrade_open_field_plots",
    name: "Expand Open Field",
    description: "Adds 4 more plots to the Open Field, for a total of 10.",
    unlockLevel: 10,
    costTP: 2,
    prerequisites: ["env_open_field"]
  },
  {
    id: "upgrade_greenhouse_plots",
    name: "Expand Greenhouse",
    description: "Adds 4 more plots to the Greenhouse, for a total of 10.",
    unlockLevel: 15,
    costTP: 3,
    prerequisites: ["env_greenhouse"]
  },
  {
    id: "upgrade_forest_floor_plots",
    name: "Expand Forest Floor",
    description: "Adds 4 more plots to the Forest Floor, for a total of 10.",
    unlockLevel: 18,
    costTP: 3,
    prerequisites: ["env_forest_floor"]
  },

  // --- Technologies ---
  {
    id: "tech_raised_beds",
    name: "Raised Beds",
    description: "Allows construction of raised beds, required for deep-root vegetables.",
    unlockLevel: 5,
    costTP: 1,
    prerequisites: [{ operator: 'OR', items: ["env_open_field", "env_greenhouse", "env_forest_floor"] }],
    applicableTo: { environments: ["env_open_field", "env_greenhouse", "env_forest_floor"] }
  },
  {
    id: "tech_vertical_supports",
    name: "Vertical Supports",
    description: "Allows construction of trellises and stakes for climbing crops.",
    unlockLevel: 5,
    costTP: 1,
    prerequisites: [{ operator: 'OR', items: ["env_open_field", "env_greenhouse"] }],
    applicableTo: { environments: ["env_open_field", "env_greenhouse"] }
  },
  {
    id: "tech_cold_frame", // Renamed from env_cold_frame
    name: "Cold Frame",
    description: "A small, protected area for cool-weather and sensitive crops. Can be built in Greenhouses.",
    unlockLevel: 12,
    costTP: 2,
    prerequisites: ["env_greenhouse"], // Now an upgrade for Greenhouse
    applicableTo: { environments: ["env_greenhouse"] }
  },
  {
    id: "tech_compost_bin",
    name: "Compost Bin",
    description: "Unlocks compost soil. Unlock Compost bin to create such soil.",
    unlockLevel: 12,
    costTP: 2,
    prerequisites: ["env_greenhouse"],
    applicableTo: { environments: ["env_greenhouse"] }
  },
  {
    id: "tech_root_cellar",
    name: "Root Cellar",
    description: "A dark, damp upgrade for the Cold Frame. Required for fungi.",
    unlockLevel: 12,
    costTP: 2,
    prerequisites: ["tech_cold_frame"], // Requires cold frame tech to be applied
    applicableTo: { tech: ["tech_cold_frame"] } // Applies to plots with cold frame tech
  },
  {
    id: "tech_irrigation",
    name: "Irrigation System",
    description: "Automates watering for all plots within the Greenhouse and Cold Frame.",
    unlockLevel: 20,
    costTP: 5,
    prerequisites: ["env_greenhouse", "tech_cold_frame"]
  },

  // --- Super Upgrades ---
  {
    id: "hire_saoirse",
    name: "Hire Saoirse",
    description: "Hire Saoirse to manage your farm (Auto Harvest Crops + Re-plant).",
    unlockLevel: 25,
    costTP: 8,
    prerequisites: ["tech_irrigation"]
  },
  {
    id: "thunders_blessing",
    name: "The Thunder's Blessing",
    description: "A mysterious NPC who can change the current season at will",
    unlockLevel: 30,
    costTP: 10,
    prerequisites: ["env_greenhouse", "tech_cold_frame"]
  },
  {
    id: "decree_of_verdis",
    name: "Decree of Verdis",
    description: "\"These lands will bloom again\" - Awoken Goddess of The Earth. A permanent 3x yield multiplier for all harvests.",
    unlockLevel: 35,
    costTP: 15,
    prerequisites: ["thunders_blessing", "hire_saoirse"]
  }
];
