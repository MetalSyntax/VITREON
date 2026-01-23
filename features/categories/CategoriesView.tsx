import React, { useState, useEffect } from 'react';
import { Note, Category } from '../../types';
import { CategoryModal } from '../../components/modals/CategoryModal';

interface CategoriesViewProps {
    categories: Category[];
    notes: Note[];
    onCategoryClick: (category: Category) => void;
    onAddCategory: (cat: Partial<Category>) => void;
    onDeleteCategory: (id: string) => void;
}

const TIPS = [
    { title: "Pro Tip", text: "Tap and hold any category to reorganize or edit colors.", icon: "auto_awesome" },
    { title: "Smart Move", text: "Archive old notes to keep your dashboard clean and focused.", icon: "archive" },
    { title: "Quick Lock", text: "Use the lock icon in the editor to protect sensitive data with a PIN.", icon: "lock" },
    { title: "Search+", text: "Vitreon search also looks inside your tags and checklist items.", icon: "search" }
];

const CategoryCard: React.FC<{ category: Category; count: number; onClick: () => void; onDelete: (e: React.MouseEvent) => void }> = ({ category, count, onClick, onDelete }) => {
    const colorMap: Record<string, string> = {
        blue: 'from-blue-500/20 to-blue-600/5 text-blue-500 dark:text-blue-400 border-blue-500/20',
        emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-500 dark:text-emerald-400 border-emerald-500/20',
        amber: 'from-amber-500/20 to-amber-600/5 text-amber-500 dark:text-amber-400 border-amber-500/20',
        purple: 'from-purple-500/20 to-purple-600/5 text-purple-500 dark:text-purple-400 border-purple-500/20',
        rose: 'from-rose-500/20 to-rose-600/5 text-rose-500 dark:text-rose-400 border-rose-500/20',
        slate: 'from-slate-500/20 to-slate-600/5 text-slate-500 dark:text-slate-400 border-slate-500/20',
    };
    const styles = colorMap[category.color] || colorMap['slate'];

    return (
        <div onClick={onClick} className={`glass-card rounded-[32px] p-6 flex flex-col justify-between aspect-square cursor-pointer bg-gradient-to-br ${styles} relative group`}>
            <button 
                onClick={onDelete}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 dark:bg-white/5 text-slate-600 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500 hover:text-white"
            >
                <span className="material-symbols-rounded text-sm">close</span>
            </button>
            <div className="w-14 h-14 rounded-3xl bg-white/30 dark:bg-white/10 flex items-center justify-center shadow-inner">
                <span className="material-symbols-rounded text-2xl">{category.icon}</span>
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{category.name}</h3>
                <p className="text-sm font-semibold opacity-60">{count} Notes</p>
            </div>
        </div>
    );
};

export const CategoriesView: React.FC<CategoriesViewProps> = ({ categories, notes, onCategoryClick, onAddCategory, onDeleteCategory }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tipIndex, setTipIndex] = useState(0);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % TIPS.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const counts = notes.reduce((acc, note) => {
        acc[note.category] = (acc[note.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="p-6 h-full overflow-y-auto no-scrollbar pb-32">
            <div className="grid grid-cols-2 gap-5 mb-8">
                {categories.map(cat => (
                    <CategoryCard 
                        key={cat.id} category={cat} count={counts[cat.id] || 0} 
                        onClick={() => onCategoryClick(cat)} 
                        onDelete={(e) => { e.stopPropagation(); onDeleteCategory(cat.id); }}
                    />
                ))}
                
                {/* New Category Card */}
                <div 
                    onClick={() => setIsModalOpen(true)}
                    className="glass-card rounded-[32px] p-6 flex flex-col items-center justify-center aspect-square cursor-pointer border-dashed border-2 border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all group"
                >
                    <div className="w-14 h-14 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-rounded text-3xl">add</span>
                    </div>
                    <span className="mt-4 text-sm font-bold text-slate-500 dark:text-white uppercase tracking-widest opacity-80">New Category</span>
                </div>
            </div>

            {/* Pro Tip Banner */}
            <div 
                onClick={() => setTipIndex((tipIndex + 1) % TIPS.length)}
                className="glass-card rounded-[32px] p-6 flex items-center gap-5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
            >
                <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                    <span className="material-symbols-rounded text-white text-2xl animate-spin-slow" style={{ animationDuration: '4s' }}>{TIPS[tipIndex].icon}</span>
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-0.5">{TIPS[tipIndex].title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-tight">{TIPS[tipIndex].text}</p>
                </div>
            </div>

            <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={onAddCategory} />
        </div>
    );
};