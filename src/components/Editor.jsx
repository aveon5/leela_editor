import { useState } from 'react';
import { useStore } from '../store';
import { ChevronLeft, Save, Sparkles, HelpCircle, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import LeelaImage from './LeelaImage';

export default function Editor({ cardId, onClose }) {
    const [activeLang, setActiveLang] = useState('en');
    const [activeTab, setActiveTab] = useState('card'); // 'card' | 'wisdom'

    const cardsData = useStore((state) => state.cardsData);
    const wisdomData = useStore((state) => state.wisdomData);
    const updateCard = useStore((state) => state.updateCard);
    const updateWisdom = useStore((state) => state.updateWisdom);
    const saveChanges = useStore((state) => state.saveChanges);
    const loading = useStore((state) => state.loading);

    const card = cardsData[cardId] || {};
    const wisdom = wisdomData[cardId] || {};

    const currentCard = card[activeLang] || {};
    const currentWisdom = wisdom[activeLang] || {};

    const handleCardChange = (field, value) => {
        updateCard(cardId, activeLang, field, value);
    };

    const handleWisdomChange = (field, value) => {
        updateWisdom(cardId, activeLang, field, value);
    };

    const handleSave = async () => {
        await saveChanges();
    };

    const imagePath = currentCard.image || card.en?.image;

    return (
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b bg-white dark:bg-gray-800 flex items-center justify-between px-6 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <ChevronLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Editing Card #{cardId}: {currentCard.title || 'Untitled'}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        {['en', 'de', 'ru'].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setActiveLang(lang)}
                                className={cn(
                                    "px-3 py-1 text-sm font-medium rounded-md transition-all uppercase",
                                    activeLang === lang
                                        ? "bg-white dark:bg-gray-600 text-indigo-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                                )}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={cn(
                            "flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors",
                            loading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Preview */}
                <div className="w-[400px] border-r bg-white dark:bg-gray-800 hidden lg:flex flex-col overflow-y-auto p-6">
                    <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-lg mb-6 bg-gray-200">
                        <LeelaImage path={imagePath} alt="Card Preview" className="w-full h-full object-cover" />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Metadata</h3>
                            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-sm font-mono text-gray-600 dark:text-gray-300">
                                ID: {cardId}<br />
                                Lang: {activeLang.toUpperCase()}<br />
                                Status: Loaded
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Editor */}
                <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-6">
                        {[
                            { id: 'card', label: 'Card Information', icon: BookOpen },
                            { id: 'wisdom', label: 'Daily Wisdom', icon: Sparkles },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                                    activeTab === tab.id
                                        ? "border-indigo-600 text-indigo-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Form Fields */}
                    <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
                        {activeTab === 'card' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Title */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                                    <input
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-lg font-bold"
                                        value={currentCard.title || ''}
                                        onChange={e => handleCardChange('title', e.target.value)}
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                    <textarea
                                        className="w-full h-32 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                                        value={currentCard.description || ''}
                                        onChange={e => handleCardChange('description', e.target.value)}
                                    />
                                </div>

                                {/* Questions */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <HelpCircle className="w-4 h-4" /> Questions
                                    </label>
                                    <textarea
                                        className="w-full h-24 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                                        value={currentCard.questions || ''}
                                        onChange={e => handleCardChange('questions', e.target.value)}
                                    />
                                </div>

                                {/* Themes sections - Arrays */}
                                {['theme_location', 'theme_blindspot', 'theme_solution'].map((themeArrayKey) => (
                                    <div key={themeArrayKey} className="space-y-2 p-4 border rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">
                                            {themeArrayKey.replace('theme_', '')}
                                        </label>
                                        {(currentCard[themeArrayKey] || []).map((item, idx) => (
                                            <input
                                                key={idx}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm mb-2"
                                                value={item}
                                                onChange={e => {
                                                    const newArr = [...(currentCard[themeArrayKey] || [])];
                                                    newArr[idx] = e.target.value;
                                                    handleCardChange(themeArrayKey, newArr);
                                                }}
                                            />
                                        ))}
                                        <button
                                            className="text-xs text-indigo-600 font-medium hover:underline"
                                            onClick={() => handleCardChange(themeArrayKey, [...(currentCard[themeArrayKey] || []), ''])}
                                        >
                                            + Add Item
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'wisdom' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 text-amber-800 dark:text-amber-200 text-sm mb-6">
                                    This content appears in the "Daily Wisdom" section of the app.
                                </div>

                                {/* Daily Wisdom */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Wisdom Text</label>
                                    <textarea
                                        className="w-full h-24 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                                        value={currentWisdom.daily_wisdom || ''}
                                        onChange={e => handleWisdomChange('daily_wisdom', e.target.value)}
                                    />
                                </div>

                                {/* Citation */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Citation (Short)</label>
                                    <input
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 font-serif italic"
                                        value={currentWisdom.citation || ''}
                                        onChange={e => handleWisdomChange('citation', e.target.value)}
                                    />
                                </div>

                                {/* External Citation */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Author Quote</label>
                                    <textarea
                                        className="w-full h-20 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                                        value={currentWisdom.external_citation || ''}
                                        onChange={e => handleWisdomChange('external_citation', e.target.value)}
                                    />
                                </div>

                                {/* Practice */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Practice</label>
                                    <textarea
                                        className="w-full h-24 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100"
                                        value={currentWisdom.daily_practice || ''}
                                        onChange={e => handleWisdomChange('daily_practice', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
