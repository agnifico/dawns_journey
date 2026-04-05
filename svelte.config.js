import adapter from '@sveltejs/adapter-vercel';

const npcIds = ['verona', 'claudia', 'cygwin', 'guinevere', 'aoife', 'hela', 'marjane', 'nyx', 'sylvie', 'veres'];
const characterJournalEntries = npcIds.map(id => `/journal/character/${id}`);

const helpSlugs = [
    'walking', 'exploration', 'world-resonance', 'items',
    'encounters', 'legendary-enemies', 'drops',
    'elements', 'weapon-stats', 'infusion', 'abilities', 'arena',
    'characters_main', 'characters_talking', 'gifting',
    'factions', 'shop',
    'skilling_farming', 'skilling_woodcutting', 'skilling_mining',
    'skilling_alchemy', 'skilling_cooking', 'skilling_smithing',
    'ui'
];
const helpEntries = helpSlugs.map(s => `/help/${s}`);

const config = {
    kit: {
        adapter: adapter(),
        prerender: {
            entries: [
                '*',
                ...characterJournalEntries,
                ...helpEntries
            ]
        }
    }
};

export default config;