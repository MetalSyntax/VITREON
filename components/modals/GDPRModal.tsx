import React from 'react';
import { useI18n } from '../../services/i18n';

interface GDPRModalProps {
    isOpen: boolean;
    onAccept: () => void;
}

export const GDPRModal: React.FC<GDPRModalProps> = ({ isOpen, onAccept }) => {
    const { t } = useI18n();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-500">
            <div className="bg-[var(--bg-app)] w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl border-t sm:border border-white/10 animate-in slide-in-from-bottom-10 duration-700">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center shadow-inner">
                        <span className="material-symbols-rounded text-3xl">verified_user</span>
                    </div>
                    <div>
                        <h3 className="font-black text-2xl text-slate-800 dark:text-white tracking-tight">
                            {t('gdprTitle')}
                        </h3>
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest opacity-70">Privacy First Architecture</p>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {t('gdprMessage')}
                    </p>
                    <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                        <ul className="space-y-2">
                            <li className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-rounded text-green-500 text-lg">check_circle</span>
                                100% Local Storage (IndexedDB)
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-rounded text-green-500 text-lg">check_circle</span>
                                AES-GCM 256-bit Encryption
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-rounded text-green-500 text-lg">check_circle</span>
                                No Cloud Sync (unless configured)
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={onAccept}
                        className="w-full py-5 bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/25 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        {t('accept')}
                    </button>
                    <button className="w-full py-3 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-indigo-500 transition-colors">
                        {t('privacyPolicy')}
                    </button>
                </div>
            </div>
        </div>
    );
};
