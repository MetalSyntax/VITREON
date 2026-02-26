import React, { useState, useEffect } from 'react';
import { Note, Category } from '../../types';
import { CategoryModal } from '../../components/modals/CategoryModal';
import { useI18n } from '../../services/i18n';

interface CategoriesViewProps {
    categories: Category[];
    notes: Note[];
    onCategoryClick: (category: Category) => void;
    onAddCategory: (cat: Category) => void;
    onDeleteCategory: (id: string) => void;
}

// Tips keys mapping
const TIP_KEYS = [
    { title: "proTip", text: "tip1Text", icon: "auto_awesome" },
    { title: "smartMove", text: "tip2Text", icon: "archive" },
    { title: "quickLock", text: "tip3Text", icon: "lock" },
    { title: "searchPlus", text: "tip4Text", icon: "search" }
] as const;

const CategoryCard: React.FC<{ category: Category; count: number; onClick: () => void; onDelete: (e: React.MouseEvent) => void; onEdit: (e: React.MouseEvent) => void }> = ({ category, count, onClick, onDelete, onEdit }) => {
    const { t, getCategoryName } = useI18n();
    const styles = `from-${category.color}-500/20 to-${category.color}-600/5 text-${category.color}-500 dark:text-${category.color}-400 border-${category.color}-500/20`;

    return (
        <div onClick={onClick} className={`glass-card rounded-[32px] p-6 flex flex-col justify-between aspect-square cursor-pointer bg-gradient-to-br ${styles} relative group`}>
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={onEdit}
                    className="w-8 h-8 rounded-full bg-white/20 dark:bg-white/5 text-slate-600 dark:text-white flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-500 transition-colors"
                >
                    <span className="material-symbols-rounded text-sm">edit</span>
                </button>
                <button 
                    onClick={onDelete}
                    className="w-8 h-8 rounded-full bg-white/20 dark:bg-white/5 text-slate-600 dark:text-white flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                >
                    <span className="material-symbols-rounded text-sm">close</span>
                </button>
            </div>
            <div className="w-14 h-14 rounded-3xl bg-white/30 dark:bg-white/10 flex items-center justify-center shadow-inner mt-2">
                <span className="material-symbols-rounded text-2xl">{category.icon}</span>
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{getCategoryName(category.id, category.name)}</h3>
                <p className="text-sm font-semibold opacity-60">{count} {t('notesCount')}</p>
            </div>
        </div>
    );
};

export const CategoriesView: React.FC<CategoriesViewProps> = ({ categories, notes, onCategoryClick, onAddCategory, onDeleteCategory }) => {
    const { t } = useI18n();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [tipIndex, setTipIndex] = useState(0);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % TIP_KEYS.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    const counts = notes.reduce((acc, note) => {
        if (!note.deletedAt) {
            acc[note.category] = (acc[note.category] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="p-6 h-full overflow-y-auto no-scrollbar pb-32 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mb-8  stagger-1">
                {categories.map((cat, idx) => (
                    <div key={cat.id} className={`animate-fade-in`} style={{ animationDelay: `${(idx + 1) * 100}ms` }}>
                        <CategoryCard 
                            category={cat} count={counts[cat.id] || 0} 
                            onClick={() => onCategoryClick(cat)} 
                            onDelete={(e) => { e.stopPropagation(); onDeleteCategory(cat.id); }}
                            onEdit={(e) => { e.stopPropagation(); setEditingCategory(cat); setIsModalOpen(true); }}
                        />
                    </div>
                ))}
                
                {/* New Category Card */}
                <div 
                    onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
                    className="glass-card rounded-[32px] p-6 flex flex-col items-center justify-center aspect-square cursor-pointer border-dashed border-2 border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all group animate-smooth-fade"
                    style={{ animationDelay: `${(categories.length + 1) * 100}ms` }}
                >
                    <div className="w-14 h-14 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-rounded text-3xl">add</span>
                    </div>
                    <span className="mt-4 text-sm font-bold text-slate-500 dark:text-white uppercase tracking-widest opacity-80">{t('newCategory')}</span>
                </div>
            </div>

            {/* Pro Tip Banner */}
            <div 
                onClick={() => setTipIndex((tipIndex + 1) % TIP_KEYS.length)}
                className="glass-card rounded-[32px] p-6 flex items-center gap-5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all  stagger-2"
            >
                <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                    <span className="material-symbols-rounded text-white text-2xl animate-spin-slow" style={{ animationDuration: '4s' }}>{TIP_KEYS[tipIndex].icon}</span>
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-0.5">{t(TIP_KEYS[tipIndex].title as any)}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-tight">{t(TIP_KEYS[tipIndex].text as any)}</p>
                </div>
            </div>

            <CategoryModal 
                isOpen={isModalOpen} 
                onClose={() => { setIsModalOpen(false); setEditingCategory(null); }} 
                onSave={(cat) => { onAddCategory(cat); setIsModalOpen(false); setEditingCategory(null); }} 
                initialCategory={editingCategory}
            />
        </div>
    );
};