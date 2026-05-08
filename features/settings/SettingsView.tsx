import React from 'react';
import { ThemeMode } from '../../types';
import { useI18n } from '../../services/i18n';

interface SettingsViewProps {
    theme: ThemeMode;
    setTheme: (t: ThemeMode) => void;
    onExport: () => void;
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onExportMD: () => void;
    onImportMD: () => void;
    onExportGDrive: () => void;
    onImportGDrive: () => void;
    onShowPrivacy: () => void;
    onDeleteAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
    theme, setTheme, onExport, onImport, onExportMD, onImportMD, onExportGDrive, onImportGDrive,
    onShowPrivacy, onDeleteAllData
}) => {
    const { t, lang, setLang } = useI18n();
    const [showGDrive, setShowGDrive] = React.useState(false);

    React.useEffect(() => {
        setShowGDrive(localStorage.getItem('vitreon_dev_gdrive') === 'true');
    }, []);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'pt', name: 'Português' }
    ] as const;

    return (
        <div className="p-6 h-full overflow-y-auto no-scrollbar pb-32 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black mb-10 text-slate-800 dark:text-white tracking-tight  stagger-1">{t('settings')}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
                {/* Appearance Section */}
                <div className="glass-card p-8 rounded-[40px] stagger-1 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-inner">
                            <span className="material-symbols-rounded text-3xl">palette</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">{t('appearance')}</h3>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{t('appearanceTheme')}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 bg-black/5 dark:bg-white/5 p-2 rounded-2xl inline-flex w-full">
                        <button 
                            onClick={() => setTheme('light')} 
                            className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 text-sm font-black transition-all ${theme === 'light' ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
                        >
                            <span className="material-symbols-rounded">light_mode</span> {t('themeLight')}
                        </button>
                        <button 
                            onClick={() => setTheme('dark')} 
                            className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 text-sm font-black transition-all ${theme === 'dark' ? 'bg-slate-800 shadow-xl text-indigo-400' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
                        >
                            <span className="material-symbols-rounded">dark_mode</span> {t('themeDark')}
                        </button>
                        <button 
                            onClick={() => setTheme('black')} 
                            className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 text-sm font-black transition-all ${theme === 'black' ? 'bg-black shadow-[0_0_20px_rgba(255,255,255,0.1)] text-white border border-white/20' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
                        >
                            <span className="material-symbols-rounded">contrast</span> {t('themeBlack')}
                        </button>
                    </div>
                </div>

                {/* Language Section */}
                <div className="glass-card p-8 rounded-[40px] stagger-2 hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner">
                            <span className="material-symbols-rounded text-3xl">language</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">{t('language')}</h3>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{t('selectDialect')}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {languages.map((l) => (
                            <button
                                key={l.code}
                                onClick={() => setLang(l.code as any)}
                                className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm transition-all border-2 active:scale-95 ${lang === l.code ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-500 hover:border-emerald-500/30'}`}
                            >
                                {l.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Data Management Section */}
                <div className="glass-card p-8 rounded-[40px] stagger-3 lg:col-span-2 hover:border-purple-500/30 transition-all">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shadow-inner">
                            <span className="material-symbols-rounded text-3xl">database</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">{t('dataOps')}</h3>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{t('backupAndRestore')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Markdown Support */}
                        <div className="space-y-4">
                            <button onClick={onExportMD} className="w-full flex items-center gap-4 p-5 rounded-[28px] bg-indigo-500/5 dark:bg-indigo-500/10 border-2 border-transparent hover:border-indigo-500/30 transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-rounded">description</span>
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-slate-800 dark:text-white text-sm">{t('exportMd')}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t('markdownBundle')}</div>
                                </div>
                            </button>
                            <button onClick={onImportMD} className="w-full flex items-center gap-4 p-5 rounded-[28px] bg-purple-500/5 dark:bg-purple-500/10 border-2 border-transparent hover:border-purple-500/30 transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-rounded">upload_file</span>
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-slate-800 dark:text-white text-sm">{t('importMd')}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t('markdownFile')}</div>
                                </div>
                            </button>
                        </div>

                        {/* JSON Support */}
                        <div className="space-y-4">
                            <button onClick={onExport} className="w-full flex items-center gap-4 p-6 rounded-[28px] bg-slate-500/5 dark:bg-white/5 border-2 border-transparent hover:border-slate-500/30 dark:hover:border-white/20 transition-all group">
                                <span className="material-symbols-rounded text-slate-400 group-hover:scale-110 transition-transform">download</span>
                                <div className="text-left">
                                    <div className="font-bold text-slate-700 dark:text-slate-200 text-sm">{t('exportJson')}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t('fullBackup')}</div>
                                </div>
                            </button>
                            <label className="w-full flex items-center gap-4 p-6 rounded-[28px] bg-slate-500/5 dark:bg-white/5 border-2 border-transparent hover:border-slate-500/30 dark:hover:border-white/20 transition-all cursor-pointer group">
                                <span className="material-symbols-rounded text-slate-400 group-hover:scale-110 transition-transform">upload</span>
                                <div className="text-left">
                                    <div className="font-bold text-slate-700 dark:text-slate-200 text-sm">{t('importJson')}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t('restoreData')}</div>
                                </div>
                                <input type="file" className="hidden" accept=".json,.vitreon" onChange={onImport} />
                            </label>
                        </div>

                        {/* Google Drive Section */}
                        {showGDrive && (
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-black/5 dark:border-white/5">
                                <button onClick={onExportGDrive} className="w-full flex items-center gap-4 p-6 rounded-[28px] bg-blue-500/5 dark:bg-blue-500/10 border-2 border-transparent hover:border-blue-500/30 transition-all group">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-rounded">cloud_upload</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-slate-800 dark:text-white text-sm">{t('exportGDrive')}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t('googleDrive')}</div>
                                    </div>
                                </button>
                                <button onClick={onImportGDrive} className="w-full flex items-center gap-4 p-6 rounded-[28px] bg-blue-600/5 dark:bg-blue-600/10 border-2 border-transparent hover:border-blue-600/30 transition-all group">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-rounded">cloud_download</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-slate-800 dark:text-white text-sm">{t('importGDrive')}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t('googleDrive')}</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* GDPR & Privacy Section */}
                <div className="glass-card p-8 rounded-[40px] stagger-4 lg:col-span-2 border-2 border-transparent hover:border-blue-500/30 transition-all bg-gradient-to-br from-transparent to-blue-500/5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-inner">
                                <span className="material-symbols-rounded text-3xl">gavel</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">{t('privacyCompliance')}</h3>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{t('gdprRights')}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button 
                                onClick={onShowPrivacy}
                                className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-white/10 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-rounded text-lg">policy</span>
                                {t('privacyPolicy')}
                            </button>
                            <button 
                                onClick={onExport}
                                className="px-6 py-3 rounded-2xl bg-indigo-500/10 text-indigo-500 font-bold text-xs hover:bg-indigo-500/20 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-rounded text-lg">download</span>
                                {t('exportMyData')}
                            </button>
                            <button 
                                onClick={onDeleteAllData}
                                className="px-6 py-3 rounded-2xl bg-red-500/10 text-red-500 font-bold text-xs hover:bg-red-500/20 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-rounded text-lg">delete_forever</span>
                                {t('deleteAllData')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl text-center opacity-30 mt-16  stagger-4">
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em]">{t('version')}</p>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 mt-2 uppercase">{t('appInfo')}</p>
            </div>
        </div>
    );
};