import React, { useState, useRef, useEffect } from 'react';
import { Note, Category } from '../../types';
import { DrawingModal } from '../../components/modals/DrawingModal';
import { VoiceNoteModal } from '../../components/modals/VoiceNoteModal';
import { RichText } from '../../components/ui/RichText';
import { useI18n } from '../../services/i18n';

interface NoteEditorProps {
    initialNote: Note;
    categories: Category[];
    onSave: (note: Note) => void;
    onDelete: (id: string) => void;
    onArchive: (note: Note) => void;
    onPin: (note: Note) => void;
    onLock: (note: Note) => void;
    onBack: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ 
    initialNote, categories, onSave, onDelete, onArchive, onPin, onLock, onBack 
}) => {
    const { t } = useI18n();
    const [note, setNote] = useState<Note>({
        ...initialNote,
        attachments: initialNote.attachments || [],
        images: initialNote.images || [],
        drawings: initialNote.drawings || [],
        voiceNotes: initialNote.voiceNotes || []
    });
    const [tagInput, setTagInput] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    // Default to View Mode for existing notes, Edit Mode for new notes
    const [isViewMode, setIsViewMode] = useState(initialNote.title !== '' || initialNote.content !== '');
    const [isDrawingOpen, setIsDrawingOpen] = useState(false);
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dropIndex, setDropIndex] = useState<number | null>(null);
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    // Initial Migration for legacy notes
    useEffect(() => {
        if ((note.attachments?.length || 0) === 0 && (note.images?.length > 0 || note.drawings?.length > 0 || note.voiceNotes?.length > 0)) {
            const migratedAttachments: any[] = [
                ...note.images.map(img => ({ id: crypto.randomUUID(), type: 'image', data: img })),
                ...note.drawings.map(draw => ({ id: crypto.randomUUID(), type: 'drawing', data: draw })),
                ...note.voiceNotes.map(vn => ({ id: crypto.randomUUID(), type: 'voice', data: vn }))
            ];
            setNote(prev => ({ ...prev, attachments: migratedAttachments }));
        }
    }, []);

    const playVoiceNote = (vn: string, idx: number) => {
        if (playingIndex === idx) {
            audioRef.current?.pause();
            setPlayingIndex(null);
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
        }

        const audio = new Audio(vn);
        audioRef.current = audio;
        setPlayingIndex(idx);
        audio.play();
        audio.onended = () => setPlayingIndex(null);
    };

    const currentCat = categories.find(c => c.id === note.category);

    const triggerSave = () => onSave(note);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const newAttachment = { id: crypto.randomUUID(), type: 'image' as const, data: event.target.result as string };
                setNote({ ...note, attachments: [...note.attachments, newAttachment] });
            }
        };
        reader.readAsDataURL(file);
    };

    const toggleChecklist = () => {
        setNote({ ...note, isChecklist: !note.isChecklist });
    };

    const applyFormatting = (prefix: string, suffix: string = prefix) => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = note.content;
        const before = text.substring(0, start);
        const selected = text.substring(start, end);
        const after = text.substring(end);

        const newContent = before + prefix + selected + suffix + after;
        setNote({ ...note, content: newContent });
        
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
            }
        }, 10);
    };

    const toggleCheckItem = (idx: number) => {
        const lines = note.content.split('\n');
        const line = lines[idx];
        if (line.startsWith('[x] ')) {
            lines[idx] = '[ ] ' + line.substring(4);
        } else if (line.startsWith('[ ] ')) {
            lines[idx] = '[x] ' + line.substring(4);
        } else {
            lines[idx] = '[x] ' + line;
        }
        setNote({ ...note, content: lines.join('\n') });
    };

    // Unified Drag and Drop Logic (Touch & Mouse)
    const handleDragStart = (e: React.DragEvent | React.TouchEvent, index: number) => {
        setDraggedIndex(index);
        if ('dataTransfer' in e) {
            e.dataTransfer.effectAllowed = 'move';
        }
        const target = e.currentTarget as HTMLElement;
        target.classList.add('dragging');
    };

    const handleDragOver = (e: React.DragEvent | React.TouchEvent, index: number) => {
        if ('preventDefault' in e) e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        setDropIndex(index);
    };

    const handleDrop = (e: React.DragEvent | React.TouchEvent, index: number) => {
        if ('preventDefault' in e) e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) {
            setDropIndex(null);
            setDraggedIndex(null);
            return;
        }
        
        const currentList = [...(note.attachments || [])];
        const item = currentList[draggedIndex];
        currentList.splice(draggedIndex, 1);
        currentList.splice(index, 0, item);
        
        setNote({ ...note, attachments: currentList });
        setDraggedIndex(null);
        setDropIndex(null);
    };

    const handleDragEnd = (e: React.DragEvent | React.TouchEvent) => {
        setDraggedIndex(null);
        setDropIndex(null);
        const target = e.currentTarget as HTMLElement;
        target.classList.remove('dragging');
    };

    // Touch support helpers
    const handleTouchMove = (e: React.TouchEvent, index: number) => {
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const dropZone = element?.closest('[data-drop-index]');
        if (dropZone) {
            const di = parseInt(dropZone.getAttribute('data-drop-index') || '-1');
            if (di !== -1) {
                setDropIndex(di);
            }
        }
    };

    const handleTouchEnd = (e: React.TouchEvent, index: number) => {
        if (dropIndex !== null) {
            handleDrop(e, dropIndex);
        } else {
            handleDragEnd(e);
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-[var(--bg-app)] flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-500 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 z-10 shrink-0">
                <button onClick={onBack} className="w-11 h-11 rounded-2xl glass-panel flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors">
                    <span className="material-symbols-rounded">chevron_left</span>
                </button>
                
                {/* View/Edit Toggle */}
                <div 
                    onClick={() => setIsViewMode(!isViewMode)}
                    className="flex items-center gap-3 px-5 py-2.5 glass-panel rounded-full cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95 group animate-smooth-in"
                >
                    <span className={`material-symbols-rounded text-lg transition-colors ${isViewMode ? 'text-indigo-500' : 'text-slate-400'}`}>
                        {isViewMode ? 'visibility' : 'edit'}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                        {isViewMode ? t('viewMode') : t('editMode')}
                    </span>
                    <div className="w-8 h-4 bg-slate-200 dark:bg-white/10 rounded-full relative ml-1 shadow-inner overflow-hidden">
                        <div className={`absolute top-0.5 bottom-0.5 w-3 rounded-full bg-white shadow-md transition-all duration-300 ${isViewMode ? 'left-[1.2rem] bg-indigo-500' : 'left-0.5 bg-slate-400'}`}></div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => { onPin(note); setNote({ ...note, isPinned: !note.isPinned }); }}
                        className={`w-11 h-11 rounded-2xl glass-panel flex items-center justify-center transition-colors ${note.isPinned ? 'text-indigo-500 bg-indigo-500/10' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-500'}`}
                    >
                        <span className="material-symbols-rounded" style={{ fontVariationSettings: note.isPinned ? "'FILL' 1" : "'FILL' 0" }}>push_pin</span>
                    </button>
                    
                    <div className="relative">
                        <button 
                            onClick={() => setShowMenu(!showMenu)}
                            className={`w-11 h-11 rounded-2xl glass-panel flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors ${showMenu ? 'bg-black/10 dark:bg-white/10' : ''}`}
                        >
                            <span className="material-symbols-rounded">more_horiz</span>
                        </button>
                        
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 glass-panel rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200 bg-white dark:bg-[#1e293b]">
                                <button onClick={() => { onLock(note); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors">
                                    <span className="material-symbols-rounded text-lg">{note.isLocked ? 'lock_open' : 'lock'}</span>
                                    <span className="text-sm font-medium">{note.isLocked ? t('unlockNote') : t('lockNote')}</span>
                                </button>
                                <button onClick={() => { onArchive(note); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors">
                                    <span className="material-symbols-rounded text-lg">{note.isArchived ? 'unarchive' : 'archive'}</span>
                                    <span className="text-sm font-medium">{note.isArchived ? t('unarchive') : t('archive')}</span>
                                </button>
                                <div className="my-1 border-t border-black/5 dark:border-white/5"></div>
                                <button onClick={() => { onDelete(note.id); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-500/10 text-red-500 transition-colors">
                                    <span className="material-symbols-rounded text-lg">delete</span>
                                    <span className="text-sm font-medium">{t('deleteNote')}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Toolbar - Only visible in Edit Mode */}
            {!isViewMode && (
                <div className="mx-6 mb-6 p-2 rounded-[24px] glass-panel flex items-center justify-between gap-4 overflow-x-auto no-scrollbar shadow-sm bg-white/40 dark:bg-white/5 shrink-0 animate-smooth-in">
                    <div className="flex items-center gap-1 shrink-0">
                        <div className="flex items-center gap-1 border-r border-black/5 dark:border-white/10 pr-2">
                            <button onClick={() => applyFormatting('**')} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors" title={t('bold')}><span className="material-symbols-rounded">format_bold</span></button>
                            <button onClick={() => applyFormatting('*')} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors" title={t('italic')}><span className="material-symbols-rounded">format_italic</span></button>
                            <button onClick={() => applyFormatting('++', '++')} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors" title={t('underline')}><span className="material-symbols-rounded">format_underlined</span></button>
                            <button onClick={() => applyFormatting('~~', '~~')} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors" title="Strike"><span className="material-symbols-rounded">format_strikethrough</span></button>
                            <button onClick={() => applyFormatting('# ', '')} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors" title="H1"><span className="material-symbols-rounded">format_h1</span></button>
                            <button onClick={() => applyFormatting('## ', '')} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors" title="H2"><span className="material-symbols-rounded">format_h2</span></button>
                            <button onClick={() => applyFormatting('### ', '')} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors" title="H3"><span className="material-symbols-rounded">format_h3</span></button>
                            <button onClick={() => applyFormatting('> ', '')} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors" title="Quote"><span className="material-symbols-rounded">format_quote</span></button>
                            <button onClick={() => applyFormatting('- ', '')} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors" title="List"><span className="material-symbols-rounded">format_list_bulleted</span></button>
                            <button onClick={() => applyFormatting('`')} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors" title="Code"><span className="material-symbols-rounded">code</span></button>
                            <button onClick={() => applyFormatting('\n---\n')} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors" title="Line"><span className="material-symbols-rounded">horizontal_rule</span></button>
                            <button onClick={toggleChecklist} className={`p-2.5 rounded-xl transition-all ${note.isChecklist ? 'bg-indigo-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500'}`} title={t('checklist')}><span className="material-symbols-rounded">fact_check</span></button>
                        </div>
                        
                        <div className="flex items-center gap-1 pl-1">
                            <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors" title={t('uploadImage')}><span className="material-symbols-rounded">image</span></button>
                            <button onClick={() => cameraInputRef.current?.click()} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors" title={t('capturePhoto')}><span className="material-symbols-rounded">photo_camera</span></button>
                            <button onClick={() => setIsVoiceOpen(true)} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors" title={t('voiceNote')}><span className="material-symbols-rounded">mic</span></button>
                            <button onClick={() => setIsDrawingOpen(true)} className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors" title={t('sketch')}><span className="material-symbols-rounded">draw</span></button>
                        </div>
                    </div>

                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleImageUpload} />
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 pb-32 no-scrollbar  stagger-1">
                {/* Category Selector */}
                <div className="mb-4 relative">
                    <button 
                        disabled={isViewMode}
                        onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-[10px] font-bold uppercase tracking-widest border ${isViewMode ? 'bg-slate-500/10 text-slate-500 border-slate-500/20' : (showCategoryMenu ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/20')}`}
                    >
                        <span className="material-symbols-rounded text-sm">{currentCat?.icon || 'folder'}</span>
                        {t(currentCat?.id as any) || currentCat?.name || t('general')}
                        {!isViewMode && <span className="material-symbols-rounded text-sm transition-transform duration-300" style={{ transform: showCategoryMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>}
                    </button>
                    
                    {!isViewMode && showCategoryMenu && (
                        <div className="absolute top-full left-0 mt-2 w-56 glass-panel rounded-3xl shadow-2xl py-3 z-[60] animate-in fade-in zoom-in-95 bg-white dark:bg-[#1e293b] border-white/10">
                            {categories.map(c => (
                                <button 
                                    key={c.id}
                                    onClick={() => { setNote({ ...note, category: c.id }); setShowCategoryMenu(false); }}
                                    className={`w-full flex items-center justify-between px-5 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group ${note.category === c.id ? 'bg-indigo-500/10' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-${c.color}-500/10 text-${c.color}-500`}>
                                            <span className="material-symbols-rounded text-lg">{c.icon}</span>
                                        </div>
                                        <span className={`text-[11px] font-bold uppercase tracking-widest ${note.category === c.id ? 'text-indigo-500' : 'text-slate-600 dark:text-slate-300'}`}>{t(c.id as any) || c.name}</span>
                                    </div>
                                    {note.category === c.id && <span className="material-symbols-rounded text-indigo-500 text-sm">check_circle</span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {isViewMode ? (
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight leading-tight">{note.title || t('untitled')}</h1>
                ) : (
                    <input
                        className="w-full bg-transparent text-4xl font-bold placeholder-slate-300 dark:placeholder-slate-700 border-none focus:ring-0 outline-none p-0 mb-6 text-slate-800 dark:text-white tracking-tight  stagger-1"
                        placeholder={t('title')}
                        value={note.title}
                        onChange={e => setNote({ ...note, title: e.target.value })}
                    />
                )}
                
                <div className="flex flex-col gap-6">
                    {/* Checklist */}
                    {note.isChecklist ? (
                        <div className="space-y-4  stagger-2">
                            {(note.content || "[ ] ").split('\n').map((line, idx) => {
                                const isChecked = line.startsWith('[x] ');
                                const text = line.replace(/^\[[ x]\] /, '');
                                return (
                                    <div key={idx} className="flex items-center gap-4 group">
                                        <button 
                                            disabled={isViewMode}
                                            onClick={() => toggleCheckItem(idx)}
                                            className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center shrink-0 ${isChecked ? 'bg-indigo-500 border-indigo-500' : 'border-indigo-500/30'} ${isViewMode ? 'cursor-default' : 'cursor-pointer'}`}
                                        >
                                            {isChecked && <span className="material-symbols-rounded text-white text-lg font-bold">check</span>}
                                        </button>
                                        {isViewMode ? (
                                            <span className={`text-lg transition-all ${isChecked ? 'line-through text-slate-400 opacity-60' : 'text-slate-700 dark:text-slate-300'}`}>{text}</span>
                                        ) : (
                                            <input 
                                                className={`w-full bg-transparent border-none focus:ring-0 outline-none p-0 text-lg text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 ${isChecked ? 'line-through opacity-50' : ''}`}
                                                value={text}
                                                placeholder={t('taskItem')}
                                                onChange={(e) => {
                                                    const lines = note.content.split('\n');
                                                    lines[idx] = (isChecked ? '[x] ' : '[ ] ') + e.target.value;
                                                    setNote({ ...note, content: lines.join('\n') });
                                                }}
                                            />
                                        )}
                                        {!isViewMode && (
                                            <button 
                                                onClick={() => {
                                                    const lines = note.content.split('\n');
                                                    lines.splice(idx, 1);
                                                    setNote({ ...note, content: lines.join('\n') });
                                                }}
                                                className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-slate-500 hover:text-red-400 transition-all shrink-0"
                                            >
                                                <span className="material-symbols-rounded text-lg">close</span>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                            {!isViewMode && (
                                <button 
                                    onClick={() => setNote({ ...note, content: note.content + (note.content ? '\n[ ] ' : '[ ] ') })}
                                    className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 text-sm font-bold uppercase tracking-widest mt-4 hover:translate-x-1 transition-transform"
                                >
                                    <span className="material-symbols-rounded">add</span> {t('addTask')}
                                </button>
                            )}
                        </div>
                    ) : (
                        isViewMode ? (
                            <RichText content={note.content} className="text-xl leading-relaxed text-slate-700 dark:text-slate-300 min-h-[10vh]  stagger-2" />
                        ) : (
                            <textarea
                                ref={textareaRef}
                                className="w-full min-h-[30vh] bg-transparent resize-none border-none focus:ring-0 outline-none p-0 text-xl leading-relaxed text-slate-700 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-700 font-medium  stagger-2"
                                placeholder={t('content')}
                                value={note.content}
                                onChange={e => setNote({ ...note, content: e.target.value })}
                            />
                        )
                    )}

                    {/* Attachments Area */}
                    <div className="mt-8 space-y-6">
                        {(note.attachments?.length || 0) > 0 && (
                            <div className="grid grid-cols-1 gap-4 stagger-3">
                                {note.attachments.map((att, idx) => (
                                    <div 
                                        key={att.id}
                                        draggable={!isViewMode}
                                        data-drop-index={idx}
                                        onDragStart={(e) => handleDragStart(e, idx)}
                                        onDragOver={(e) => handleDragOver(e, idx)}
                                        onDrop={(e) => handleDrop(e, idx)}
                                        onDragEnd={handleDragEnd}
                                        onTouchStart={(e) => handleDragStart(e, idx)}
                                        onTouchMove={(e) => handleTouchMove(e, idx)}
                                        onTouchEnd={(e) => handleTouchEnd(e, idx)}
                                        className={`relative group rounded-[32px] overflow-hidden glass-panel border-white/5 transition-all duration-300 shadow-xl
                                                   ${draggedIndex === idx ? 'opacity-40 scale-95 ring-2 ring-indigo-500' : 'opacity-100'} 
                                                    ${dropIndex === idx ? 'scale-105 ring-2 ring-indigo-500/50' : ''} 
                                                   ${!isViewMode ? 'cursor-grab active:cursor-grabbing touch-none' : 'cursor-default'}`}
                                    >
                                        {att.type === 'voice' ? (
                                            <div className="flex items-center gap-4 p-5 bg-indigo-500/5 dark:bg-indigo-500/10">
                                                <button 
                                                    onClick={() => playVoiceNote(att.data, idx)}
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg transition-all active:scale-90 ${playingIndex === idx ? 'bg-red-500 shadow-red-500/30' : 'bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white shadow-indigo-500/30'}`}
                                                >
                                                    <span className="material-symbols-rounded text-2xl font-bold">
                                                        {playingIndex === idx ? 'stop' : 'play_arrow'}
                                                    </span>
                                                </button>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">{t('voiceNote')}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold">{t('audioClip')}</span>
                                                    </div>
                                                    <div className="h-2 bg-indigo-500/10 dark:bg-white/10 rounded-full overflow-hidden">
                                                        <div className="w-full h-full bg-indigo-500 rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={att.type === 'drawing' ? 'bg-white p-4' : ''}>
                                                <img src={att.data} alt="Attachment" className={`w-full h-auto ${att.type === 'image' ? 'object-cover' : 'object-contain'} pointer-events-none`} />
                                            </div>
                                        )}
                                        
                                        {!isViewMode && (
                                            <>
                                                <button onClick={() => setNote({ ...note, attachments: note.attachments.filter((_, i) => i !== idx) })} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-md hover:bg-red-500 z-10">
                                                    <span className="material-symbols-rounded text-lg">delete</span>
                                                </button>
                                                <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-500/80 backdrop-blur-md text-white flex items-center justify-center">
                                                        <span className="material-symbols-rounded text-lg">drag_indicator</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    {(note.tags.length > 0 || !isViewMode) && (
                        <div className="flex flex-wrap gap-3 mt-10 stagger-4">
                            {note.tags.map(tag => (
                                <div key={tag} className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel bg-white dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest group shadow-sm transition-all hover:border-indigo-500/30">
                                    <span className="material-symbols-rounded text-[14px] opacity-60 text-indigo-500">sell</span>
                                    {tag}
                                    {!isViewMode && (
                                        <button onClick={() => setNote({ ...note, tags: note.tags.filter(t => t !== tag) })} className="hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                            <span className="material-symbols-rounded text-sm ml-1">close</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                            {!isViewMode && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel bg-white/50 dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-400 dark:text-slate-600 focus-within:text-indigo-500 focus-within:border-indigo-500/50 transition-all">
                                    <span className="material-symbols-rounded text-sm">add</span>
                                    <input 
                                        placeholder={t('tag')}
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && tagInput.trim()) {
                                                setNote({ ...note, tags: [...note.tags, tagInput.trim()] });
                                                setTagInput('');
                                            }
                                        }}
                                        className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none border-none focus:ring-0 w-20 text-slate-600 dark:text-white"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Action Buttons */}
            {!isViewMode && (
                <div className="absolute bottom-10 right-8 flex flex-col gap-4 animate-in slide-in-from-right-8 duration-500">
                    <button 
                        onClick={onBack}
                        className="w-14 h-14 rounded-[22px] glass-panel flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-all shadow-xl bg-white dark:bg-transparent hover:scale-110 active:scale-90"
                    >
                        <span className="material-symbols-rounded text-3xl">close</span>
                    </button>
                    <button 
                        onClick={triggerSave}
                        className="w-15 h-15 rounded-[24px] bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/40 hover:scale-110 active:scale-90 transition-all border-4 border-white dark:border-white/10"
                    >
                        <span className="material-symbols-rounded text-4xl font-bold">check</span>
                    </button>
                </div>
            )}

            <DrawingModal 
                isOpen={isDrawingOpen} 
                onClose={() => setIsDrawingOpen(false)} 
                onSave={(data) => {
                    const newAtt = { id: crypto.randomUUID(), type: 'drawing' as const, data };
                    setNote({ ...note, attachments: [...note.attachments, newAtt] });
                }} 
            />
            <VoiceNoteModal 
                isOpen={isVoiceOpen} 
                onClose={() => setIsVoiceOpen(false)} 
                onSave={(data) => {
                    const newAtt = { id: crypto.randomUUID(), type: 'voice' as const, data };
                    setNote({ ...note, attachments: [...note.attachments, newAtt] });
                }} 
            />
        </div>
    );
};