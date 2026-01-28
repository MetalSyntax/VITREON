import React from 'react';
import { Note, Category } from '../../types';
import { RichText } from '../ui/RichText';
import { useI18n } from '../../services/i18n';

interface NoteCardProps {
    note: Note;
    category?: Category;
    onClick: () => void;
    onPin?: () => void;
    layout?: 'grid' | 'carousel' | 'list' | 'card';
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, category, onClick, onPin, layout = 'grid' }) => {
    const { t } = useI18n();
    const isCarousel = layout === 'carousel';
    const isList = layout === 'list';
    const isCard = layout === 'card';

    return (
        <div 
            onClick={onClick}
            className={`glass-card rounded-[32px] cursor-pointer p-0 overflow-hidden relative group transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0
            ${isCarousel ? 'snap-start w-[280px] h-64' : ''}
            ${isList ? 'flex flex-row items-center h-24 mb-2 w-full' : ''}
            ${isCard ? 'flex flex-col h-auto mb-4 w-full' : ''}
            ${layout === 'grid' ? 'flex flex-col h-full' : ''}`}
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
                <div className={`flex items-center justify-center text-slate-500 ${isList ? 'w-full' : 'h-full py-12 flex-col'}`}>
                    <span className={`material-symbols-rounded ${isList ? 'text-2xl mr-4' : 'text-4xl mb-2'}`}>lock</span>
                    <span className="text-sm font-bold tracking-widest uppercase opacity-60">{t('locked')}</span>
                </div>
            ) : (
                <div className={`flex ${isList ? 'flex-row w-full' : 'flex-col h-full'}`}>
                    {/* Media Header */}
                    {(isCarousel || isCard || ((note.attachments?.length > 0 || note.images.length > 0 || note.drawings.length > 0) && !isList)) && (
                        <div className={`relative shrink-0 ${(note.attachments?.length > 0 || note.images.length > 0 || note.drawings.length > 0) ? 'bg-white' : ''} ${isCarousel ? 'h-36' : (isCard ? 'h-48' : ((note.attachments?.length > 0 || note.images.length > 0 || note.drawings.length > 0) ? 'h-32' : 'h-0'))}`}>
                            {note.attachments?.length > 0 ? (
                                note.attachments[0].type === 'voice' ? (
                                    <div className="w-full h-full bg-indigo-500/10 flex items-center justify-center">
                                        <span className="material-symbols-rounded text-4xl text-indigo-500">mic</span>
                                    </div>
                                ) : (
                                    <img src={note.attachments[0].data} alt="Attachment" className={`w-full h-full ${note.attachments[0].type === 'image' ? 'object-cover' : 'object-contain p-2'}`} />
                                )
                            ) : note.images.length > 0 ? (
                                <img src={note.images[0]} alt="Note" className="w-full h-full object-cover" />
                            ) : note.drawings.length > 0 ? (
                                <img src={note.drawings[0]} alt="Drawing" className="w-full h-full object-contain p-2" />
                            ) : (
                                <div className={`w-full h-full bg-gradient-to-br from-${category?.color || 'indigo'}-500/20 to-transparent flex items-center justify-center`}>
                                     <span className="material-symbols-rounded text-4xl opacity-20">{category?.icon || 'note'}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {isList && (note.attachments?.length > 0 || note.images.length > 0 || note.drawings.length > 0) && (
                        <div className={`w-24 h-full shrink-0 ${(note.attachments?.some(a => a.type === 'drawing') || (note.drawings.length > 0 && note.images.length === 0)) ? 'bg-white' : ''}`}>
                             {note.attachments?.length > 0 ? (
                                 note.attachments[0].type === 'voice' ? (
                                     <div className="w-full h-full bg-indigo-500/10 flex items-center justify-center">
                                         <span className="material-symbols-rounded text-2xl text-indigo-500">mic</span>
                                     </div>
                                 ) : (
                                     <img src={note.attachments[0].data} alt="Note" className={`w-full h-full ${note.attachments[0].type === 'image' ? 'object-cover' : 'object-contain p-2'}`} />
                                 )
                             ) : (
                                 <img src={note.images[0] || note.drawings[0]} alt="Note" className={`w-full h-full ${note.images.length > 0 ? 'object-cover' : 'object-contain p-2'}`} />
                             )}
                        </div>
                    )}

                    <div className={`p-5 flex-1 flex flex-col justify-between overflow-hidden`}>
                        <div>
                            <div className="flex justify-between items-start mb-1 pr-8">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1 group-hover:text-indigo-500 transition-colors tracking-tight">{note.title || t('untitled')}</h3>
                                {!isCarousel && (
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest shrink-0 ml-2">
                                        {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                                    </span>
                                )}
                            </div>
                            <div className={`text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-small ${isList ? 'line-clamp-1' : 'line-clamp-6'}`}>
                                {note.isChecklist ? (
                                    <p className="opacity-60 flex items-center gap-2"><span className="material-symbols-rounded text-sm">checklist</span> {t('tasksCount')}</p>
                                ) : (
                                    <RichText content={note.content || t('noContent')} className={isList ? "line-clamp-1" : "line-clamp-6"} />
                                )}
                            </div>
                        </div>

                        {(!isCarousel) && (
                            <div className={`flex items-center justify-between mt-2 ${isList ? 'hidden' : ''}`}>
                                <div className="flex items-center gap-2">
                                     <div className={`w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-${category?.color || 'slate'}-500 dark:text-${category?.color || 'slate'}-400`}>
                                         <span className="material-symbols-rounded text-base">{category?.icon || 'description'}</span>
                                     </div>
                                     <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{t(category?.id as any) || category?.name || t('general')}</span>
                                </div>
                                <div className="flex gap-2">
                                    {(note.attachments?.some(a => a.type === 'image') || note.images.length > 0) && <span className="material-symbols-rounded text-sm text-slate-400 dark:text-slate-600">image</span>}
                                    {(note.attachments?.some(a => a.type === 'voice') || note.voiceNotes.length > 0) && <span className="material-symbols-rounded text-sm text-slate-400 dark:text-slate-600">mic</span>}
                                    {(note.attachments?.some(a => a.type === 'drawing') || note.drawings.length > 0) && <span className="material-symbols-rounded text-sm text-slate-400 dark:text-slate-600">draw</span>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
