import React, { useState } from 'react';
import { Category, Note } from '../../types';
import { CategoryModal } from '../../components/modals/CategoryModal';

interface CategoriesViewProps {
    categories: Category[];
    notes: Note[];
    onCategoryClick: (cat: Category) => void;
    onAddCategory: (cat: Category) => void;
    onDeleteCategory: (id: string) => void;
}

const CategoryCard: React.FC<{ category: Category; count: number; onClick: () => void; onDelete: (e: React.MouseEvent) => void }> = ({ category, count, onClick, onDelete }) => {
    const colorMap: Record<string, string> = {
        blue: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20',
        emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
        amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20',
        purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20',
        rose: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/20',
        slate: 'from-slate-500/20 to-slate-600/5 text-slate-400 border-slate-500/20',
    };
    const styles = colorMap[category.color] || colorMap['slate'];

    return (
        <div onClick={onClick} className={`glass-card rounded-[32px] p-6 flex flex-col justify-between aspect-square cursor-pointer bg-gradient-to-br ${styles} relative group`}>
            <button 
                onClick={onDelete}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500 hover:text-white"
            >
                <span className="material-symbols-rounded text-sm">close</span>
            </button>
            <div className="w-14 h-14 rounded-3xl bg-white/10 flex items-center justify-center shadow-inner">
                <span className="material-symbols-rounded text-2xl">{category.icon}</span>
            </div>
            <div>
                <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                <p className="text-sm font-semibold opacity-60">{count} Notes</p>
            </div>
        </div>
    );
};

export const CategoriesView: React.FC<CategoriesViewProps> = ({ categories, notes, onCategoryClick, onAddCategory, onDeleteCategory }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
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
                    className="glass-card rounded-[32px] p-6 flex flex-col items-center justify-center aspect-square cursor-pointer border-dashed border-2 border-white/20 bg-white/5 hover:bg-white/10 transition-all group"
                >
                    <div className="w-14 h-14 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-rounded text-3xl">add</span>
                    </div>
                    <span className="mt-4 text-sm font-bold text-white uppercase tracking-widest opacity-80">New Category</span>
                </div>
            </div>

            {/* Pro Tip Banner */}
            <div className="glass-card rounded-[32px] p-6 flex items-center gap-5 bg-gradient-to-r from-indigo-500/20 to-purple-500/10 border-indigo-500/20">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <span className="material-symbols-rounded text-white text-2xl">auto_awesome</span>
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-white mb-0.5">Pro Tip</h4>
                    <p className="text-sm text-slate-400 font-medium leading-tight">Tap and hold any category to reorganize or edit colors.</p>
                </div>
            </div>

            <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={onAddCategory} />
        </div>
    );
};