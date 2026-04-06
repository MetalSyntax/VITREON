import React, { useState } from 'react';
import { Category } from '../../types';
import { useI18n } from '../../services/i18n';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (cat: Category) => void;
    initialCategory?: Category | null;
}

const COLORS = [
    'blue', 'emerald', 'amber', 'purple', 'rose', 'slate', 
    'cyan', 'orange', 'pink', 'lime', 'indigo', 'violet', 'fuchsia', 'teal', 'red', 'yellow'
];
const ICONS = [
    'work', 'person', 'lightbulb', 'flight', 'fitness_center', 'description', 
    'shopping_cart', 'favorite', 'home', 'star', 'school', 'restaurant', 
    'payments', 'medical_services', 'directions_car', 'celebration', 'palette', 
    'menu_book', 'pets', 'camera_alt', 'eco', 'savings', 'translate', 'code', 
    'smart_toy', 'sports_esports', 'theater_comedy', 'monitoring', 'history_edu', 
    'construction', 'volunteer_activism', 'rocket_launch', 'terminal',
    'vpn_key', 'shield', 'lock', 'search', 'notifications', 'settings',
    'cloud', 'folder', 'attach_file', 'mail', 'inventory_2', 'archive',
    'shopping_bag', 'storefront', 'coffee', 'local_bar', 'lunch_dining',
    'self_improvement', 'directions_run', 'pool', 'sports_basketball',
    'music_note', 'movie', 'tv', 'radio', 'headphones', 'videogame_asset',
    'photo_camera', 'camera_roll', 'auto_stories', 'extension', 'map',
    'explore', 'public', 'language', 'account_balance_wallet', 'receipt_long'
];

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, initialCategory }) => {
    const { t } = useI18n();
    const [name, setName] = useState('');
    const [color, setColor] = useState('blue');
    const [icon, setIcon] = useState('description');

    React.useEffect(() => {
        if (isOpen) {
            if (initialCategory) {
                // Determine if name is a translation key (common pattern) or literal string
                const localizedName = t(initialCategory.id as any);
                setName(localizedName && localizedName !== initialCategory.id ? localizedName : initialCategory.name);
                setColor(initialCategory.color);
                setIcon(initialCategory.icon);
            } else {
                setName('');
                setColor('blue');
                setIcon('description');
            }
        }
    }, [isOpen, initialCategory, t]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({
            id: initialCategory ? initialCategory.id : name.toLowerCase().replace(/\s+/g, '-'),
            name,
            color,
            icon
        });
        setName('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="glass-card w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{initialCategory ? t('edit' as any) : t('newCategory')}</h3>
                
                <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t('name')}</label>
                    <input 
                        type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder={t('categoryPlaceholder')}
                        className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-white"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t('color')}</label>
                    <div className="flex flex-wrap gap-2">
                        {COLORS.map(c => (
                            <button 
                                key={c} onClick={() => setColor(c)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-indigo-500 scale-110 shadow-lg' : 'border-transparent'}`}
                                style={{ backgroundColor: `var(--tw-color-${c}-500, #3b82f6)` }} // Rough fallback
                            >
                                <div className={`w-full h-full rounded-full bg-${c}-500`}></div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{t('icon')}</label>
                    <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                        {ICONS.map(i => (
                            <button 
                                key={i} onClick={() => setIcon(i)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 ${icon === i ? 'bg-indigo-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                            >
                                <span className="material-symbols-rounded text-xl">{i}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold transition-colors">{t('cancel')}</button>
                    <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-transform active:scale-95">{initialCategory ? t('save' as any) : t('create')}</button>
                </div>
            </div>
        </div>
    );
};
