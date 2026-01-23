import React, { useState } from 'react';
import { Note, Category } from '../../types';
import { NoteCard } from '../../components/notes/NoteCard';

interface HomeViewProps {
    notes: Note[];
    categories: Category[];
    onNoteClick: (note: Note) => void;
    showFavorites: boolean;
    onToggleFavorites: () => void;
    showArchived: boolean;
    onToggleArchive: () => void;
    selectedCategory: string | null;
    onClearCategory: () => void;
    onPinNote: (note: Note) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
    notes, categories, onNoteClick, 
    showFavorites, onToggleFavorites,
    showArchived, onToggleArchive,
    selectedCategory, onClearCategory,
    onPinNote
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);

    // Filtering logic
    let filtered = notes;
    if (showFavorites) {
        filtered = filtered.filter(n => n.isPinned);
    } else if (showArchived) {
        filtered = filtered.filter(n => n.isArchived);
    } else {
        filtered = filtered.filter(n => !n.isArchived);
        if (selectedCategory) {
            filtered = filtered.filter(n => n.category === selectedCategory);
        }
    }
    
    if (searchQuery) {
        filtered = filtered.filter(n => 
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (!n.isLocked && n.content.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }

    const pinned = !showFavorites && !showArchived ? filtered.filter(n => n.isPinned) : [];
    const mainList = !showFavorites && !showArchived ? filtered.filter(n => !n.isPinned) : filtered;

    const currentCat = categories.find(c => c.id === selectedCategory);

    const startVoiceSearch = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech Recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
        };
        recognition.start();
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-32 pt-2 transition-colors">
            <div className="px-6 mb-8">
                <div className="relative group">
                    <span className="absolute left-5 top-4 material-symbols-rounded text-slate-400 group-focus-within:text-indigo-500 transition-colors">search</span>
                    <input
                        type="text" placeholder="Smart Search..."
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-12 py-4 rounded-3xl glass-card bg-white dark:bg-white/5 border-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all shadow-xl"
                    />
                    <button 
                        onClick={startVoiceSearch}
                        className={`absolute right-5 top-4 material-symbols-rounded text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors ${isListening ? 'text-red-500 animate-pulse' : ''}`}
                    >
                        mic
                    </button>
                </div>
            </div>

            {selectedCategory && (
                <div className="px-6 mb-6">
                    <div className={`glass-card rounded-2xl p-4 flex items-center justify-between border-l-4 border-${currentCat?.color || 'slate'}-500`}>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-rounded text-indigo-500">{currentCat?.icon || 'folder'}</span>
                            <span className="font-bold text-slate-700 dark:text-white">Collection: {currentCat?.name || 'Unknown'}</span>
                        </div>
                        <button onClick={onClearCategory} className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                            <span className="material-symbols-rounded">close</span>
                        </button>
                    </div>
                </div>
            )}

            {!showFavorites && !showArchived && pinned.length > 0 && (
                <div className="mb-8">
                    <div className="px-6 mb-4">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Pinned Notes</h2>
                    </div>
                    <div className="flex overflow-x-auto gap-5 px-6 pb-4 no-scrollbar snap-x">
                        {pinned.map(note => <NoteCard key={note.id} note={note} category={categories.find(c => c.id === note.category)} onClick={() => onNoteClick(note)} onPin={() => onPinNote(note)} layout="carousel" />)}
                    </div>
                </div>
            )}

            <div className="px-6 mb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">{showFavorites ? 'Fixed Favorites' : showArchived ? 'Archived Notes' : 'Recent Notes'}</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-6 pb-20">
                {mainList.map(note => <NoteCard key={note.id} note={note} category={categories.find(c => c.id === note.category)} onClick={() => onNoteClick(note)} onPin={() => onPinNote(note)} layout="grid" />)}
                {mainList.length === 0 && !pinned.length && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-30">
                        <span className="material-symbols-rounded text-6xl mb-4 text-slate-400">stylus_note</span>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-center">
                            {showFavorites ? "No favorites yet" : showArchived ? "Archive is empty" : "No results found for your search."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};