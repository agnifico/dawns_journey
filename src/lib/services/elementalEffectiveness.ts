export const elementalEffectiveness = {
    "Fire": { "Earth": 1, "Water": 0.5, "Light": 1, "Dark": 1, "Wind": 1, "Fire": 1 },
    "Water": { "Fire": 1.5, "Earth": 0.5, "Light": 1, "Dark": 1, "Wind": 1, "Water": 1 },
    "Earth": { "Wind": 1.5, "Fire": 0.5, "Light": 1, "Dark": 1, "Water": 1, "Earth": 1 },
    "Wind": { "Water": 1.5, "Earth": 0.5, "Light": 1, "Dark": 1, "Fire": 1, "Wind": 1 },
    "Light": { "Dark": 1.5, "Light": 0.5, "Fire": 1, "Water": 1, "Earth": 1, "Wind": 1 },
    "Dark": { "Light": 1.5, "Dark": 0.5, "Fire": 1, "Water": 1, "Earth": 1, "Wind": 1 }
};

export const getElementalEffectiveness = (attackingElement: string, defendingElement: string): number => {
    const effectiveness = elementalEffectiveness[attackingElement]?.[defendingElement];
    return effectiveness !== undefined ? effectiveness : 1.0;
};