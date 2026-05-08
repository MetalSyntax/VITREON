import React, { useState, useEffect } from 'react';
import { Note } from '../../types';
import { useI18n } from '../../services/i18n';

export type ResolutionAction = 'keep-local' | 'replace' | 'keep-both';

interface ConflictResolutionModalProps {
    isOpen: boolean;
    conflicts: { incoming: Note; local: Note }[];
    onResolve: (resolutions: Record<string, ResolutionAction>) => void;
    onCancel: () => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
    isOpen, conflicts, onResolve, onCancel
}) => {
    const { t } = useI18n();
    const [resolutions, setResolutions] = useState<Record<string, ResolutionAction>>({});

    useEffect(() => {
        if (isOpen) {
            setResolutions({});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isAllResolved = conflicts.every(c => resolutions[c.incoming.importId!]);

    const handleApplyToAll = (action: ResolutionAction) => {
        const next: Record<string, ResolutionAction> = {};
        conflicts.forEach(c => {
            next[c.incoming.importId!] = action;
        });
        setResolutions(next);
    };

    const getDiffSummary = (local: Note, incoming: Note) => {
        const localParas = local.content.split('\n').filter(Boolean).length;
        const incomingParas = incoming.content.split('\n').filter(Boolean).length;
        return t('diffSummary')
            .replace('{local}', String(localParas))
            .replace('{incoming}', String(incomingParas));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="glass-panel w-full max-w-2xl max-h-[85vh] flex flex-col rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                            <span className="material-symbols-rounded text-2xl">warning</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">
                                {t('conflictsDetected')}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {t('importConflictMessage')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions */}
                <div className="px-8 py-3 bg-white/5 flex items-center justify-between border-b border-white/5">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {t('applyToAll')}
                    </span>
                    <div className="flex gap-2">
                        <button onClick={() => handleApplyToAll('keep-local')} className="px-3 py-1.5 rounded-xl bg-slate-500/10 text-slate-400 text-[10px] font-bold uppercase hover:bg-slate-500/20 transition-all">
                            {t('keepLocal')}
                        </button>
                        <button onClick={() => handleApplyToAll('replace')} className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase hover:bg-indigo-500/20 transition-all">
                            {t('replaceImported')}
                        </button>
                        <button onClick={() => handleApplyToAll('keep-both')} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase hover:bg-emerald-500/20 transition-all">
                            {t('keepBoth')}
                        </button>
                    </div>
                </div>

                {/* Conflict List */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-4 space-y-4">
                    {conflicts.map((conflict, idx) => {
                        const id = conflict.incoming.importId!;
                        const resolution = resolutions[id];
                        return (
                            <div key={id} className="p-5 rounded-2xl bg-white/5 border border-white/5 animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-white">{conflict.incoming.title || t('untitled')}</h4>
                                        <p className="text-xs text-slate-500 mt-1">{getDiffSummary(conflict.local, conflict.incoming)}</p>
                                    </div>
                                    <div className="text-[10px] font-bold px-2 py-1 rounded-md bg-white/10 text-slate-400 uppercase tracking-tighter">
                                        Conflict #{idx + 1}
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <ResolutionButton 
                                        active={resolution === 'keep-local'} 
                                        onClick={() => setResolutions(prev => ({ ...prev, [id]: 'keep-local' }))}
                                        label={t('keepLocal')}
                                        color="slate"
                                    />
                                    <ResolutionButton 
                                        active={resolution === 'replace'} 
                                        onClick={() => setResolutions(prev => ({ ...prev, [id]: 'replace' }))}
                                        label={t('replaceImported')}
                                        color="indigo"
                                    />
                                    <ResolutionButton 
                                        active={resolution === 'keep-both'} 
                                        onClick={() => setResolutions(prev => ({ ...prev, [id]: 'keep-both' }))}
                                        label={t('keepBoth')}
                                        color="emerald"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-white/5 bg-white/5 flex gap-4">
                    <button 
                        onClick={onCancel}
                        className="flex-1 py-3.5 rounded-2xl text-slate-500 font-bold hover:text-slate-400 transition-colors"
                    >
                        {t('cancel')}
                    </button>
                    <button 
                        disabled={!isAllResolved}
                        onClick={() => onResolve(resolutions)}
                        className={`flex-1 py-3.5 rounded-2xl text-white font-bold transition-all shadow-xl active:scale-95
                            ${isAllResolved ? 'bg-indigo-500 shadow-indigo-500/25' : 'bg-slate-700 opacity-50 cursor-not-allowed'}
                        `}
                    >
                        {t('confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ResolutionButton: React.FC<{ active: boolean; onClick: () => void; label: string; color: string }> = ({ active, onClick, label, color }) => (
    <button
        onClick={onClick}
        className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border
            ${active 
                ? `bg-${color}-500 border-${color}-500 text-white shadow-lg shadow-${color}-500/20` 
                : `bg-white/5 border-transparent text-slate-500 hover:border-white/10 hover:text-slate-300`}
        `}
    >
        {label}
    </button>
);
