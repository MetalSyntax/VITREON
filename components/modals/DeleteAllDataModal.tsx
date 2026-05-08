import React, { useState } from 'react';
import { useI18n } from '../../services/i18n';

interface DeleteAllDataModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const DeleteAllDataModal: React.FC<DeleteAllDataModalProps> = ({ isOpen, onConfirm, onCancel }) => {
    const { t } = useI18n();
    const [inputValue, setInputValue] = useState('');

    if (!isOpen) return null;

    const isValid = inputValue === 'DELETE';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="glass-panel w-full max-w-md p-8 rounded-[40px] shadow-2xl border border-red-500/20 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-3xl bg-red-500/20 text-red-500 flex items-center justify-center mb-6">
                    <span className="material-symbols-rounded text-3xl">warning</span>
                </div>
                
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">{t('destructiveAction')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    {t('destructiveWarning')}
                </p>

                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                        {t('confirmDeleteType').replace('{text}', 'DELETE')}
                    </p>
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="DELETE"
                        className="w-full bg-black/5 dark:bg-white/5 border-2 border-red-500/20 rounded-2xl py-4 px-6 text-center font-black text-red-500 placeholder:text-red-500/20 focus:border-red-500 outline-none transition-all uppercase"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <button 
                        onClick={onCancel}
                        className="py-4 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                    >
                        {t('cancel')}
                    </button>
                    <button 
                        disabled={!isValid}
                        onClick={onConfirm}
                        className={`py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95
                            ${isValid ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-slate-700 text-slate-500 opacity-50 cursor-not-allowed'}
                        `}
                    >
                        {t('delete').toUpperCase()}
                    </button>
                </div>
            </div>
        </div>
    );
};
