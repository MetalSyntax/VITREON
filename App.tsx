import React, { useState, useEffect } from 'react';
import { Note, Category, ThemeMode } from './types';
import { saveNote, getNotes, deleteNote, exportDataToJSON, importDataFromJSON, cleanupTrash } from './services/storage';
import { initGoogleDrive, syncToGoogleDrive, downloadFromGoogleDrive, listGoogleDriveBackups } from './services/googleDrive';
import { GDriveModal } from './components/modals/GDriveModal';
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
import { GDPRModal } from './components/modals/GDPRModal';

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
    const [showTrash, setShowTrash] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ open: boolean, noteId?: string, isPermanent?: boolean, isEmptyTrash?: boolean }>({ open: false });
    const [pinModal, setPinModal] = useState<{ open: boolean, mode: 'unlock'|'set'|'set-master', noteId?: string }>({ open: false, mode: 'unlock' });
    const [masterPin, setMasterPin] = useState<string | null>(localStorage.getItem('vitreon_master_pin'));
    const [isBiometricsEnabled, setIsBiometricsEnabled] = useState<boolean>(localStorage.getItem('vitreon_biometrics') === 'true');
    const [profileImage, setProfileImage] = useState<string | null>(localStorage.getItem('vitreon_profile_image'));
    const [userName, setUserName] = useState(localStorage.getItem('vitreon_user_name') || 'Vitreon User');
    const [userEmail, setUserEmail] = useState(localStorage.getItem('vitreon_user_email') || 'vitreon.notes@example.com');
    const [userBio, setUserBio] = useState(localStorage.getItem('vitreon_user_bio') || 'Digital minimalist and note-taking enthusiast.');
    const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(!localStorage.getItem('vitreon_onboarded'));
    const [showGDPR, setShowGDPR] = useState<boolean>(!localStorage.getItem('vitreon_accepted_gdpr'));
    const [gdriveModal, setGdriveModal] = useState<{ open: boolean, files: any[] }>({ open: false, files: [] });

    // Initial Load
    useEffect(() => {
        const load = async () => {
            await cleanupTrash();
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
        
        // Update Mobile Status Bar Color
        const themeColors = {
            light: '#f8fafc',
            dark: '#030712',
            black: '#000000'
        };
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.setAttribute('name', 'theme-color');
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.setAttribute('content', themeColors[theme]);
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

    const handleSaveNote = async (updatedNote: Note, closeEditor: boolean = true) => {
        let titleToSave = updatedNote.title;
        if (!titleToSave) {
            titleToSave = updatedNote.isChecklist ? 'Checklist' : (updatedNote.content.split('\n')[0].substring(0, 30) || 'Untitled Note');
        }
        const toSave = { ...updatedNote, title: titleToSave, updatedAt: Date.now() };
        await saveNote(toSave);
        setNotes(await getNotes());
        
        if (closeEditor) {
            setCurrentNote(null);
            if (view !== 'home') window.history.back();
            setView('home');
            showToast(t('noteSaved'));
        } else {
            setCurrentNote(toSave);
        }
    };

    const handleDeleteNote = (id: string) => {
        const note = notes.find(n => n.id === id);
        if (note?.deletedAt) {
            setConfirmModal({ open: true, noteId: id, isPermanent: true });
        } else {
            setConfirmModal({ open: true, noteId: id, isPermanent: false });
        }
    };

    const confirmDelete = async () => {
        if (confirmModal.isEmptyTrash) {
            const trashedNotes = notes.filter(n => !!n.deletedAt);
            for (const n of trashedNotes) {
                await deleteNote(n.id);
            }
            showToast(t('noteDeleted'));
        } else if (confirmModal.noteId) {
            if (confirmModal.isPermanent) {
                await deleteNote(confirmModal.noteId);
                showToast(t('noteDeleted'));
            } else {
                const note = notes.find(n => n.id === confirmModal.noteId);
                if (note) {
                    const updated = { ...note, deletedAt: Date.now(), isPinned: false };
                    await saveNote(updated);
                    showToast(t('movedToTrash'));
                }
            }
        } else {
            return;
        }
        
        setNotes(await getNotes());
        if (currentNote?.id === confirmModal.noteId) { 
            setCurrentNote(null); 
            if (view !== 'home') window.history.back();
            setView('home'); 
        }
        setConfirmModal({ open: false });
    };

    const handleRestoreNote = async (note: Note) => {
        const updated = { ...note, deletedAt: undefined };
        await handleSaveNote(updated);
        showToast(t('noteRestored'));
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
                showToast(t('incorrectPin'));
            }
        }
    };

    const handleToggleBiometrics = async () => {
        const isSupported = await BiometricsService.isSupported();
        if (!isSupported) {
            showToast(t('biometricsNotSupported'));
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
        if (note.deletedAt) return;
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
        let updated;
        if (categories.some(c => c.id === cat.id)) {
            updated = categories.map(c => c.id === cat.id ? cat : c);
        } else {
            updated = [...categories, cat];
        }
        setCategories(updated);
        localStorage.setItem('vitreon_categories', JSON.stringify(updated));
        showToast(updated.length === categories.length ? t('saved' as any) || t('categoryAdded') : t('categoryAdded'));
    };

    const handleExportGDrive = async () => {
        setIsLoading(true);
        try {
            await initGoogleDrive();
            const json = await exportDataToJSON();
            // Just verifying it is exactly the same as local export
            await syncToGoogleDrive(json);
            showToast(t('exported'));
        } catch (e: any) {
            console.error(e);
            showToast("Google Drive Sync Failed");
        }
        setIsLoading(false);
    };

    const handleImportGDrive = async () => {
        setIsLoading(true);
        try {
            await initGoogleDrive();
            const files = await listGoogleDriveBackups();
            if (files && files.length > 0) {
                setGdriveModal({ open: true, files });
            } else {
                showToast("No backups found on Google Drive");
            }
        } catch (e: any) {
            console.error(e);
            showToast("Google Drive Import Failed");
        }
        setIsLoading(false);
    };

    const processGDriveImport = async (fileId: string) => {
        setIsLoading(true);
        setGdriveModal({ open: false, files: [] });
        try {
            const jsonContent = await downloadFromGoogleDrive(fileId);
            if (jsonContent) {
                const count = await importDataFromJSON(jsonContent);
                showToast(t('imported' as any).replace('{count}', String(count)));
                const updatedNotes = await getNotes();
                setNotes(updatedNotes);
            }
        } catch (e) {
            showToast("Restore failed");
            console.error(e);
        }
        setIsLoading(false);
    };

    const handleDeleteCategory = (id: string) => {
        if (id === DEFAULT_CATEGORY || CATEGORIES(t).some(c => c.id === id)) {
            showToast(t('categoryDeleteError'));
            return;
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
                            {view === 'home' ? (showFavorites ? t('favorites') : showArchived ? t('archived') : showTrash ? t('trash') : t('allNotes')) : t(view as any)}
                        </h1>
                        <button 
                            onClick={() => { setShowArchived(!showArchived); setShowFavorites(false); setShowTrash(false); setView('home'); }}
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
                            showFavorites={showFavorites} onToggleFavorites={() => { setShowFavorites(!showFavorites); setShowArchived(false); setShowTrash(false); setSelectedCategory(null); }} 
                            showArchived={showArchived} onToggleArchive={() => { setShowArchived(!showArchived); setShowFavorites(false); setShowTrash(false); setSelectedCategory(null); }}
                            showTrash={showTrash} onToggleTrash={() => { setShowTrash(!showTrash); setShowFavorites(false); setShowArchived(false); setSelectedCategory(null); }}
                            onRestoreNote={handleRestoreNote}
                            onEmptyTrash={() => setConfirmModal({ open: true, isEmptyTrash: true, isPermanent: true })}
                            selectedCategory={selectedCategory} onClearCategory={() => setSelectedCategory(null)}
                            onPinNote={handlePinNote}
                            onDeleteNote={handleDeleteNote}
                            onUpdateNote={handleSaveNote}
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
                            onExportGDrive={handleExportGDrive}
                            onImportGDrive={handleImportGDrive}
                        />
                    )}
                    {view === 'profile' && (
                        <ProfileView 
                            notesCount={notes.filter(n => !n.deletedAt).length} 
                            categoriesCount={categories.length} 
                            onBack={() => setView('home')} 
                            onViewTrash={() => { setShowTrash(true); setView('home'); setShowFavorites(false); setShowArchived(false); }}
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
                        <button onClick={() => {setView('home'); setShowFavorites(false); setShowArchived(false); setShowTrash(false);}} className={`p-3 rounded-2xl transition-all ${view === 'home' && !showFavorites && !showArchived && !showTrash ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                            <span className="material-symbols-rounded text-2xl" style={{ fontVariationSettings: view === 'home' && !showFavorites && !showArchived && !showTrash ? "'FILL' 1" : "'FILL' 0" }}>home</span>
                        </button>
                        <button onClick={() => {setView('categories'); setShowFavorites(false); setShowArchived(false); setShowTrash(false);}} className={`p-3 rounded-2xl transition-all ${view === 'categories' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
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

                        <button onClick={() => {setShowFavorites(true); setShowArchived(false); setShowTrash(false); setView('home');}} className={`p-3 rounded-2xl transition-all ${showFavorites ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                            <span className="material-symbols-rounded text-2xl" style={{ fontVariationSettings: showFavorites ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                        </button>
                        <button onClick={() => {setView('settings'); setShowFavorites(false); setShowArchived(false); setShowTrash(false);}} className={`p-3 rounded-2xl transition-all ${view === 'settings' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
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
                title={confirmModal.isPermanent ? t('permanentDelete') : t('moveToTrash')} 
                message={confirmModal.isPermanent ? t('deleteMessage') : t('trashMessage')} 
                onConfirm={confirmDelete} 
                onCancel={() => setConfirmModal({ open: false })}
                confirmText={confirmModal.isPermanent ? t('delete') : t('confirm')}
                cancelText={t('cancel')}
            />
            <input type="file" id="md-import" className="hidden" accept=".md,.json" onChange={handleImport} />
            <GDPRModal 
                isOpen={showGDPR} 
                onAccept={() => {
                    localStorage.setItem('vitreon_accepted_gdpr', 'true');
                    setShowGDPR(false);
                }} 
            />
            {toastMsg && <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[60] px-6 py-3 rounded-full glass-panel shadow-xl text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2 animate-in fade-in slide-in-from-top-2"><span className="material-symbols-rounded text-green-500 text-lg">check_circle</span>{toastMsg}</div>}
            
            <GDriveModal 
                isOpen={gdriveModal.open} 
                files={gdriveModal.files} 
                onClose={() => setGdriveModal({ open: false, files: [] })}
                onSelect={(fileId) => processGDriveImport(fileId)}
            />
        </div>
    );
}