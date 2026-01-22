import React, { useState, useRef } from 'react';
import { Note, Category } from '../../types';
import { DrawingModal } from '../../components/modals/DrawingModal';
import { VoiceNoteModal } from '../../components/modals/VoiceNoteModal';

interface NoteEditorProps {
    initialNote: Note;
    categories: Category[];
    onSave: (note: Note) => void;
    onDelete: (id: string) => void;
    onArchive: (note: Note) => void;
    onLock: (note: Note) => void;
    onBack: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ 
    initialNote, categories, onSave, onDelete, onArchive, onLock, onBack 
}) => {
    const [note, setNote] = useState<Note>(initialNote);
    const [tagInput, setTagInput] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [isDrawingOpen, setIsDrawingOpen] = useState(false);
    const [isVoiceOpen, setIsVoiceOpen] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const triggerSave = () => onSave(note);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setNote({ ...note, images: [...note.images, event.target.result as string] });
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
        
        // Return focus
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
            }
        }, 10);
    };

    return (
        <div className="absolute inset-0 z-50 bg-[#030712] flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-500 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 z-10">
                <button onClick={onBack} className="w-11 h-11 rounded-2xl glass-panel flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                    <span className="material-symbols-rounded">chevron_left</span>
                </button>
                
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Edit Note</h2>

                <div className="relative">
                    <button 
                        onClick={() => setShowMenu(!showMenu)}
                        className={`w-11 h-11 rounded-2xl glass-panel flex items-center justify-center text-slate-300 hover:text-white transition-colors ${showMenu ? 'bg-white/10' : ''}`}
                    >
                        <span className="material-symbols-rounded">more_horiz</span>
                    </button>
                    
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 glass-panel rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <button onClick={() => { onLock(note); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-slate-300">
                                <span className="material-symbols-rounded text-lg">{note.isLocked ? 'lock_open' : 'lock'}</span>
                                <span className="text-sm font-medium">{note.isLocked ? 'Unlock Note' : 'Lock Note'}</span>
                            </button>
                            <button onClick={() => { onArchive(note); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 text-slate-300">
                                <span className="material-symbols-rounded text-lg">{note.isArchived ? 'unarchive' : 'archive'}</span>
                                <span className="text-sm font-medium">{note.isArchived ? 'Unarchive' : 'Archive'}</span>
                            </button>
                            <div className="my-1 border-t border-white/5"></div>
                            <button onClick={() => { onDelete(note.id); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-500/10 text-red-400">
                                <span className="material-symbols-rounded text-lg">delete</span>
                                <span className="text-sm font-medium">Delete</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Toolbar */}
            <div className="mx-6 mb-6 p-2 rounded-[24px] glass-panel flex items-center justify-start gap-4 overflow-x-auto no-scrollbar bg-white/5 border-white/5">
                <div className="flex items-center gap-1 shrink-0 border-r border-white/10 pr-4">
                    <button onClick={() => applyFormatting('**')} className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white" title="Bold"><span className="material-symbols-rounded">format_bold</span></button>
                    <button onClick={() => applyFormatting('*')} className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white" title="Italic"><span className="material-symbols-rounded">format_italic</span></button>
                    <button onClick={() => applyFormatting('<u>', '</u>')} className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white" title="Underline"><span className="material-symbols-rounded">format_underlined</span></button>
                    <button onClick={toggleChecklist} className={`p-2.5 rounded-xl transition-all ${note.isChecklist ? 'bg-indigo-500 text-white' : 'hover:bg-white/10 text-slate-400 hover:text-white'}`} title="Checklist"><span className="material-symbols-rounded">format_list_bulleted</span></button>
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white" title="Upload Image"><span className="material-symbols-rounded">image</span></button>
                    <button onClick={() => cameraInputRef.current?.click()} className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white" title="Capture Photo"><span className="material-symbols-rounded">photo_camera</span></button>
                    <button onClick={() => setIsVoiceOpen(true)} className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white" title="Voice Note"><span className="material-symbols-rounded">mic</span></button>
                    <button onClick={() => setIsDrawingOpen(true)} className="p-2.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white" title="Sketch"><span className="material-symbols-rounded">draw</span></button>
                </div>

                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleImageUpload} />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 pb-32 no-scrollbar">
                <div className="mb-4">
                    <select 
                        className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-indigo-400 outline-none border-none p-0 cursor-pointer"
                        value={note.category}
                        onChange={e => setNote({ ...note, category: e.target.value })}
                    >
                        {categories.map(c => <option key={c.id} value={c.id} className="bg-[#030712]">{c.name}</option>)}
                    </select>
                </div>

                <input
                    className="w-full bg-transparent text-4xl font-bold placeholder-slate-700 border-none focus:ring-0 outline-none p-0 mb-6 text-white tracking-tight"
                    placeholder="Note Title"
                    value={note.title}
                    onChange={e => setNote({ ...note, title: e.target.value })}
                />
                
                <div className="flex flex-col gap-6">
                    {note.isChecklist ? (
                        <div className="space-y-4">
                            {note.content.split('\n').map((line, idx) => (
                                <div key={idx} className="flex items-center gap-4 group">
                                    <div className="w-6 h-6 rounded-lg border-2 border-indigo-500/30 flex items-center justify-center group-hover:border-indigo-500 transition-colors cursor-pointer">
                                        <input type="checkbox" className="opacity-0 absolute w-6 h-6 cursor-pointer" />
                                        <div className="w-2.5 h-2.5 rounded-sm bg-indigo-500 opacity-0 transition-opacity"></div>
                                    </div>
                                    <input 
                                        className="w-full bg-transparent border-none focus:ring-0 outline-none p-0 text-lg text-slate-300 placeholder-slate-600"
                                        value={line}
                                        placeholder="Task item..."
                                        onChange={(e) => {
                                            const lines = note.content.split('\n');
                                            lines[idx] = e.target.value;
                                            setNote({ ...note, content: lines.join('\n') });
                                        }}
                                    />
                                    <button 
                                        onClick={() => {
                                            const lines = note.content.split('\n');
                                            lines.splice(idx, 1);
                                            setNote({ ...note, content: lines.join('\n') });
                                        }}
                                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                                    >
                                        <span className="material-symbols-rounded text-lg">close</span>
                                    </button>
                                </div>
                            ))}
                            <button 
                                onClick={() => setNote({ ...note, content: note.content + (note.content ? '\n' : '') })}
                                className="flex items-center gap-2 text-indigo-400 text-sm font-bold uppercase tracking-widest mt-4 hover:translate-x-1 transition-transform"
                            >
                                <span className="material-symbols-rounded">add</span> Add Task
                            </button>
                        </div>
                    ) : (
                        <textarea
                            ref={textareaRef}
                            className="w-full min-h-[40vh] bg-transparent resize-none border-none focus:ring-0 outline-none p-0 text-xl leading-relaxed text-slate-300 placeholder-slate-700 font-medium"
                            placeholder="Start writing..."
                            value={note.content}
                            onChange={e => setNote({ ...note, content: e.target.value })}
                        />
                    )}

                    {/* Attachments Area */}
                    <div className="mt-4 space-y-4">
                        {note.images.length > 0 && (
                            <div className="grid grid-cols-1 gap-4">
                                {note.images.map((img, idx) => (
                                    <div key={`img-${idx}`} className="relative group rounded-3xl overflow-hidden glass-panel border-white/5">
                                        <img src={img} alt="Attachment" className="w-full h-auto" />
                                        <button onClick={() => setNote({ ...note, images: note.images.filter((_, i) => i !== idx) })} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-md">
                                            <span className="material-symbols-rounded">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {note.voiceNotes.length > 0 && (
                            <div className="space-y-2">
                                {note.voiceNotes.map((vn, idx) => (
                                    <div key={`vn-${idx}`} className="flex items-center gap-4 p-4 rounded-2xl glass-panel bg-indigo-500/10 border-indigo-500/20">
                                        <span className="material-symbols-rounded text-indigo-400">mic</span>
                                        <div className="flex-1 h-1.2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="w-1/3 h-full bg-indigo-500"></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-indigo-300">VOICE {idx + 1}</span>
                                        <button onClick={() => setNote({ ...note, voiceNotes: note.voiceNotes.filter((_, i) => i !== idx) })} className="text-slate-500 hover:text-red-400 pr-2"><span className="material-symbols-rounded text-lg">close</span></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {note.drawings.length > 0 && (
                            <div className="grid grid-cols-2 gap-4">
                                {note.drawings.map((draw, idx) => (
                                    <div key={`draw-${idx}`} className="relative group rounded-2xl overflow-hidden glass-panel bg-white/5 border-white/5">
                                        <img src={draw} alt="Sketch" className="w-full h-auto" />
                                        <button onClick={() => setNote({ ...note, drawings: note.drawings.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="material-symbols-rounded text-sm">delete</span></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-3 mt-8">
                        {note.tags.map(tag => (
                            <div key={tag} className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel bg-white/5 border-white/5 text-slate-400 text-xs font-bold uppercase tracking-widest group">
                                <span className="material-symbols-rounded text-sm opacity-60">sell</span>
                                {tag}
                                <button onClick={() => setNote({ ...note, tags: note.tags.filter(t => t !== tag) })} className="hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                    <span className="material-symbols-rounded text-sm ml-1">close</span>
                                </button>
                            </div>
                        ))}
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel bg-white/5 border-white/10 text-slate-600 focus-within:text-white transition-all">
                            <span className="material-symbols-rounded text-sm">add</span>
                            <input 
                                placeholder="TAG"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && tagInput.trim()) {
                                        setNote({ ...note, tags: [...note.tags, tagInput.trim()] });
                                        setTagInput('');
                                    }
                                }}
                                className="bg-transparent text-xs font-bold uppercase tracking-widest outline-none border-none focus:ring-0 w-16"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Buttons */}
            <div className="absolute bottom-10 right-8 flex flex-col gap-4">
                <button 
                    onClick={onBack}
                    className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                    <span className="material-symbols-rounded text-3xl">close</span>
                </button>
                <button 
                    onClick={triggerSave}
                    className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 hover:scale-110 active:scale-95 transition-all"
                >
                    <span className="material-symbols-rounded text-3xl">check</span>
                </button>
            </div>

            <DrawingModal 
                isOpen={isDrawingOpen} 
                onClose={() => setIsDrawingOpen(false)} 
                onSave={(data) => setNote({ ...note, drawings: [...note.drawings, data] })} 
            />
            <VoiceNoteModal 
                isOpen={isVoiceOpen} 
                onClose={() => setIsVoiceOpen(false)} 
                onSave={(data) => setNote({ ...note, voiceNotes: [...note.voiceNotes, data] })} 
            />
        </div>
    );
};