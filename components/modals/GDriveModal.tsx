import React from 'react';
import { useI18n } from '../../services/i18n';

interface GDriveModalProps {
    isOpen: boolean;
    files: any[];
    onClose: () => void;
    onSelect: (fileId: string) => void;
}

export const GDriveModal: React.FC<GDriveModalProps> = ({ isOpen, files, onClose, onSelect }) => {
    const { t } = useI18n();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-sm glass-panel bg-white/95 dark:bg-[#1e293b]/95 rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300 pointer-events-auto flex flex-col max-h-[80vh]">
                <div className="flex items-center gap-4 mb-6 shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <span className="material-symbols-rounded">cloud_download</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">{"Select Backup"}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{"Choose a file to restore from Drive"}</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto w-full no-scrollbar space-y-3">
                    {files.map((file) => (
                        <button
                            key={file.id}
                            onClick={() => onSelect(file.id)}
                            className="w-full text-left p-4 rounded-2xl border-2 border-black/5 dark:border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                        >
                            <div className="font-bold text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors">
                                {file.name}
                            </div>
                            <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                {file.createdTime ? new Date(file.createdTime).toLocaleString() : 'Backup'}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-6 flex gap-3 shrink-0">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-xl font-bold text-sm tracking-wide text-slate-500 glass-panel hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        {t('cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};
