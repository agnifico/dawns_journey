import { cropDefinitions } from './cropDefinitions';
import type { CropDefinition } from '../types';

/**
 * A map of plot configurations to the crops they unlock.
 * The key is a unique string representing the plot's required environment,
 * and applied technologies.
 *
 * This map is dynamically generated from cropDefinitions to ensure it's always in sync.
 */
export const cropUnlockMap: { [key: string]: string[] } = {};

// Helper to generate a unique key for a plot configuration
function generatePlotKey(environment: string, appliedTech: string[]): string {
    const sortedTech = [...appliedTech].sort(); // Ensure consistent key generation
    return `${environment}:${sortedTech.join(':')}`;
}

// Populate the cropUnlockMap
for (const cropId in cropDefinitions) {
    const cropDef = cropDefinitions[cropId];

    // For each required environment, and for each combination of requiredTech,
    // add the crop to the map. This can lead to multiple entries for a single crop
    // if it can be grown in different configurations.

    // This is a simplified approach. A more robust solution might involve
    // generating all possible valid tech combinations for each environment.
    // For now, we'll just use the exact requiredEnvironment and requiredTech from the cropDef.

    // If a crop has no requiredTech, it just needs the environment.
    if (cropDef.requiredTech.length === 0) {
        cropDef.requiredEnvironment.forEach(env => {
            const key = generatePlotKey(env, []);
            if (!cropUnlockMap[key]) {
                cropUnlockMap[key] = [];
            }
            cropUnlockMap[key].push(cropId);
        });
    } else {
        // If a crop has requiredTech, it needs both the environment and ALL of those techs.
        cropDef.requiredEnvironment.forEach(env => {
            const key = generatePlotKey(env, cropDef.requiredTech);
            if (!cropUnlockMap[key]) {
                cropUnlockMap[key] = [];
            }
            cropUnlockMap[key].push(cropId);
        });
    }
}

// Optional: Log the generated map for verification during development
// console.log('Generated Crop Unlock Map:', cropUnlockMap);
