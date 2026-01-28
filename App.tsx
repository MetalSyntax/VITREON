import React, { useState, useEffect } from 'react';
import { Note, Category, ThemeMode } from './types';
import { saveNote, getNotes, deleteNote, exportDataToJSON, importDataFromJSON } from './services/storage';
import { PinModal } from './components/modals/PinModal';
import { ConfirmModal } from './components/modals/ConfirmModal';
import { HomeView } from './features/home/HomeView';
import { NoteEditor } from './features/editor/NoteEditor';
import { CategoriesView } from './features/categories/CategoriesView';
import { SettingsView } from './features/settings/SettingsView';
import { ProfileView } from './features/profile/ProfileView';
import { useI18n } from './services/i18n';
import { BiometricsService } from './services/biometrics';
import { OnboardingModal } from './components/modals/OnboardingModal';

// --- Constants ---
const CATEGORIES = (t: any): Category[] => [
    { id: 'work', name: t('work'), color: 'blue', icon: 'work' },
    { id: 'personal', name: t('personal'), color: 'emerald', icon: 'person' },
    { id: 'ideas', name: t('ideas'), color: 'amber', icon: 'lightbulb' },
    { id: 'travel', name: t('travel'), color: 'purple', icon: 'flight' },
    { id: 'fitness', name: t('fitness'), color: 'rose', icon: 'fitness_center' },
    { id: 'uncategorized', name: t('general'), color: 'slate', icon: 'description' },
];

const DEFAULT_CATEGORY = 'uncategorized';

