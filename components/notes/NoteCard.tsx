import React from 'react';
import { Note, Category } from '../../types';

interface NoteCardProps {
    note: Note;
    category?: Category;
    onClick: () => void;
    layout?: 'grid' | 'carousel';
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, category, onClick, layout = 'grid' }) => {
    const isCarousel = layout === 'carousel';

    return (
        <div 
            onClick={onClick}
            className={`glass-card rounded-3xl cursor-pointer p-0 overflow-hidden relative group
            ${isCarousel ? 'snap-start min-w-[280px] h-64' : 'flex flex-col h-full'}`}
        >
            {note.isLocked ? (
                <div className="flex flex-col items-center justify-center text-slate-500 h-full py-12">
                    <span className="material-symbols-rounded text-4xl mb-2">lock</span>
                    <span className="text-sm font-bold tracking-widest uppercase opacity-60">Locked</span>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    {/* Media Header (for carousel or cards with images) */}
                    {(isCarousel || note.images.length > 0) && (
                        <div className={`relative ${isCarousel ? 'h-36' : (note.images.length > 0 ? 'h-32' : 'h-0')}`}>
                            {note.images.length > 0 ? (
                                <img src={note.images[0]} alt="Note" className="w-full h-full object-cover" />
                            ) : (
                                <div className={`w-full h-full bg-gradient-to-br from-${category?.color || 'indigo'}-500/20 to-transparent flex items-center justify-center`}>
                                     <span className="material-symbols-rounded text-4xl opacity-20">{category?.icon || 'note'}</span>
                                </div>
                            )}
                            {note.isPinned && (
                                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-indigo-400">
                                    <span className="material-symbols-rounded text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>push_pin</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{note.title || "Untitled"}</h3>
                                {!isCarousel && (
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                                    </span>
                                )}
                            </div>
                            <p className={`text-sm text-slate-400 leading-relaxed font-medium ${isCarousel ? 'line-clamp-2' : 'line-clamp-3'}`}>
                                {note.isChecklist ? '☑ List Items...' : (note.content || "No content...")}
                            </p>
                        </div>

                        {!isCarousel && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2">
                                     <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-${category?.color || 'slate'}-400`}>
                                         <span className="material-symbols-rounded text-lg">{category?.icon || 'description'}</span>
                                     </div>
                                     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{category?.name || 'General'}</span>
                                </div>
                                <div className="flex gap-2">
                                    {note.images.length > 0 && <span className="material-symbols-rounded text-sm text-slate-600">image</span>}
                                    {note.voiceNotes.length > 0 && <span className="material-symbols-rounded text-sm text-slate-600">mic</span>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};