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
    showTrash: boolean;
    onToggleTrash: () => void;
    onRestoreNote: (note: Note) => void;
    onDeleteNote: (id: string) => void;
    onEmptyTrash: () => void;
    onUpdateNote: (note: Note) => void;
    onBulkAction: (
        ids: string[],
        action: 'pin' | 'unpin' | 'archive' | 'delete' | 'changeCategory' | 'addTags',
        payload?: string | string[]
    ) => Promise<void>;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
    notes, categories, onNoteClick, 
    showFavorites, onToggleFavorites,
    showArchived, onToggleArchive,
    showTrash, onToggleTrash,
    onRestoreNote, onDeleteNote, onEmptyTrash,
    onUpdateNote,
    selectedCategory, onClearCategory,
    onPinNote, onReorderNotes,
    onBulkAction,
}) => {
    const { t, lang, getCategoryName } = useI18n();
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [sortBy, setSortBy] = useState<'date' | 'alpha'>(localStorage.getItem('vitreon_sort') as any || 'date');
    const [layoutMode, setLayoutMode] = useState<'grid' | 'list' | 'card'>(localStorage.getItem('vitreon_layout') as any || 'grid');
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dropId, setDropId] = useState<string | null>(null);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    // --- Bulk Selection State ---
    const [selectMode, setSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkPanel, setBulkPanel] = useState<'main' | 'category' | 'tags'>('main');
    const [tagInput, setTagInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3000);
    };

    // --- Filtering ---
    let filtered = [...notes];
    
    filtered.sort((a, b) => {
        if (sortBy === 'alpha') return a.title.localeCompare(b.title);
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        if (orderA !== orderB) return orderB - orderA;
        return b.updatedAt - a.updatedAt;
    });

    if (showFavorites) {
        filtered = filtered.filter(n => n.isPinned && !n.deletedAt);
    } else if (showArchived) {
        filtered = filtered.filter(n => n.isArchived && !n.deletedAt);
    } else if (showTrash) {
        filtered = filtered.filter(n => !!n.deletedAt);
    } else {
        filtered = filtered.filter(n => !n.isArchived && !n.deletedAt);
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

    const pinned = (!showFavorites && !showArchived && !showTrash) ? filtered.filter(n => n.isPinned) : [];
    const mainList = (!showFavorites && !showArchived && !showTrash) ? filtered.filter(n => !n.isPinned) : filtered;

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
            showToast(t('speechNotSupported'));
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

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        if (draggedId === null || draggedId === id) return;
        setDropId(id);
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
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

    // --- Bulk Selection Handlers ---
    const enterSelectMode = () => {
        setSelectMode(true);
        setSelectedIds(new Set());
        setBulkPanel('main');
    };

    const exitSelectMode = () => {
        setSelectMode(false);
        setSelectedIds(new Set());
        setBulkPanel('main');
        setTagInput('');
    };

    const toggleSelectNote = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        setSelectedIds(new Set(mainList.map(n => n.id)));
    };

    const deselectAll = () => setSelectedIds(new Set());

    const execBulkAction = async (
        action: 'pin' | 'unpin' | 'archive' | 'delete' | 'changeCategory' | 'addTags',
        payload?: string | string[]
    ) => {
        if (!selectedIds.size) return;
        setIsProcessing(true);
        await onBulkAction(Array.from(selectedIds), action, payload);
        setIsProcessing(false);
        exitSelectMode();
    };

    const handleNoteClick = (note: Note) => {
        if (selectMode) {
            toggleSelectNote(note.id);
        } else {
            onNoteClick(note);
        }
    };

    const allSelected = mainList.length > 0 && mainList.every(n => selectedIds.has(n.id));

    return (
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-32 pt-2 transition-colors animate-in fade-in duration-500">

            {/* ── Bulk Selection Toolbar ── */}
            {selectMode && (
                <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="mx-4 mt-4 glass-panel rounded-[28px] border border-white/10 shadow-2xl overflow-hidden">
                        {/* Header row */}
                        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={exitSelectMode}
                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                                >
                                    <span className="material-symbols-rounded text-[18px] text-slate-400">close</span>
                                </button>
                                <span className="font-bold text-white text-sm">
                                    {t('selectedCount').replace('{count}', String(selectedIds.size))}
                                </span>
                            </div>
                            <button
                                onClick={allSelected ? deselectAll : selectAll}
                                className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                {allSelected ? t('deselectAll') : t('selectAll')}
                            </button>
                        </div>

                        {/* Actions panel */}
                        {bulkPanel === 'main' && (
                            <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
                                <BulkActionBtn disabled={!selectedIds.size || isProcessing} icon="push_pin" label={t('bulkPin')} color="indigo" onClick={() => execBulkAction('pin')} />
                                <BulkActionBtn disabled={!selectedIds.size || isProcessing} icon="cancel_presentation" label={t('bulkUnpin')} color="slate" onClick={() => execBulkAction('unpin')} />
                                <BulkActionBtn disabled={!selectedIds.size || isProcessing} icon="folder" label={t('bulkChangeCategory')} color="violet" onClick={() => setBulkPanel('category')} />
                                <BulkActionBtn disabled={!selectedIds.size || isProcessing} icon="label" label="Tags" color="teal" onClick={() => setBulkPanel('tags')} />
                                <BulkActionBtn disabled={!selectedIds.size || isProcessing} icon="archive" label={t('bulkArchive')} color="amber" onClick={() => execBulkAction('archive')} />
                                <BulkActionBtn disabled={!selectedIds.size || isProcessing} icon="delete" label={t('bulkDelete')} color="red" onClick={() => execBulkAction('delete')} />
                            </div>
                        )}

                        {/* Category picker */}
                        {bulkPanel === 'category' && (
                            <div className="px-4 py-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <button onClick={() => setBulkPanel('main')} className="material-symbols-rounded text-slate-400 text-[18px]">arrow_back</button>
                                    <span className="text-sm font-bold text-white">{t('bulkChangeCategory')}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto no-scrollbar">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => execBulkAction('changeCategory', cat.id)}
                                            disabled={isProcessing}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all
                                                bg-${cat.color}-500/15 border-${cat.color}-500/30 text-${cat.color}-400
                                                hover:bg-${cat.color}-500/30 active:scale-95`}
                                        >
                                            <span className="material-symbols-rounded text-[14px]">{cat.icon}</span>
                                            {getCategoryName(cat.id, cat.name)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags input */}
                        {bulkPanel === 'tags' && (
                            <div className="px-4 py-3">
                                <div className="flex items-center gap-2 mb-3">
                                    <button onClick={() => setBulkPanel('main')} className="material-symbols-rounded text-slate-400 text-[18px]">arrow_back</button>
                                    <span className="text-sm font-bold text-white">{t('addTagsToSelection').replace('{count}', String(selectedIds.size))}</span>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && tagInput.trim()) {
                                                const tags = tagInput.split(',').map(t => t.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean);
                                                execBulkAction('addTags', tags);
                                            }
                                        }}
                                        placeholder="work, personal, urgent..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/40"
                                    />
                                    <button
                                        disabled={!tagInput.trim() || isProcessing}
                                        onClick={() => {
                                            const tags = tagInput.split(',').map(t => t.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean);
                                            execBulkAction('addTags', tags);
                                        }}
                                        className="px-4 py-2 rounded-2xl bg-indigo-500 text-white text-sm font-bold disabled:opacity-40 hover:bg-indigo-400 transition-all active:scale-95"
                                    >
                                        <span className="material-symbols-rounded text-[18px]">check</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {isProcessing && (
                            <div className="px-5 pb-3 text-center">
                                <div className="inline-flex items-center gap-2 text-xs text-slate-400">
                                    <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    Applying...
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Search bar ── */}
            <div className="px-6 mb-8 stagger-1 flex items-center gap-4">
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
                    {/* Select Mode toggle */}
                    <button
                        onClick={selectMode ? exitSelectMode : enterSelectMode}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95
                            ${selectMode
                                ? 'bg-indigo-500 text-white shadow-indigo-500/30'
                                : 'glass-card bg-white dark:bg-white/5 text-slate-500 hover:text-indigo-500'}`}
                        title={t('selectNotes')}
                    >
                        <span className="material-symbols-rounded" style={{ fontVariationSettings: selectMode ? "'FILL' 1" : "'FILL' 0" }}>
                            checklist
                        </span>
                    </button>
                </div>
            </div>

            {selectedCategory && (
                <div className="px-6 mb-6 stagger-1">
                    <div className={`glass-card rounded-2xl p-4 flex items-center justify-between border-l-4 border-${currentCat?.color || 'slate'}-500`}>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-rounded text-indigo-500">{currentCat?.icon || 'folder'}</span>
                            <span className="font-bold text-slate-700 dark:text-white">{t('collection')}: {getCategoryName(currentCat?.id, currentCat?.name) || t('unknown')}</span>
                        </div>
                        <button onClick={onClearCategory} className="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                            <span className="material-symbols-rounded">close</span>
                        </button>
                    </div>
                </div>
            )}

            {!showFavorites && !showArchived && pinned.length > 0 && (
                <div className="mb-8 stagger-2">
                    <div className="px-6 mb-4">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">{t('pinnedNotes')}</h2>
                    </div>
                    <div className="flex overflow-x-auto gap-5 px-6 pb-4 no-scrollbar snap-x">
                        {pinned.map(note => (
                            <div
                                key={note.id}
                                className={`relative shrink-0 transition-all duration-200 ${selectMode ? 'cursor-pointer' : ''}`}
                                onClick={selectMode ? () => toggleSelectNote(note.id) : undefined}
                            >
                                {selectMode && (
                                    <div className={`absolute top-3 left-3 z-20 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                        ${selectedIds.has(note.id)
                                            ? 'bg-indigo-500 border-indigo-500 shadow-lg shadow-indigo-500/30'
                                            : 'bg-black/30 border-white/40 backdrop-blur-sm'}`}
                                    >
                                        {selectedIds.has(note.id) && <span className="material-symbols-rounded text-white text-[14px]">check</span>}
                                    </div>
                                )}
                                <div className={selectMode && selectedIds.has(note.id) ? 'opacity-80 ring-2 ring-indigo-500 rounded-[32px]' : ''}>
                                    <NoteCard note={note} category={categories.find(c => c.id === note.category)} onClick={() => !selectMode && onNoteClick(note)} onPin={() => onPinNote(note)} onUpdate={onUpdateNote} layout="carousel" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="px-6 mb-4 stagger-3 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                        {showFavorites ? t('favorites') : showArchived ? t('archived') : showTrash ? t('trash') : t('allNotes')}
                    </h2>
                    {showTrash && filtered.length > 0 && (
                        <p className="text-sm text-slate-500 mt-1">{t('trashMessage')}</p>
                    )}
                </div>
                {showTrash && filtered.length > 0 && (
                    <button 
                        onClick={onEmptyTrash}
                        className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-rounded text-sm">delete_sweep</span>
                        {t('emptyTrash')}
                    </button>
                )}
            </div>
            
            <div className={`
                px-6 pb-20 stagger-4 w-full
                ${layoutMode === 'grid' ? 'columns-2 gap-4' : 'flex flex-col gap-3'}
                ${layoutMode === 'card' ? 'max-w-2xl mx-auto w-full' : ''}
            `}>
                {mainList.map((note) => (
                    <div 
                        key={note.id}
                        draggable={!selectMode && !searchQuery && sortBy === 'date' && !showFavorites && !showArchived}
                        data-note-id={note.id}
                        onDragStart={(e) => handleDragStart(e, note.id)}
                        onDragOver={(e) => handleDragOver(e, note.id)}
                        onDrop={(e) => handleDrop(e, note.id)}
                        onDragEnd={() => { setDraggedId(null); setDropId(null); }}
                        className={`relative w-full ${layoutMode === 'grid' ? 'inline-block break-inside-avoid mb-4' : ''}`}
                    >
                        {/* Selection checkbox overlay */}
                        {selectMode && (
                            <button
                                onClick={() => toggleSelectNote(note.id)}
                                className={`absolute top-3 left-3 z-20 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shadow-lg
                                    ${selectedIds.has(note.id)
                                        ? 'bg-indigo-500 border-indigo-500 shadow-indigo-500/40'
                                        : 'bg-black/20 border-white/30 backdrop-blur-sm hover:border-indigo-400'}`}
                            >
                                {selectedIds.has(note.id) && <span className="material-symbols-rounded text-white text-[15px] font-bold">check</span>}
                            </button>
                        )}
                        <div
                            className={`transition-all duration-200 ${selectMode && selectedIds.has(note.id) ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-transparent rounded-[32px] opacity-90' : ''}`}
                            onClick={selectMode ? () => toggleSelectNote(note.id) : undefined}
                        >
                            <NoteCard 
                                note={note} category={categories.find(c => c.id === note.category)} 
                                onClick={() => !selectMode && handleNoteClick(note)} onPin={() => onPinNote(note)} 
                                layout={layoutMode} 
                                onRestore={showTrash ? () => onRestoreNote(note) : undefined}
                                onDelete={showTrash ? () => onDeleteNote(note.id) : undefined}
                                onUpdate={onUpdateNote}
                            />
                        </div>
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

            {toastMsg && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 glass-panel bg-red-500/90 dark:bg-red-600/90 text-white rounded-full font-bold text-sm shadow-xl shadow-red-500/20 z-[100] animate-in slide-in-from-bottom-5 fade-in">
                    {toastMsg}
                </div>
            )}
        </div>
    );
};

// ── Small helper component for bulk action buttons ──
const BulkActionBtn: React.FC<{
    icon: string;
    label: string;
    color: string;
    onClick: () => void;
    disabled?: boolean;
}> = ({ icon, label, color, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl text-center transition-all active:scale-95 shrink-0
            bg-${color}-500/10 hover:bg-${color}-500/20
            text-${color}-400 disabled:opacity-30 disabled:cursor-not-allowed`}
    >
        <span className="material-symbols-rounded text-[20px]">{icon}</span>
        <span className="text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">{label}</span>
    </button>
);