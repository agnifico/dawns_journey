export const elementalEffectiveness = {
    "Fire": { "Earth": 1.5, "Water": 0.5, "Light": 1, "Dark": 1, "Wind": 1, "Fire": 0.75, "Normal": 1 },
    "Water": { "Fire": 1.5, "Earth": 0.5, "Light": 1, "Dark": 1, "Wind": 1, "Water": 0.75, "Normal": 1 },
    "Earth": { "Wind": 1.5, "Fire": 0.5, "Light": 1, "Dark": 1, "Water": 1, "Earth": 0.75, "Normal": 1 },
    "Wind": { "Water": 1.5, "Earth": 0.5, "Light": 1, "Dark": 1, "Fire": 1, "Wind": 0.75, "Normal": 1 },
    "Light": { "Dark": 1.5, "Light": 1, "Fire": 1, "Water": 1, "Earth": 1, "Wind": 1, "Normal": 0.5 },
    "Dark": { "Light": 1.5, "Dark": 1, "Fire": 1, "Water": 1, "Earth": 1, "Wind": 1, "Normal": 0.5 },
    "Normal": { "Dark": 1, "Light": 1, "Fire": 1, "Water": 1, "Earth": 1, "Wind": 1, "Normal": 1 },
};

export const getElementalEffectiveness = (attackingElement: string, defendingElement: string): number => {
    const effectiveness = elementalEffectiveness[attackingElement]?.[defendingElement];
    return effectiveness !== undefined ? effectiveness : 1.0;
};