import React from 'react';
import { useI18n } from '../../services/i18n';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
    const { t } = useI18n();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass-panel w-full max-w-2xl max-h-[85vh] flex flex-col rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
                <div className="px-8 pt-10 pb-6 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                            <span className="material-symbols-rounded text-2xl">gavel</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t('termsAndConditions')}</h3>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors">
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar px-10 py-8 space-y-8">
                    <section className="space-y-3">
                        <h4 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-rounded text-purple-400">info</span>
                            {t('termsAcceptanceTitle')}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t('termsAcceptanceDesc')}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h4 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-rounded text-purple-400">person</span>
                            {t('termsUseTitle')}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t('termsUseDesc')}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h4 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-rounded text-purple-400">lock</span>
                            {t('termsDataTitle')}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t('termsDataDesc')}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h4 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-rounded text-purple-400">warning</span>
                            {t('termsLiabilityTitle')}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t('termsLiabilityDesc')}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h4 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-rounded text-purple-400">update</span>
                            {t('termsChangesTitle')}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t('termsChangesDesc')}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h4 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-rounded text-purple-400">mail</span>
                            {t('termsContactTitle')}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {t('termsContactDesc')}
                        </p>
                    </section>
                </div>

                <div className="px-10 py-8 border-t border-white/5 bg-white/5">
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                    >
                        {t('close')}
                    </button>
                </div>
            </div>
        </div>
    );
};
