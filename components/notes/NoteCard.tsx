import React from 'react';
import { Note, Category } from '../../types';
import { RichText } from '../ui/RichText';

interface NoteCardProps {
    note: Note;
    category?: Category;
    onClick: () => void;
    onPin?: () => void;
    layout?: 'grid' | 'carousel';
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, category, onClick, onPin, layout = 'grid' }) => {
    const isCarousel = layout === 'carousel';

    return (
        <div 
            onClick={onClick}
            className={`glass-card rounded-3xl cursor-pointer p-0 overflow-hidden relative group transition-all hover:scale-[1.02] active:scale-[0.98]
            ${isCarousel ? 'snap-start min-w-[280px] h-64' : 'flex flex-col h-full'}`}
        >
            {/* Quick Pin Toggle */}
            {onPin && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onPin(); }}
                    className={`absolute top-4 right-4 z-10 w-9 h-9 rounded-full backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all 
                    ${note.isPinned 
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                        : 'bg-black/10 dark:bg-white/10 text-white opacity-0 group-hover:opacity-100'}`}
                >
                    <span className="material-symbols-rounded text-[1.2rem]" style={{ fontVariationSettings: note.isPinned ? "'FILL' 1" : "'FILL' 0" }}>push_pin</span>
                </button>
            )}

            {note.isLocked ? (
                <div className="flex flex-col items-center justify-center text-slate-500 h-full py-12">
                    <span className="material-symbols-rounded text-4xl mb-2">lock</span>
                    <span className="text-sm font-bold tracking-widest uppercase opacity-60">Locked</span>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    {/* Media Header */}
                    {(isCarousel || note.images.length > 0) && (
                        <div className={`relative ${isCarousel ? 'h-36' : (note.images.length > 0 ? 'h-32' : 'h-0')}`}>
                            {note.images.length > 0 ? (
                                <img src={note.images[0]} alt="Note" className="w-full h-full object-cover" />
                            ) : (
                                <div className={`w-full h-full bg-gradient-to-br from-${category?.color || 'indigo'}-500/20 to-transparent flex items-center justify-center`}>
                                     <span className="material-symbols-rounded text-4xl opacity-20">{category?.icon || 'note'}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2 pr-8">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1 group-hover:text-indigo-500 transition-colors tracking-tight">{note.title || "Untitled"}</h3>
                                {!isCarousel && (
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                                        {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                                    </span>
                                )}
                            </div>
                            <div className={`text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium ${isCarousel ? 'line-clamp-2' : 'line-clamp-2'}`}>
                                {note.isChecklist ? (
                                    <p className="opacity-60 flex items-center gap-2"><span className="material-symbols-rounded text-sm">checklist</span> Checklist Items...</p>
                                ) : (
                                    <RichText content={note.content || "No content..."} className="line-clamp-2" />
                                )}
                            </div>
                        </div>

                        {!isCarousel && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2">
                                     <div className={`w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-${category?.color || 'slate'}-500 dark:text-${category?.color || 'slate'}-400`}>
                                         <span className="material-symbols-rounded text-base">{category?.icon || 'description'}</span>
                                     </div>
                                     <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{category?.name || 'General'}</span>
                                </div>
                                <div className="flex gap-2">
                                    {note.images.length > 1 && <span className="material-symbols-rounded text-sm text-slate-400 dark:text-slate-600">image</span>}
                                    {note.voiceNotes.length > 0 && <span className="material-symbols-rounded text-sm text-slate-400 dark:text-slate-600">mic</span>}
                                    {note.drawings.length > 0 && <span className="material-symbols-rounded text-sm text-slate-400 dark:text-slate-600">draw</span>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};