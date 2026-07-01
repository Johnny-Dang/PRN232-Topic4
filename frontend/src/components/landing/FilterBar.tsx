'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface FilterBarProps {
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function FilterBar({
  selectedFilter,
  setSelectedFilter,
  searchQuery,
  setSearchQuery,
}: FilterBarProps) {
  const chips = [
    { id: 'all', label: 'Tất cả' },
    { id: 'open', label: 'Đang mở đăng ký' },
    { id: 'expiring', label: 'Sắp hết hạn' },
    { id: 'upcoming', label: 'Sắp diễn ra' },
    { id: 'online', label: 'Online' },
    { id: 'offline', label: 'Offline' },
    { id: 'free', label: 'Miễn phí' },
    { id: 'prized', label: 'Có giải thưởng' }
  ];

  return (
    <section className="bg-white border-y border-slate-200 dark:bg-slate-900/40 dark:border-slate-800/80 py-6 sticky top-16 z-30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Main filter chips */}
        <div className="w-full md:w-auto overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-2 pb-2 md:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 shrink-0">Lọc nhanh:</span>
          {chips.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setSelectedFilter(chip.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border shrink-0 cursor-pointer transition-all duration-200 ${selectedFilter === chip.id
                ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
                : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 dark:bg-slate-850 dark:text-slate-350 dark:border-slate-800 dark:hover:bg-slate-800'
                }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Quick Input Search filter (syncs with query state) */}
        <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-2 focus-within:border-indigo-500 transition-colors">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Gõ từ khóa lọc danh sách..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs border-0 outline-none w-full placeholder:text-slate-400 text-slate-800 dark:text-slate-200"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-655 text-xs font-bold bg-transparent border-none cursor-pointer">X</button>
          )}
        </div>

      </div>
    </section>
  );
}
