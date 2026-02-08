import { useState } from 'react';
import { useStore } from '../store';
import { Search } from 'lucide-react';
import { cn } from '../lib/utils';
import LeelaImage from './LeelaImage';

export default function Dashboard({ onSelectCard }) {
    const cardsData = useStore((state) => state.cardsData);
    const loading = useStore((state) => state.loading);
    const [query, setQuery] = useState('');

    const filteredCards = Object.values(cardsData).filter((card) => {
        const q = query.toLowerCase();
        // Search in all languages for title or description
        const en = card.en || {};
        const de = card.de || {};
        const ru = card.ru || {};
        const id = String(card.en?.id || card.de?.id || card.ru?.id || '');

        return (
            id.includes(q) ||
            (en.title && en.title.toLowerCase().includes(q)) ||
            (de.title && de.title.toLowerCase().includes(q)) ||
            (ru.title && ru.title.toLowerCase().includes(q))
        );
    }).sort((a, b) => (a.en?.id || 0) - (b.en?.id || 0));

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Leela Cards</h1>
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search cards..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCards.map((card) => {
                    // Prefer EN, then DE, then RU for display
                    const displayCard = card.en || card.de || card.ru;
                    const title = displayCard?.title || 'Untitled';
                    const id = displayCard?.id;
                    const imagePath = displayCard?.image; // e.g. "assets/images/Janma.webp"

                    return (
                        <button
                            key={id}
                            onClick={() => onSelectCard(id)}
                            className="group relative flex flex-col items-center justify-center rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden text-left"
                        >
                            <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900 mb-4 relative">
                                <LeelaImage
                                    path={imagePath}
                                    alt={title}
                                    className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                                    #{id}
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
