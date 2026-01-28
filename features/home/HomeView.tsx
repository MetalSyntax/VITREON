import React, { useState } from 'react';
import { Note, Category } from '../../types';
import { NoteCard } from '../../components/notes/NoteCard';
import { useI18n } from '../../services/i18n';

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
    onReorderNotes: (reorderedNotes: Note[]) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
    notes, categories, onNoteClick, 
    showFavorites, onToggleFavorites,
    showArchived, onToggleArchive,
    selectedCategory, onClearCategory,
    onPinNote, onReorderNotes
}) => {
    const { t, lang } = useI18n();
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [sortBy, setSortBy] = useState<'date' | 'alpha'>(localStorage.getItem('vitreon_sort') as any || 'date');
    const [layoutMode, setLayoutMode] = useState<'grid' | 'list' | 'card'>(localStorage.getItem('vitreon_layout') as any || 'grid');
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dropId, setDropId] = useState<string | null>(null);

    // Filtering logic
    let filtered = [...notes];
    
    // Sorting
    filtered.sort((a, b) => {
        if (sortBy === 'alpha') return a.title.localeCompare(b.title);
        return b.updatedAt - a.updatedAt;
    });

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

    const toggleSort = () => {
        const next = sortBy === 'date' ? 'alpha' : 'date';
        setSortBy(next);
        localStorage.setItem('vitreon_sort', next);
    };

    const nextLayout = () => {
        const modes: ('grid' | 'list' | 'card')[] = ['grid', 'list', 'card'];
        const next = modes[(modes.indexOf(layoutMode) + 1) % modes.length];
        setLayoutMode(next);
        localStorage.setItem('vitreon_layout', next);
    };

    const currentCat = categories.find(c => c.id === selectedCategory);

    const startVoiceSearch = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert(t('speechNotSupported'));
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = lang === 'es' ? 'es-ES' : lang === 'pt' ? 'pt-BR' : 'en-US';
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
        };
        recognition.start();
    };

    const handleDragStart = (e: React.DragEvent | React.TouchEvent, id: string) => {
        setDraggedId(id);
        if ('dataTransfer' in e) {
            e.dataTransfer.effectAllowed = 'move';
        }
    };

    const handleDragOver = (e: React.DragEvent | React.TouchEvent, id: string) => {
        if ('preventDefault' in e) e.preventDefault();
        if (draggedId === null || draggedId === id) return;
        setDropId(id);
    };

    const handleDrop = (e: React.DragEvent | React.TouchEvent, targetId: string) => {
        if ('preventDefault' in e) e.preventDefault();
        if (draggedId === null || draggedId === targetId) {
            setDraggedId(null);
            setDropId(null);
            return;
        }

        const currentList = [...mainList];
        const draggedIndex = currentList.findIndex(n => n.id === draggedId);
        const targetIndex = currentList.findIndex(n => n.id === targetId);

        if (draggedIndex !== -1 && targetIndex !== -1) {
            const [item] = currentList.splice(draggedIndex, 1);
            currentList.splice(targetIndex, 0, item);
            onReorderNotes(currentList);
        }

        setDraggedId(null);
        setDropId(null);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const dropZone = element?.closest('[data-note-id]');
        if (dropZone) {
            const id = dropZone.getAttribute('data-note-id');
            if (id && id !== draggedId) {
                setDropId(id);
            }
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (dropId && draggedId) {
            handleDrop(e, dropId);
        } else {
            setDraggedId(null);
            setDropId(null);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-32 pt-2 transition-colors animate-in fade-in duration-500">
            <div className="px-6 mb-8  stagger-1 flex items-center gap-4">
                <div className="relative group flex-1">
                    <span className="absolute left-5 top-4 material-symbols-rounded text-slate-400 group-focus-within:text-indigo-500 transition-colors">search</span>
                    <input
                        type="text" placeholder={t('search')}
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-4 pr-4 py-4 rounded-3xl glass-card bg-white dark:bg-white/5 border-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all shadow-xl"
                    />
                    <button 
                        onClick={startVoiceSearch}
                        className={`absolute right-5 top-4 material-symbols-rounded text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors ${isListening ? 'text-red-500 animate-pulse' : ''}`}
                    >
                        mic
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={toggleSort}
                        className="w-12 h-12 rounded-2xl glass-card bg-white dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-indigo-500 transition-all shadow-lg active:scale-95"
                        title={sortBy === 'date' ? t('date') : t('alphabetical')}
                    >
                        <span className="material-symbols-rounded">{sortBy === 'date' ? 'calendar_today' : 'sort_by_alpha'}</span>
                    </button>
                    <button 
                        onClick={nextLayout}
                        className="w-12 h-12 rounded-2xl glass-card bg-white dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-indigo-500 transition-all shadow-lg active:scale-95"
                        title={t(layoutMode as any)}
                    >
                        <span className="material-symbols-rounded">{layoutMode === 'grid' ? 'grid_view' : layoutMode === 'list' ? 'view_list' : 'view_agenda'}</span>
                    </button>
                </div>
            </div>

            {selectedCategory && (
                <div className="px-6 mb-6  stagger-1">
                    <div className={`glass-card rounded-2xl p-4 flex items-center justify-between border-l-4 border-${currentCat?.color || 'slate'}-500`}>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-rounded text-indigo-500">{currentCat?.icon || 'folder'}</span>
                            <span className="font-bold text-slate-700 dark:text-white">{t('collection')}: {currentCat?.name || t('unknown')}</span>
                        </div>
                        <button onClick={onClearCategory} className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                            <span className="material-symbols-rounded">close</span>
                        </button>
                    </div>
                </div>
            )}

            {!showFavorites && !showArchived && pinned.length > 0 && (
                <div className="mb-8  stagger-2">
                    <div className="px-6 mb-4">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">{t('pinnedNotes')}</h2>
                    </div>
                    <div className="flex overflow-x-auto gap-5 px-6 pb-4 no-scrollbar snap-x">
                        {pinned.map(note => <NoteCard key={note.id} note={note} category={categories.find(c => c.id === note.category)} onClick={() => onNoteClick(note)} onPin={() => onPinNote(note)} layout="carousel" />)}
                    </div>
                </div>
            )}

            <div className="px-6 mb-4  stagger-3">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">{showFavorites ? t('favorites') : showArchived ? t('archived') : t('allNotes')}</h2>
            </div>
            
            <div className={`
                px-6 pb-20 stagger-4
                ${layoutMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4' : 'flex flex-col gap-3'}
                ${layoutMode === 'card' ? 'max-w-2xl mx-auto w-full' : ''}
            `}>
                {mainList.map((note, idx) => (
                    <div 
                        key={note.id}
                        draggable={!searchQuery && sortBy === 'date' && !showFavorites && !showArchived}
                        data-note-id={note.id}
                        onDragStart={(e) => handleDragStart(e, note.id)}
                        onDragOver={(e) => handleDragOver(e, note.id)}
                        onDrop={(e) => handleDrop(e, note.id)}
                        onDragEnd={() => { setDraggedId(null); setDropId(null); }}
                        onTouchStart={(e) => handleDragStart(e, note.id)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className={`h-full transition-all duration-300 ${draggedId === note.id ? 'opacity-40 scale-95 rotate-2' : 'opacity-100'} ${dropId === note.id ? 'scale-105 rounded-[32px] ring-2 ring-indigo-500/50 p-1' : ''}`}
                    >
                        <NoteCard note={note} category={categories.find(c => c.id === note.category)} onClick={() => onNoteClick(note)} onPin={() => onPinNote(note)} layout={layoutMode} />
                    </div>
                ))}
                {mainList.length === 0 && !pinned.length && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-30">
                        <span className="material-symbols-rounded text-6xl mb-4 text-slate-400">stylus_note</span>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-center">
                            {t('noNotes')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};