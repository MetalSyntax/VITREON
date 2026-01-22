import React from 'react';

interface ProfileViewProps {
    onBack: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onBack }) => {
    return (
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-32">
            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={onBack} className="w-11 h-11 rounded-2xl glass-panel flex items-center justify-center text-slate-300">
                        <span className="material-symbols-rounded">chevron_left</span>
                    </button>
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">User Profile</h2>
                    <div className="w-11 h-11 opacity-0"></div>
                </div>

                <div className="flex flex-col items-center mb-10">
                    <div className="relative group mb-6">
                        <div className="w-32 h-32 rounded-[40px] bg-gradient-to-tr from-indigo-500 to-purple-600 p-1">
                            <div className="w-full h-full rounded-[38px] bg-[#030712] flex items-center justify-center overflow-hidden">
                                <span className="material-symbols-rounded text-6xl text-slate-400">account_circle</span>
                            </div>
                        </div>
                        <button className="absolute bottom-0 right-0 w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg border-4 border-[#030712] hover:scale-110 transition-transform">
                            <span className="material-symbols-rounded text-lg">edit</span>
                        </button>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">Vitreon User</h1>
                    <p className="text-slate-500 font-medium">vitreon.notes@example.com</p>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-2">Account Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-panel rounded-3xl p-5 bg-white/5 border-white/5">
                            <span className="material-symbols-rounded text-indigo-400 mb-2">description</span>
                            <div className="text-2xl font-bold text-white">24</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Notes</div>
                        </div>
                        <div className="glass-panel rounded-3xl p-5 bg-white/5 border-white/5">
                            <span className="material-symbols-rounded text-purple-400 mb-2">folder</span>
                            <div className="text-2xl font-bold text-white">6</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Collections</div>
                        </div>
                    </div>

                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 px-2 pt-4">General Settings</h3>
                    <div className="glass-panel rounded-[32px] overflow-hidden bg-white/5 border-white/5">
                        <button className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                                    <span className="material-symbols-rounded text-lg">person</span>
                                </div>
                                <span className="font-bold text-white">Edit Profile</span>
                            </div>
                            <span className="material-symbols-rounded text-slate-600">chevron_right</span>
                        </button>
                        <button className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                                    <span className="material-symbols-rounded text-lg">security</span>
                                </div>
                                <span className="font-bold text-white">Security & Privacy</span>
                            </div>
                            <span className="material-symbols-rounded text-slate-600">chevron_right</span>
                        </button>
                        <button className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                                    <span className="material-symbols-rounded text-lg">logout</span>
                                </div>
                                <span className="font-bold text-red-400">Sign Out</span>
                            </div>
                            <span className="material-symbols-rounded text-slate-600">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
