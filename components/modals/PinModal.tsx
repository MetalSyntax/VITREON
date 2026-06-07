import React, { useState, useEffect } from 'react';
import { useI18n } from '../../services/i18n';

interface PinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUnlock: (pin: string) => void;
    isSettingPin?: boolean;
}

export const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onUnlock, isSettingPin = false }) => {
    const { t } = useI18n();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if(isOpen) { setPin(''); setError(''); }
    }, [isOpen]);

    const handleNum = (num: string) => {
        if (pin.length < 4) setPin(prev => prev + num);
    };

    const handleBackspace = () => setPin(prev => prev.slice(0, -1));

    const handleSubmit = () => {
        if (pin.length !== 4) {
            setError(t('pinMustBe4'));
            return;
        }
        onUnlock(pin);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-[var(--bg-app)] w-full max-w-xs rounded-3xl p-6 shadow-2xl border border-white/10">
                <h3 className="text-center font-bold text-xl mb-2 text-slate-800 dark:text-white">
                    {isSettingPin ? t('secureAccess') : t('enterPin')}
                </h3>
                <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-6">
                    {isSettingPin ? t('protectPrivacy') : t('resourceLocked')}
                </p>

                <div className="flex justify-center gap-4 mb-8">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${pin.length > i ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}></div>
                    ))}
                </div>

                {error && <p className="text-red-500 text-center text-sm mb-4 animate-pulse">{error}</p>}

                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button key={num} onClick={() => handleNum(num.toString())} className="h-14 rounded-full bg-slate-400/10 dark:bg-slate-700/50 hover:bg-slate-400/20 dark:hover:bg-slate-600/50 text-xl font-bold text-slate-700 dark:text-white transition-colors">
                            {num}
                        </button>
                    ))}
                    <button onClick={onClose} className="h-14 flex items-center justify-center text-slate-500 font-medium">{t('cancel')}</button>
                    <button onClick={() => handleNum('0')} className="h-14 rounded-full bg-slate-400/10 dark:bg-slate-700/50 hover:bg-slate-400/20 dark:hover:bg-slate-600/50 text-xl font-bold text-slate-700 dark:text-white">0</button>
                    <button onClick={handleBackspace} className="h-14 flex items-center justify-center text-slate-500 hover:text-red-400">
                        <span className="material-symbols-rounded">backspace</span>
                    </button>
                </div>
                
                <button onClick={handleSubmit} className="w-full py-3 bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 active:scale-95 transition-transform">
                    {isSettingPin ? t('confirm') : t('access')}
                </button>
            </div>
        </div>
    );
};