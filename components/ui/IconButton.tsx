import React from 'react';

interface IconButtonProps {
    icon: string;
    onClick: () => void;
    className?: string;
    title?: string;
    active?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, onClick, className = '', title = '', active = false }) => (
    <button
        onClick={onClick}
        title={title}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 
        ${active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'}
        ${className}`}
    >
        <span className="material-symbols-rounded text-xl">{icon}</span>
    </button>
);