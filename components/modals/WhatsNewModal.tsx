import React, { useEffect, useRef, useState } from 'react';
import { ChangelogEntry, APP_VERSION } from '../../constants';
import { useI18n } from '../../services/i18n';

interface WhatsNewModalProps {
    isOpen: boolean;
    entries: ChangelogEntry[];
    onClose: () => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, entries, onClose }) => {
    const { t } = useI18n();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    const modalRef = useRef<HTMLDivElement>(null);
    const closeBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
            if (e.key === 'Tab' && isOpen && modalRef.current) {
                const focusableElements = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        if (isOpen) {
            setTimeout(() => closeBtnRef.current?.focus(), 100);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || entries.length === 0) return null;

    return (
        <div 
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby="whats-new-title"
        >
            <div 
                ref={modalRef}
                className={`glass-panel w-full sm:max-w-lg flex flex-col shadow-2xl overflow-hidden border border-white/10
                    ${isMobile 
                        ? 'rounded-t-[40px] max-h-[90vh] animate-in slide-in-from-bottom-full duration-500' 
                        : 'rounded-[40px] max-h-[80vh] animate-in zoom-in-95 duration-300'}
                `}
            >
                {/* Header */}
                <div className="px-8 pt-10 pb-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-500/20 text-indigo-400 mb-6 animate-bounce">
                        <span className="material-symbols-rounded text-4xl">celebration</span>
                    </div>
                    <h2 id="whats-new-title" className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                        {t('whatsNew')}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        Vitreon Notes Elite v{APP_VERSION}
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-2 space-y-10">
                    {entries.map((entry) => {
                        const vKey = entry.version.replace(/\./g, '');
                        return (
                        <div key={entry.version} className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/60 bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">
                                    {t('version')} {entry.version}
                                </span>
                                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                            </div>
                            
                            <div className="grid gap-6">
                                {entry.highlights.map((h, i) => (
                                    <div key={i} className="flex gap-5 group">
                                        <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all duration-300">
                                            <span className="material-symbols-rounded text-2xl">{h.icon}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-400 transition-colors duration-300">
                                                {t(`h_${vKey}_${i+1}_title` as any)}
                                            </h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                                {t(`h_${vKey}_${i+1}_desc` as any)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-8 py-10">
                    <button 
                        ref={closeBtnRef}
                        onClick={onClose}
                        className="w-full py-5 rounded-[24px] bg-indigo-500 text-white font-black text-lg shadow-2xl shadow-indigo-500/40 hover:bg-indigo-400 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                    >
                        {t('gotIt')}
                    </button>
                </div>
            </div>
        </div>
    );
};
