import React, { useState } from 'react';
import { useI18n, Language } from '../../services/i18n';

interface ProfileViewProps {
    notesCount: number;
    categoriesCount: number;
    onBack: () => void;
    masterPin: string | null;
    isBiometricsEnabled: boolean;
    onSetMasterPin: () => void;
    onToggleBiometrics: () => void;
    profileImage: string | null;
    onUpdateProfileImage: (img: string) => void;
    userName: string;
    userEmail: string;
    userBio: string;
    onUpdateProfile: (name: string, email: string, bio: string) => void;
    onViewTrash: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
    notesCount, categoriesCount, onBack, masterPin, isBiometricsEnabled, onSetMasterPin, onToggleBiometrics,
    profileImage, onUpdateProfileImage, userName: initialUserName, userEmail: initialUserEmail, userBio: initialUserBio,
    onUpdateProfile, onViewTrash
}) => {
    const { t } = useI18n();
    const [activeSection, setActiveSection] = useState<'main' | 'edit' | 'security'>('main');
    const [userName, setUserName] = useState(initialUserName);
    const [userEmail, setUserEmail] = useState(initialUserEmail);
    const [userBio, setUserBio] = useState(initialUserBio);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                onUpdateProfileImage(event.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    if (activeSection === 'edit') {
        return (
            <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-32 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-10">
                        <button onClick={() => setActiveSection('main')} className="w-11 h-11 rounded-2xl glass-panel flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors">
                            <span className="material-symbols-rounded">chevron_left</span>
                        </button>
                        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{t('editProfile')}</h2>
                        <div className="w-11 h-11 opacity-0"></div>
                    </div>
                    
                    <div className="flex flex-col items-center mb-10 animate-smooth-in">
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-[36px] bg-gradient-to-tr from-indigo-500 to-purple-600 p-1 shadow-xl shadow-indigo-500/20">
                                <div className="w-full h-full rounded-[34px] bg-[var(--bg-app)] flex items-center justify-center overflow-hidden">
                                     {profileImage ? (
                                         <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                     ) : (
                                         <span className="material-symbols-rounded text-5xl text-slate-300 dark:text-slate-700">account_circle</span>
                                     )}
                                </div>
                            </div>
                            <button 
                                onClick={() => document.getElementById('profile-upload-edit')?.click()}
                                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg border-4 border-white dark:border-[#030712] hover:scale-110 transition-transform"
                            >
                                <span className="material-symbols-rounded text-lg font-bold">photo_camera</span>
                            </button>
                            <input type="file" id="profile-upload-edit" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="group  stagger-1">
                            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1 group-focus-within:text-indigo-500 transition-colors">{t('fullName')}</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-xl group-focus-within:text-indigo-500 transition-colors">person</span>
                                <input 
                                    type="text" 
                                    className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-[24px] pl-14 pr-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-slate-700 dark:text-white font-bold" 
                                    value={userName} 
                                    placeholder={t('namePlaceholder')}
                                    onChange={(e) => setUserName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="group  stagger-2">
                            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1 group-focus-within:text-indigo-500 transition-colors">{t('email')}</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400 text-xl group-focus-within:text-indigo-500 transition-colors">alternate_email</span>
                                <input 
                                    type="email" 
                                    className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-[24px] pl-14 pr-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-slate-700 dark:text-white font-bold" 
                                    value={userEmail} 
                                    placeholder={t('emailPlaceholder')}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="group  stagger-3">
                            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1 group-focus-within:text-indigo-500 transition-colors">{t('bio')}</label>
                            <div className="relative">
                                <span className="absolute left-5 top-6 material-symbols-rounded text-slate-400 text-xl group-focus-within:text-indigo-500 transition-colors">edit_note</span>
                                <textarea 
                                    className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-[24px] pl-14 pr-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-slate-700 dark:text-white font-medium resize-none h-32" 
                                    value={userBio} 
                                    placeholder={t('bioPlaceholder')}
                                    onChange={(e) => setUserBio(e.target.value)}
                                />
                            </div>
                        </div>

                        <button onClick={() => { onUpdateProfile(userName, userEmail, userBio); setActiveSection('main'); }} className="w-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-black py-5 rounded-[24px] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all text-sm uppercase tracking-widest mt-4  stagger-4">
                            {t('updateProfile')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (activeSection === 'security') {
        return (
            <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-32 p-6">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => setActiveSection('main')} className="w-11 h-11 rounded-2xl glass-panel flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors">
                        <span className="material-symbols-rounded">chevron_left</span>
                    </button>
                    <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('security')}</h2>
                    <div className="w-11 h-11 opacity-0"></div>
                </div>

                <div className="space-y-4">
                    <div className="glass-panel rounded-[32px] p-6 hover:border-indigo-500/30 transition-all group">
                        <h4 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                            <span className="material-symbols-rounded text-indigo-500">password</span>
                            {t('masterPin')}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">{t('pinDesc')}</p>
                        <button onClick={onSetMasterPin} className="w-full py-4 rounded-2xl bg-black/5 dark:bg-white/5 text-xs font-black text-indigo-500 uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all">
                            {masterPin ? t('changePin') : t('setMasterPin')}
                        </button>
                    </div>
                    
                    <div className="glass-panel rounded-[32px] p-6 hover:border-indigo-500/30 transition-all group">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-rounded text-green-500">fingerprint</span>
                                {t('biometricLock')}
                            </h4>
                            <div 
                                onClick={onToggleBiometrics}
                                className={`w-12 h-7 rounded-full relative p-1 cursor-pointer transition-colors duration-300 ${isBiometricsEnabled ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/10'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${isBiometricsEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">{t('biometricDesc')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-32 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={onBack} className="w-11 h-11 rounded-2xl glass-panel flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-all">
                        <span className="material-symbols-rounded">chevron_left</span>
                    </button>
                    <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{t('profile')}</h2>
                    <div className="w-11 h-11 opacity-0"></div>
                </div>

                <div className="flex flex-col items-center mb-10 animate-smooth-in">
                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-[44px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 p-1 shadow-2xl shadow-indigo-500/20 animate-float">
                            <div className="w-full h-full rounded-[42px] bg-white dark:bg-[#030712] flex items-center justify-center overflow-hidden">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-rounded text-6xl text-slate-300 dark:text-slate-700">account_circle</span>
                                )}
                            </div>
                        </div>
                        <button onClick={() => setActiveSection('edit')} className="absolute bottom-0 -right-2 w-11 h-11 rounded-2xl bg-white dark:bg-[#1e293b] text-indigo-500 flex items-center justify-center shadow-lg border border-indigo-500/10 hover:scale-110 active:scale-95 transition-all">
                            <span className="material-symbols-rounded text-[20px] font-bold">edit</span>
                        </button>
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white mb-1 tracking-tight">{initialUserName}</h1>
                    <p className="text-indigo-500 dark:text-indigo-400 font-bold text-sm">{initialUserEmail}</p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-3 max-w-[200px] text-center font-medium leading-relaxed">{initialUserBio}</p>
                </div>

                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 px-2 pt-2  stagger-1">{t('analytics')}</h3>
                    <div className="grid grid-cols-2 gap-4  stagger-1">
                        <div className="glass-panel rounded-[32px] p-6">
                            <div className="text-2xl font-black text-slate-800 dark:text-white mb-1">{notesCount}</div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('savedNotes')}</div>
                        </div>
                        <div className="glass-panel rounded-[32px] p-6">
                            <div className="text-2xl font-black text-slate-800 dark:text-white mb-1">{categoriesCount}</div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('categories')}</div>
                        </div>
                    </div>

                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 px-2 pt-2  stagger-2">{t('accountSettings')}</h3>
                    <div className="glass-panel rounded-[36px] overflow-hidden  stagger-2">
                        <button onClick={() => setActiveSection('edit')} className="w-full flex items-center justify-between p-6 hover:bg-indigo-500/5 transition-all border-b border-black/5 dark:border-white/5 group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-rounded text-xl">person</span>
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-slate-700 dark:text-white text-sm">{t('personalInfo')}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{t('nameEmailBio')}</div>
                                </div>
                            </div>
                            <span className="material-symbols-rounded text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </button>
                        <button onClick={() => setActiveSection('security')} className="w-full flex items-center justify-between p-6 hover:bg-purple-500/5 transition-all group border-b border-black/5 dark:border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-rounded text-xl">security</span>
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-slate-700 dark:text-white text-sm">{t('security')}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{t('pinBiometrics')}</div>
                                </div>
                            </div>
                            <span className="material-symbols-rounded text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </button>
                        <button onClick={onViewTrash} className="w-full flex items-center justify-between p-6 hover:bg-slate-500/5 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-500/10 text-slate-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-rounded text-xl">delete</span>
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-slate-700 dark:text-white text-sm">{t('trash')}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{t('trashMessage')}</div>
                                </div>
                            </div>
                            <span className="material-symbols-rounded text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