export default function App() {
    const { t } = useI18n();
    const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem('vitreon_theme') as ThemeMode) || 'dark');
    const [view, setView] = useState<'home' | 'editor' | 'categories' | 'settings' | 'profile'>('home');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [categories, setCategories] = useState<Category[]>(() => {
        const saved = localStorage.getItem('vitreon_categories');
        return saved ? JSON.parse(saved) : CATEGORIES(t);
    });
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [showFavorites, setShowFavorites] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ open: boolean, noteId?: string }>({ open: false });
    const [pinModal, setPinModal] = useState<{ open: boolean, mode: 'unlock'|'set'|'set-master', noteId?: string }>({ open: false, mode: 'unlock' });
    const [masterPin, setMasterPin] = useState<string | null>(localStorage.getItem('vitreon_master_pin'));
    const [isBiometricsEnabled, setIsBiometricsEnabled] = useState<boolean>(localStorage.getItem('vitreon_biometrics') === 'true');
    const [profileImage, setProfileImage] = useState<string | null>(localStorage.getItem('vitreon_profile_image'));
    const [userName, setUserName] = useState(localStorage.getItem('vitreon_user_name') || 'Vitreon User');
    const [userEmail, setUserEmail] = useState(localStorage.getItem('vitreon_user_email') || 'vitreon.notes@example.com');
    const [userBio, setUserBio] = useState(localStorage.getItem('vitreon_user_bio') || 'Digital minimalist and note-taking enthusiast.');
    const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(!localStorage.getItem('vitreon_onboarded'));

    // Initial Load
    useEffect(() => {
        const load = async () => {
            const stored = await getNotes();
            setNotes(stored);
            setIsLoading(false);
            
            const savedTheme = localStorage.getItem('vitreon_theme') as ThemeMode;
            if (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                setTheme('light');
            }
        };
        load();
    }, []);

    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark', 'black');
        document.documentElement.classList.add(theme);
        if (theme === 'black') {
            document.documentElement.classList.add('dark');
        }
        localStorage.setItem('vitreon_theme', theme);
    }, [theme]);

    // Handle Hardware Back Button / Back Gesture
    useEffect(() => {
        const handlePopState = () => {
            if (view !== 'home') {
                setView('home');
                setCurrentNote(null);
            }
        };

        window.addEventListener('popstate', handlePopState);

        // If we are moving away from home, push a history state
        if (view !== 'home') {
            window.history.pushState({ view }, '');
        }

        return () => window.removeEventListener('popstate', handlePopState);
    }, [view]);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3000);
    };

    const handleCreateNote = () => {
        const newNote: Note = {
            id: crypto.randomUUID(), title: '', content: '', category: DEFAULT_CATEGORY,
            isPinned: false, isArchived: false, isLocked: false, isChecklist: false,
            tags: [], images: [], drawings: [], voiceNotes: [], attachments: [],
            createdAt: Date.now(), updatedAt: Date.now()
        };
        setCurrentNote(newNote);
        setView('editor');
    };

    const handleSaveNote = async (updatedNote: Note) => {
        let titleToSave = updatedNote.title;
        if (!titleToSave) {
            titleToSave = updatedNote.isChecklist ? 'Checklist' : (updatedNote.content.split('\n')[0].substring(0, 30) || 'Untitled Note');
        }
        const toSave = { ...updatedNote, title: titleToSave, updatedAt: Date.now() };
        await saveNote(toSave);
        setNotes(await getNotes());
        setCurrentNote(null);
        if (view !== 'home') window.history.back();
        setView('home');
        showToast(t('noteSaved'));
    };

    const handleDeleteNote = (id: string) => {
        setConfirmModal({ open: true, noteId: id });
    };

    const confirmDelete = async () => {
        if (!confirmModal.noteId) return;
        await deleteNote(confirmModal.noteId);
        setNotes(await getNotes());
        if (currentNote?.id === confirmModal.noteId) { 
            setCurrentNote(null); 
            if (view !== 'home') window.history.back();
            setView('home'); 
        }
        setConfirmModal({ open: false });
        showToast(t('noteDeleted'));
    };

    const handleArchiveNote = async (note: Note) => {
        const updated = { ...note, isArchived: !note.isArchived };
        await handleSaveNote(updated);
        showToast(updated.isArchived ? t('archivedToast') : t('unarchivedToast'));
    };

    const handlePinNote = async (note: Note) => {
        const updated = { ...note, isPinned: !note.isPinned };
        await handleSaveNote(updated);
        showToast(updated.isPinned ? t('pinnedToast') : t('unpinnedToast'));
    };

    // Locking Logic
    const initiateLock = (note: Note) => {
        if (note.isLocked) {
            const updated = { ...note, isLocked: false, lockPin: undefined };
            handleSaveNote(updated);
            showToast(t('lockRemoved'));
        } else {
            setCurrentNote(note); // Ensure we are targeting this note
            setPinModal({ open: true, mode: 'set' });
        }
    };

    const handlePinResult = async (pin: string) => {
        if (pinModal.mode === 'set' && currentNote) {
            const updated = { ...currentNote, isLocked: true, lockPin: pin };
            await handleSaveNote(updated);
            setPinModal({ ...pinModal, open: false });
            showToast(t('lockedToast'));
        } else if (pinModal.mode === 'set-master') {
            setMasterPin(pin);
            localStorage.setItem('vitreon_master_pin', pin);
            setPinModal({ ...pinModal, open: false });
            showToast(t('masterPinUpdated'));
        } else if (pinModal.mode === 'unlock') {
            const noteToUnlock = notes.find(n => n.id === pinModal.noteId);
            if (noteToUnlock && noteToUnlock.lockPin === pin) {
                setCurrentNote(noteToUnlock);
                setPinModal({ ...pinModal, open: false });
                setView('editor');
            } else {
                alert(t('incorrectPin'));
            }
        }
    };

    const handleToggleBiometrics = async () => {
        const isSupported = await BiometricsService.isSupported();
        if (!isSupported) {
            alert(t('biometricsNotSupported'));
            return;
        }

        if (!isBiometricsEnabled) {
            // Activating: Try to authenticate once to verify
            const success = await BiometricsService.authenticate();
            if (success) {
                setIsBiometricsEnabled(true);
                localStorage.setItem('vitreon_biometrics', 'true');
                showToast(t('biometricsEnabled'));
            } else {
                showToast(t('biometricsFailed'));
            }
        } else {
            // Disabling
            setIsBiometricsEnabled(false);
            localStorage.setItem('vitreon_biometrics', 'false');
            showToast(t('biometricsDisabled'));
        }
    };

    const handleNoteClick = async (note: Note) => {
        if (note.isLocked) {
            if (isBiometricsEnabled) {
                const success = await BiometricsService.authenticate();
                if (success) {
                    setCurrentNote(note);
                    setView('editor');
                    return;
                }
            }
            setPinModal({ open: true, mode: 'unlock', noteId: note.id });
        } else {
            setCurrentNote(note);
            setView('editor');
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            if (event.target?.result) {
                try {
                    const content = event.target.result as string;
                    if (file.name.endsWith('.md')) {
                        const newNote: Note = {
                            id: crypto.randomUUID(),
                            title: file.name.replace('.md', ''),
                            content: content,
                            category: DEFAULT_CATEGORY,
                            isPinned: false, isArchived: false, isLocked: false, isChecklist: false,
                            tags: [], images: [], drawings: [], voiceNotes: [], attachments: [],
                            createdAt: Date.now(), updatedAt: Date.now()
                        };
                        await saveNote(newNote);
                        setNotes(await getNotes());
                        showToast(t('importedMd'));
                    } else {
                        if (confirm(t('confirmImport'))) {
                            const count = await importDataFromJSON(content);
                            setNotes(await getNotes());
                            showToast(t('importedNotes').replace('{count}', String(count)));
                        }
                    }
                } catch { showToast(t('importFailed')); }
            }
            e.target.value = '';
        };
        reader.readAsText(file);
    };

    const handleExportMarkdown = async () => {
        const notesToExport = notes.filter(n => !n.isArchived);
        if (notesToExport.length === 0) return showToast(t('noNotesExport'));
        
        // Since we can't install JSZip due to system restrictions, 
        // we'll trigger the export of all files. 
        // Browsers might ask for permission to download multiple files.
        notesToExport.forEach((note, index) => {
            setTimeout(() => {
                const blob = new Blob([`# ${note.title}\n\n${note.content}`], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${note.title || 'Untitled'}.md`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, index * 100); // Staggered to prevent browser blocking
        });
        showToast(t('exportedFiles').replace('{count}', String(notesToExport.length)));
    };

    const handleAddCategory = (cat: Category) => {
        const updated = [...categories, cat];
        setCategories(updated);
        localStorage.setItem('vitreon_categories', JSON.stringify(updated));
        showToast(t('categoryAdded'));
    };

    const handleDeleteCategory = (id: string) => {
        if (id === DEFAULT_CATEGORY || CATEGORIES(t).some(c => c.id === id)) {
            return alert(t('categoryDeleteError'));
        }
        const updated = categories.filter(c => c.id !== id);
        setCategories(updated);
        localStorage.setItem('vitreon_categories', JSON.stringify(updated));
        showToast(t('categoryRemoved'));
    };

    const handleUpdateProfileImage = (img: string) => {
        setProfileImage(img);
        localStorage.setItem('vitreon_profile_image', img);
        showToast(t('profileImageUpdated'));
    };

    const handleUpdateProfile = (name: string, email: string, bio: string) => {
        setUserName(name);
        setUserEmail(email);
        setUserBio(bio);
        localStorage.setItem('vitreon_user_name', name);
        localStorage.setItem('vitreon_user_email', email);
        localStorage.setItem('vitreon_user_bio', bio);
        showToast(t('noteSaved'));
    };

    const handleOnboardingComplete = () => {
        setIsOnboardingOpen(false);
        localStorage.setItem('vitreon_onboarded', 'true');
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;

    return (
        <div className={`min-h-screen w-full transition-colors duration-500 ${
            theme === 'black' ? 'bg-black text-white' : 
            theme === 'dark' ? 'bg-[#0f172a] text-white' : 
            'bg-[#f0f4f8] text-slate-900'
        }`}>
            {theme !== 'black' && (
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/20 filter blur-[100px] opacity-50 animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/20 filter blur-[100px] opacity-50 animate-pulse" style={{animationDelay: '2s'}}></div>
                </div>
            )}

            <div className="relative z-10 w-full max-w-7xl mx-auto h-[100dvh] overflow-hidden md:border-x border-white/5 flex flex-col">
                {/* Dashboard Header */}
                {(view !== 'editor' && view !== 'profile') && (
                    <div className="flex items-center justify-between px-6 py-6 z-20">
                        <div 
                            onClick={() => setView('profile')}
                            className="w-11 h-11 rounded-2xl glass-card flex items-center justify-center cursor-pointer overflow-hidden group hover:border-indigo-500/50 transition-all"
                        >
                             {profileImage ? (
                                 <img src={profileImage} alt="Profile" className="w-[120%] h-[120%] object-cover" />
                             ) : (
                                 <span className="material-symbols-rounded text-slate-600 dark:text-slate-300 group-hover:text-indigo-400">account_circle</span>
                             )}
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white animate-in slide-in-from-top-4">
                            {view === 'home' ? (showFavorites ? t('favorites') : showArchived ? t('archived') : t('allNotes')) : t(view as any)}
                        </h1>
                        <button 
                            onClick={() => { setShowArchived(!showArchived); setShowFavorites(false); setView('home'); }}
                            className={`w-11 h-11 rounded-2xl glass-card flex items-center justify-center cursor-pointer transition-all ${showArchived ? 'bg-indigo-500 text-white border-indigo-500' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                            <span className="material-symbols-rounded">{showArchived ? 'unarchive' : 'archive'}</span>
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-hidden relative">
                    {view === 'home' && (
                        <HomeView 
                            notes={notes} categories={categories} onNoteClick={handleNoteClick} 
                            showFavorites={showFavorites} onToggleFavorites={() => { setShowFavorites(!showFavorites); setShowArchived(false); setSelectedCategory(null); }} 
                            showArchived={showArchived} onToggleArchive={() => { setShowArchived(!showArchived); setShowFavorites(false); setSelectedCategory(null); }}
                            selectedCategory={selectedCategory} onClearCategory={() => setSelectedCategory(null)}
                            onPinNote={handlePinNote}
                            onReorderNotes={async (reordered) => {
                                // 1. Update local state immediately for snappy UI
                                const total = reordered.length;
                                const reorderedIds = new Set(reordered.map(n => n.id));
                                const updatedWithOrder = reordered.map((n, i) => ({ ...n, order: total - i }));
                                const otherNotes = notes.filter(n => !reorderedIds.has(n.id));
                                
                                setNotes([...updatedWithOrder, ...otherNotes]);

                                // 2. Persist to DB in the background
                                for (const n of updatedWithOrder) {
                                    await saveNote(n);
                                }
                            }}
                        />
                    )}
                    {view === 'categories' && <CategoriesView categories={categories} notes={notes} onCategoryClick={(c) => { setSelectedCategory(c.id); setView('home'); setShowFavorites(false); setShowArchived(false); }} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} />}
                    {view === 'settings' && (
                        <SettingsView 
                            theme={theme} setTheme={setTheme} 
                            onExport={() => { exportDataToJSON().then(json => { const blob = new Blob([json], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `vitreon_backup_${new Date().toISOString().slice(0, 10)}.json`; a.click(); showToast(t('exported')); }); }} 
                            onImport={handleImport} 
                            onExportMD={handleExportMarkdown}
                            onImportMD={() => document.getElementById('md-import')?.click()}
                            onExportGDrive={() => showToast('Google Drive Export: ' + t('noNotesExport'))}
                            onImportGDrive={() => showToast('Google Drive Import: ' + t('importFailed'))}
                        />
                    )}
                    {view === 'profile' && (
                        <ProfileView 
                            notesCount={notes.length} 
                            categoriesCount={categories.length} 
                            onBack={() => setView('home')} 
                            masterPin={masterPin}
                            isBiometricsEnabled={isBiometricsEnabled}
                            onSetMasterPin={() => setPinModal({ open: true, mode: 'set-master' })}
                            onToggleBiometrics={handleToggleBiometrics}
                            profileImage={profileImage}
                            onUpdateProfileImage={handleUpdateProfileImage}
                            userName={userName}
                            userEmail={userEmail}
                            userBio={userBio}
                            onUpdateProfile={handleUpdateProfile}
                        />
                    )}
                    {view === 'editor' && currentNote && (
                        <NoteEditor 
                            initialNote={currentNote} categories={categories}
                            onSave={handleSaveNote} onDelete={handleDeleteNote} 
                            onArchive={handleArchiveNote} onPin={handlePinNote} onLock={initiateLock}
                            onBack={() => {
                                window.history.back();
                                setView('home');
                            }}
                        />
                    )}
                </div>

                {(view !== 'editor' && view !== 'profile') && (
                    <div className="h-20 absolute bottom-0 left-0 right-0 glass-blur rounded-t-[40px] flex items-center justify-around px-8 z-20 border-t border-white/5 animate-in slide-in-from-bottom-8">
                        <button onClick={() => {setView('home'); setShowFavorites(false); setShowArchived(false);}} className={`p-3 rounded-2xl transition-all ${view === 'home' && !showFavorites && !showArchived ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                            <span className="material-symbols-rounded text-2xl" style={{ fontVariationSettings: view === 'home' && !showFavorites && !showArchived ? "'FILL' 1" : "'FILL' 0" }}>home</span>
                        </button>
                        <button onClick={() => {setView('categories'); setShowFavorites(false); setShowArchived(false);}} className={`p-3 rounded-2xl transition-all ${view === 'categories' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                            <span className="material-symbols-rounded text-2xl" style={{ fontVariationSettings: view === 'categories' ? "'FILL' 1" : "'FILL' 0" }}>folder</span>
                        </button>
                        
                        <div className="relative -top-8">
                             <button 
                                onClick={handleCreateNote} 
                                className={`w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all outline-none ring-4 animate-smooth-in ${
                                    theme === 'black' ? 'ring-black border-2 border-white' : 
                                    theme === 'dark' ? 'ring-[#0f172a] border-2 border-white/50' : 
                                    'ring-[#f0f4f8] border-2 border-black'
                                }`}
                             >
                                <span className="material-symbols-rounded text-3xl font-bold">add</span>
                             </button>
                        </div>

                        <button onClick={() => {setShowFavorites(true); setShowArchived(false); setView('home');}} className={`p-3 rounded-2xl transition-all ${showFavorites ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                            <span className="material-symbols-rounded text-2xl" style={{ fontVariationSettings: showFavorites ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                        </button>
                        <button onClick={() => {setView('settings'); setShowFavorites(false); setShowArchived(false);}} className={`p-3 rounded-2xl transition-all ${view === 'settings' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                            <span className="material-symbols-rounded text-2xl" style={{ fontVariationSettings: view === 'settings' ? "'FILL' 1" : "'FILL' 0" }}>settings</span>
                        </button>
                    </div>
                )}
            </div>

            <OnboardingModal 
                isOpen={isOnboardingOpen} 
                onComplete={handleOnboardingComplete} 
                onImport={handleImport}
            />
            <PinModal isOpen={pinModal.open} onClose={() => setPinModal({...pinModal, open: false})} isSettingPin={pinModal.mode === 'set' || pinModal.mode === 'set-master'} onUnlock={handlePinResult} />
            <ConfirmModal 
                isOpen={confirmModal.open} 
                title={t('deleteNote')} 
                message={t('deleteMessage')} 
                onConfirm={confirmDelete} 
                onCancel={() => setConfirmModal({ open: false })}
                confirmText={t('delete')}
                cancelText={t('cancel')}
            />
            <input type="file" id="md-import" className="hidden" accept=".md,.json" onChange={handleImport} />
            {toastMsg && <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[60] px-6 py-3 rounded-full glass-panel shadow-xl text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2 animate-in fade-in slide-in-from-top-2"><span className="material-symbols-rounded text-green-500 text-lg">check_circle</span>{toastMsg}</div>}
        </div>
    );
}