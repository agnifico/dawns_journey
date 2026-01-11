import adapter from '@sveltejs/adapter-vercel';

const npcIds = ['akari', 'claudia', 'cygwin', 'guinevere', 'hanabi', 'hela', 'marjane', 'nyx', 'sylvie', 'veres'];
const characterJournalEntries = npcIds.map(id => `/journal/character/${id}`);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		prerender: {
			entries: [
				'*', // Prerender all static pages
				...characterJournalEntries
			]
		}
	}
};

export default config;