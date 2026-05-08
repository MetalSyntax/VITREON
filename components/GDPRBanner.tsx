import React from 'react';
import { useI18n } from '../services/i18n';

interface GDPRBannerProps {
    onAccept: () => void;
    onLearnMore: () => void;
}

export const GDPRBanner: React.FC<GDPRBannerProps> = ({ onAccept, onLearnMore }) => {
    const { t } = useI18n();

    return (
        <div 
            className="fixed bottom-6 left-6 right-6 z-[150] sm:left-auto sm:right-10 sm:max-w-md animate-in slide-in-from-bottom-10 duration-500"
            role="status"
            aria-live="polite"
        >
            <div className="glass-panel p-6 rounded-[32px] shadow-2xl border border-white/10 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <span className="material-symbols-rounded text-xl">security</span>
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 dark:text-white leading-none">{t('securityTitle')}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {t('consentMessage')}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={onLearnMore}
                        className="flex-1 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:bg-white/5 transition-all"
                    >
                        {t('learnMore')}
                    </button>
                    <button 
                        onClick={onAccept}
                        className="flex-1 py-3 rounded-2xl bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 transition-all"
                    >
                        {t('gotIt')}
                    </button>
                </div>
            </div>
        </div>
    );
};
