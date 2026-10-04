import React, { useState, useMemo } from 'react';
import { X, Search, Star, Flame, Clock } from 'lucide-react';
import { MENU_CATEGORIES, MENU_ITEMS } from '../data/menuData';
import { CategoryKey, Dish } from '../types';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReserve: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose, onReserve }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('All');
  const [dietary, setDietary] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [query, setQuery] = useState('');

  const filteredDishes = useMemo(() => {
    return MENU_ITEMS.filter((dish) => {
      const matchCat = selectedCategory === 'All' || dish.category === selectedCategory;
      const matchDiet = dietary === 'all' || dish.type === dietary;
      const matchQ =
        dish.name.toLowerCase().includes(query.toLowerCase()) ||
        dish.description.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchDiet && matchQ;
    });
  }, [selectedCategory, dietary, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-full bg-[#1C120F] border-l border-[#2B1B15] flex flex-col shadow-2xl text-[#F4EBDD]">
        {/* Header */}
        <div className="p-6 border-b border-[#2B1B15] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#C6A36B] uppercase block">
              Namaste Kalyan
            </span>
            <h2 className="font-serif text-2xl text-[#F4EBDD]">Culinary Repertoire</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#2B1B15] text-[#F4EBDD]/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-6 border-b border-[#2B1B15] space-y-4 bg-[#160E0B]">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-sans tracking-wider whitespace-nowrap transition-colors ${
                  selectedCategory === cat.key
                    ? 'bg-[#C76A27] text-white font-medium'
                    : 'bg-[#2B1B15] text-[#F4EBDD]/70 hover:text-[#F4EBDD]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search + Dietary */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#2B1B15] text-[11px]">
              <button
                onClick={() => setDietary('all')}
                className={`px-3 py-1 rounded-full ${dietary === 'all' ? 'bg-[#C76A27] text-white' : 'text-[#F4EBDD]/60'}`}
              >
                All
              </button>
              <button
                onClick={() => setDietary('veg')}
                className={`px-3 py-1 rounded-full ${dietary === 'veg' ? 'bg-emerald-800 text-white' : 'text-[#F4EBDD]/60'}`}
              >
                Veg
              </button>
              <button
                onClick={() => setDietary('non-veg')}
                className={`px-3 py-1 rounded-full ${dietary === 'non-veg' ? 'bg-rose-900 text-white' : 'text-[#F4EBDD]/60'}`}
              >
                Non-Veg
              </button>
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#F4EBDD]/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dish..."
                className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#2B1B15] text-xs text-[#F4EBDD] placeholder-[#F4EBDD]/40 focus:outline-none border border-transparent focus:border-[#C76A27]"
              />
            </div>
          </div>
        </div>

        {/* Dish List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-[#2B1B15]/60">
          {filteredDishes.map((dish) => (
            <div key={dish.id} className="pt-4 first:pt-0 flex gap-4 items-start">
              <img
                src={dish.image}
                alt={dish.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0 bg-[#2B1B15]"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-serif text-base text-[#F4EBDD] truncate">{dish.name}</h4>
                  <span className="font-serif font-bold text-[#C76A27] shrink-0">₹{dish.price}</span>
                </div>
                <p className="text-xs text-[#F4EBDD]/60 line-clamp-2 mt-0.5 leading-relaxed font-light">
                  {dish.description}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-[#F4EBDD]/50 font-mono">
                  <span>{dish.prepTime}</span>
                  {dish.spiceLevel > 0 && <span className="text-[#C76A27]">{'🌶️'.repeat(dish.spiceLevel)}</span>}
                  <span className={dish.type === 'veg' ? 'text-emerald-400' : 'text-rose-400'}>
                    {dish.type === 'veg' ? 'Pure Veg' : 'Non-Veg'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2B1B15] flex items-center justify-between bg-[#160E0B]">
          <span className="text-xs text-[#F4EBDD]/60">{filteredDishes.length} dishes available</span>
          <button
            onClick={() => {
              onClose();
              onReserve();
            }}
            className="px-6 py-2 border border-[#C6A36B] hover:border-[#F4EBDD] bg-[#18100D] hover:bg-[#F4EBDD] hover:text-[#18100D] text-[#F4EBDD] text-xs font-sans font-medium uppercase tracking-[0.2em] transition-all cursor-pointer"
          >
            Reserve Table
          </button>
        </div>
      </div>
    </div>
  );
};
