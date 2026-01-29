import React, { useRef } from 'react';
import { useI18n } from '../../services/i18n';

interface OnboardingModalProps {
    isOpen: boolean;
    onComplete: () => void;
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete, onImport }) => {
    const { t } = useI18n();
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xl transition-all duration-700">
            <div className="bg-[var(--bg-app)] w-full max-w-lg rounded-[48px] p-4 md:p-10 shadow-2xl border border-white/20 relative overflow-hidden animate-in zoom-in-95 duration-500">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[32px] flex items-center justify-center mb-2 shadow-2xl shadow-indigo-500/40 animate-float">
                        <span className="material-symbols-rounded text-5xl text-white">auto_awesome</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4x font-black text-slate-800 dark:text-white mb-4 tracking-tight">
                        {t('welcome')}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed mb-2 max-w-sm">
                        {t('onboardingDesc')}
                    </p>

                    <div className="w-full space-y-4">
                         <button 
                            onClick={onComplete}
                            className="w-full group relative flex items-center justify-between p-6 bg-indigo-500 text-white rounded-[32px] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all text-left"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-rounded text-2xl font-bold">add</span>
                                </div>
                                <div>
                                    <div className="font-black text-lg uppercase tracking-wider">{t('startFresh')}</div>
                                    <div className="text-white/70 text-sm font-medium">{t('startFreshDesc')}</div>
                                </div>
                            </div>
                            <span className="material-symbols-rounded group-hover:translate-x-2 transition-transform">arrow_forward</span>
                        </button>


                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".json" 
                        onChange={(e) => {
                            onImport(e);
                            onComplete();
                        }} 
                    />

                    <p className="mt-12 text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">
                        {t('getStarted')}
                    </p>
                </div>
            </div>
        </div>
    );
};
