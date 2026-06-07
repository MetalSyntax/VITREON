import React from 'react';
import { ThemeMode } from '../../types';
import { useI18n } from '../../services/i18n';

type ExportFormat = 'md' | 'json' | 'vitreon';

interface SettingsViewProps {
    theme: ThemeMode;
    setTheme: (t: ThemeMode) => void;
    onExport: (format: ExportFormat) => void;
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onExportGDrive: () => void;
    onImportGDrive: () => void;
    onShowPrivacy: () => void;
    onShowTerms: () => void;
    onDeleteAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
    theme, setTheme, onExport, onImport, onExportGDrive, onImportGDrive,
    onShowPrivacy, onShowTerms, onDeleteAllData
}) => {
    const { t, lang, setLang } = useI18n();
    const [showGDrive, setShowGDrive] = React.useState(false);
    const [expandedPanel, setExpandedPanel] = React.useState<'export' | 'import' | null>(null);

    const mdImportRef = React.useRef<HTMLInputElement>(null);
    const jsonImportRef = React.useRef<HTMLInputElement>(null);
    const vitreonImportRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setShowGDrive(localStorage.getItem('vitreon_dev_gdrive') === 'true');
    }, []);

    const togglePanel = (panel: 'export' | 'import') => {
        setExpandedPanel(prev => prev === panel ? null : panel);
    };

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'pt', name: 'Português' }
    ] as const;

    const exportFormats = [
        {
            id: 'md' as ExportFormat,
            ext: '.MD',
            label: t('exportMd'),
            desc: t('exportMdDesc'),
            color: 'indigo',
            icon: 'description',
        },
        {
            id: 'json' as ExportFormat,
            ext: '.JSON',
            label: t('exportJson'),
            desc: t('exportJsonDesc'),
            color: 'slate',
            icon: 'data_object',
        },
        {
            id: 'vitreon' as ExportFormat,
            ext: '.VITREON',
            label: 'Export .VITREON',
            desc: t('exportVitreonDesc'),
            color: 'purple',
            icon: 'shield_lock',
            badge: t('encryptedFormat'),
        },
    ];

    const importFormats = [
        {
            id: 'md',
            ext: '.MD',
            label: t('importMd'),
            desc: t('importMdDesc'),
            color: 'indigo',
            icon: 'upload_file',
            ref: mdImportRef,
            accept: '.md',
        },
        {
            id: 'json',
            ext: '.JSON',
            label: t('importJson'),
            desc: t('importJsonDesc'),
            color: 'slate',
            icon: 'upload',
            ref: jsonImportRef,
            accept: '.json,.vitreon',
        },
        {
            id: 'vitreon',
            ext: '.VITREON',
            label: 'Import .VITREON',
            desc: t('importVitreonDesc'),
            color: 'purple',
            icon: 'lock_open',
            ref: vitreonImportRef,
            accept: '.vitreon',
            badge: t('encryptedFormat'),
        },
    ];

    const colorMap: Record<string, string> = {
        indigo: 'bg-indigo-500/10 hover:border-indigo-500/40 text-indigo-500',
        slate: 'bg-slate-500/5 dark:bg-white/5 hover:border-slate-400/30 text-slate-500',
        purple: 'bg-purple-500/10 hover:border-purple-500/40 text-purple-500',
    };
    const iconColorMap: Record<string, string> = {
        indigo: 'bg-indigo-500',
        slate: 'bg-slate-500',
        purple: 'bg-purple-500',
    };

    return (
        <div className="p-6 h-full overflow-y-auto no-scrollbar pb-32 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">

                {/* Appearance */}
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
                        <button onClick={() => setTheme('light')} className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 text-sm font-black transition-all ${theme === 'light' ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}>
                            <span className="material-symbols-rounded">light_mode</span> {t('themeLight')}
                        </button>
                        <button onClick={() => setTheme('dark')} className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 text-sm font-black transition-all ${theme === 'dark' ? 'bg-slate-800 shadow-xl text-indigo-400' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}>
                            <span className="material-symbols-rounded">dark_mode</span> {t('themeDark')}
                        </button>
                        <button onClick={() => setTheme('black')} className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 text-sm font-black transition-all ${theme === 'black' ? 'bg-black shadow-[0_0_20px_rgba(255,255,255,0.1)] text-white border border-white/20' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}>
                            <span className="material-symbols-rounded">contrast</span> {t('themeBlack')}
                        </button>
                    </div>
                </div>

                {/* Language */}
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
                            <button key={l.code} onClick={() => setLang(l.code as any)} className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm transition-all border-2 active:scale-95 ${lang === l.code ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-black/5 dark:bg-white/5 border-transparent text-slate-500 hover:border-emerald-500/30'}`}>
                                {l.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Data Management – unified export/import */}
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
                        {/* ── Export ── */}
                        <div>
                            <button
                                onClick={() => togglePanel('export')}
                                className={`w-full flex items-center gap-4 p-5 rounded-[28px] border-2 transition-all group ${expandedPanel === 'export' ? 'bg-purple-500/10 border-purple-500/40' : 'bg-purple-500/5 dark:bg-purple-500/10 border-transparent hover:border-purple-500/30'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 ${expandedPanel === 'export' ? 'bg-purple-600' : 'bg-purple-500'}`}>
                                    <span className="material-symbols-rounded">download</span>
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-bold text-slate-800 dark:text-white text-sm">{t('exportData')}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t('chooseExportFormat')}</div>
                                </div>
                                <span className={`material-symbols-rounded text-slate-400 transition-transform duration-300 ${expandedPanel === 'export' ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>

                            {expandedPanel === 'export' && (
                                <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                    {exportFormats.map(fmt => (
                                        <button
                                            key={fmt.id}
                                            onClick={() => { onExport(fmt.id); setExpandedPanel(null); }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-transparent transition-all group ${colorMap[fmt.color]}`}
                                        >
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 ${iconColorMap[fmt.color]}`}>
                                                <span className="material-symbols-rounded text-lg">{fmt.icon}</span>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-2">
                                                    <span className="font-black">{fmt.ext}</span>
                                                    {fmt.badge && (
                                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-400">{fmt.badge}</span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">{fmt.desc}</div>
                                            </div>
                                            <span className="material-symbols-rounded text-lg opacity-40 group-hover:opacity-100 transition-opacity">chevron_right</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Import ── */}
                        <div>
                            <button
                                onClick={() => togglePanel('import')}
                                className={`w-full flex items-center gap-4 p-5 rounded-[28px] border-2 transition-all group ${expandedPanel === 'import' ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-indigo-500/5 dark:bg-indigo-500/10 border-transparent hover:border-indigo-500/30'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 ${expandedPanel === 'import' ? 'bg-indigo-600' : 'bg-indigo-500'}`}>
                                    <span className="material-symbols-rounded">upload</span>
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-bold text-slate-800 dark:text-white text-sm">{t('importData')}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{t('chooseImportFormat')}</div>
                                </div>
                                <span className={`material-symbols-rounded text-slate-400 transition-transform duration-300 ${expandedPanel === 'import' ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>

                            {expandedPanel === 'import' && (
                                <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                    {importFormats.map(fmt => (
                                        <button
                                            key={fmt.id}
                                            onClick={() => { fmt.ref.current?.click(); setExpandedPanel(null); }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-transparent transition-all group ${colorMap[fmt.color]}`}
                                        >
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 ${iconColorMap[fmt.color]}`}>
                                                <span className="material-symbols-rounded text-lg">{fmt.icon}</span>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-2">
                                                    <span className="font-black">{fmt.ext}</span>
                                                    {fmt.badge && (
                                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-400">{fmt.badge}</span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">{fmt.desc}</div>
                                            </div>
                                            <span className="material-symbols-rounded text-lg opacity-40 group-hover:opacity-100 transition-opacity">chevron_right</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Hidden file inputs per format */}
                            <input ref={mdImportRef} type="file" className="hidden" accept=".md" onChange={onImport} />
                            <input ref={jsonImportRef} type="file" className="hidden" accept=".json" onChange={onImport} />
                            <input ref={vitreonImportRef} type="file" className="hidden" accept=".vitreon" onChange={onImport} />
                        </div>

                        {/* Google Drive */}
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

                {/* GDPR & Privacy + Terms */}
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
                            <button onClick={onShowPrivacy} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-white/10 transition-all flex items-center gap-2">
                                <span className="material-symbols-rounded text-lg">policy</span>
                                {t('privacyPolicy')}
                            </button>
                            <button onClick={onShowTerms} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-white/10 transition-all flex items-center gap-2">
                                <span className="material-symbols-rounded text-lg">gavel</span>
                                {t('termsAndConditions')}
                            </button>
                            <button onClick={onDeleteAllData} className="px-6 py-3 rounded-2xl bg-red-500/10 text-red-500 font-bold text-xs hover:bg-red-500/20 transition-all flex items-center gap-2">
                                <span className="material-symbols-rounded text-lg">delete_forever</span>
                                {t('deleteAllData')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl text-center opacity-30 mt-16 stagger-4">
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em]">{t('version')}</p>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 mt-2 uppercase">{t('appInfo')}</p>
            </div>
        </div>
    );
};
