import { create } from 'zustand'
import { GithubClient } from './lib/github'

const LANGUAGES = ['en', 'de', 'ru'];
const REPO_OWNER = 'YOUR_GITHUB_USERNAME'; // This will be dynamic
const REPO_NAME = 'AppExperiment1';

export const useStore = create((set, get) => ({
    user: null,
    token: null,
    repoOwner: '',
    repoName: '',
    cardsData: {}, // Map<id, { en: Card, de: Card, ru: Card }>
    wisdomData: {}, // Map<id, { en: Wisdom, de: Wisdom, ru: Wisdom }>
    imageUrls: {}, // Map<path, blobUrl>
    loading: false,
    error: null,
    initialized: false,

    setToken: (token) => {
        localStorage.setItem('github_token', token);
        set({ token });
    },

    fetchImage: async (path) => {
        const { token, repoOwner, repoName, imageUrls } = get();
        if (imageUrls[path]) return imageUrls[path];

        const client = new GithubClient(token, repoOwner, repoName);
        const url = await client.getImage(path);
        if (url) {
            set(state => ({ imageUrls: { ...state.imageUrls, [path]: url } }));
        }
        return url;
    },

    init: async (token, owner, repo) => {
        set({ loading: true, error: null });
        try {
            const client = new GithubClient(token, owner, repo);
            const user = await client.getUser();

            // Fetch all files in parallel
            const filePromises = [];
            LANGUAGES.forEach(lang => {
                filePromises.push(client.getFile(`assets/cards_${lang}.json`).then(res => ({ type: 'cards', lang, data: JSON.parse(res.content), sha: res.sha })));
                filePromises.push(client.getFile(`assets/wisdom_${lang}.json`).then(res => ({ type: 'wisdom', lang, data: JSON.parse(res.content), sha: res.sha })));
            });

            const results = await Promise.all(filePromises);

            const cardsData = {};
            const wisdomData = {};
            const fileShas = {};

            results.forEach(({ type, lang, data, sha }) => {
                fileShas[`${type}_${lang}`] = sha;
                data.forEach(item => {
                    if (type === 'cards') {
                        if (!cardsData[item.id]) cardsData[item.id] = {};
                        cardsData[item.id][lang] = item;
                    } else {
                        if (!wisdomData[item.id]) wisdomData[item.id] = {};
                        wisdomData[item.id][lang] = item;
                    }
                });
            });

            set({
                user,
                token,
                repoOwner: owner,
                repoName: repo,
                cardsData,
                wisdomData,
                fileShas,
                initialized: true,
                loading: false
            });

        } catch (err) {
            console.error(err);
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    logout: () => {
        localStorage.removeItem('github_token');
        set({ user: null, token: null, initialized: false });
    },

    updateCard: (id, lang, field, value) => {
        set(state => {
            const newCards = { ...state.cardsData };
            if (!newCards[id]) newCards[id] = {};
            if (!newCards[id][lang]) newCards[id][lang] = {};

            newCards[id][lang] = { ...newCards[id][lang], [field]: value };
            return { cardsData: newCards };
        });
    },

    updateWisdom: (id, lang, field, value) => {
        set(state => {
            const newWisdom = { ...state.wisdomData };
            if (!newWisdom[id]) newWisdom[id] = {};
            if (!newWisdom[id][lang]) newWisdom[id][lang] = {};

            newWisdom[id][lang] = { ...newWisdom[id][lang], [field]: value };
            return { wisdomData: newWisdom };
        });
    },

    saveChanges: async () => {
        const { token, repoOwner, repoName, cardsData, wisdomData, fileShas } = get();
        if (!token) return;

        set({ loading: true, error: null });
        const client = new GithubClient(token, repoOwner, repoName);

        try {
            // Reconstruct files from the maps
            const promises = [];

            LANGUAGES.forEach(lang => {
                const cardsArr = [];
                const wisdomArr = [];

                // We need to iterate 1..72 or however many IDs exist
                // Assuming IDs are 1-based and contiguous for simplicity, but better to sort keys
                const ids = Object.keys(cardsData).map(Number).sort((a, b) => a - b);

                ids.forEach(id => {
                    if (cardsData[id] && cardsData[id][lang]) cardsArr.push(cardsData[id][lang]);
                    if (wisdomData[id] && wisdomData[id][lang]) wisdomArr.push(wisdomData[id][lang]);
                });

                // Format JSON nicely with 4 spaces indentation
                const newCardsContent = JSON.stringify(cardsArr, null, 4);
                const newWisdomContent = JSON.stringify(wisdomArr, null, 4);

                promises.push(client.updateFile(`assets/cards_${lang}.json`, newCardsContent, `Update cards_${lang}.json via Editor`, fileShas[`cards_${lang}`]));
                promises.push(client.updateFile(`assets/wisdom_${lang}.json`, newWisdomContent, `Update wisdom_${lang}.json via Editor`, fileShas[`wisdom_${lang}`]));
            });

            await Promise.all(promises);

            // Re-fetch to update SHAs (or update them manually if API returns new SHA)
            // For simplicity, we just re-init to be safe and ensure sync
            await get().init(token, repoOwner, repoName);

            alert('Changes saved successfully!');

        } catch (err) {
            console.error(err);
            set({ error: "Failed to save changes: " + err.message, loading: false });
        }
    }
}))
