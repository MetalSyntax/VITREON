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
}

export const HomeView: React.FC<HomeViewProps> = ({ 
    notes, categories, onNoteClick, 
    showFavorites, onToggleFavorites,
    showArchived, onToggleArchive
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Filtering logic:
    // 1. If showFavorites is true, show only pinned notes.
    // 2. If showArchived is true, show only archived notes.
    // 3. Otherwise, show only non-archived notes.
    let filtered = notes;
    if (showFavorites) {
        filtered = filtered.filter(n => n.isPinned);
    } else if (showArchived) {
        filtered = filtered.filter(n => n.isArchived);
    } else {
        filtered = filtered.filter(n => !n.isArchived);
    }
    
    if (searchQuery) {
        filtered = filtered.filter(n => 
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (!n.isLocked && n.content.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }

    const pinned = !showFavorites && !showArchived ? filtered.filter(n => n.isPinned) : [];
    const mainList = !showFavorites && !showArchived ? filtered.filter(n => !n.isPinned) : filtered;

    const getTitle = () => {
        if (showFavorites) return 'Favorites';
        if (showArchived) return 'Archive';
        return 'Vitreon';
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-32 pt-2">
            <div className="px-6 mb-8">
                <div className="relative group">
                    <span className="absolute left-5 top-4 material-symbols-rounded text-slate-500 group-focus-within:text-indigo-400 transition-colors">search</span>
                    <input
                        type="text" placeholder="Smart Search..."
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-12 py-4 rounded-3xl glass-card bg-white/5 border-none focus:ring-2 focus:ring-indigo-500/30 text-white placeholder-slate-500 outline-none transition-all shadow-xl"
                    />
                    <span className="absolute right-5 top-4 material-symbols-rounded text-slate-500 hover:text-indigo-400 cursor-pointer transition-colors">mic</span>
                </div>
            </div>

            {!showFavorites && !showArchived && pinned.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between px-6 mb-4">
                        <h2 className="text-lg font-bold text-white tracking-tight">Pinned Notes</h2>
                        <button className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">View all</button>
                    </div>
                    <div className="flex overflow-x-auto gap-5 px-6 pb-4 no-scrollbar snap-x">
                        {pinned.map(note => <NoteCard key={note.id} note={note} category={categories.find(c => c.id === note.category)} onClick={() => onNoteClick(note)} layout="carousel" />)}
                    </div>
                </div>
            )}

            <div className="px-6 mb-4">
                <h2 className="text-lg font-bold text-white tracking-tight">{showFavorites ? 'Fixed Favorites' : showArchived ? 'Archived Notes' : 'Recent Notes'}</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-6 pb-20">
                {mainList.map(note => <NoteCard key={note.id} note={note} category={categories.find(c => c.id === note.category)} onClick={() => onNoteClick(note)} layout="grid" />)}
                {mainList.length === 0 && pinned.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-30">
                        <span className="material-symbols-rounded text-6xl mb-4 text-slate-400">stylus_note</span>
                        <p className="text-slate-400 font-medium">
                            {showFavorites ? "No favorites yet" : showArchived ? "Archive is empty" : "Start your first thought."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};