'use client';

import React from 'react';
import {
  Beaker,
  Compass,
  Cpu,
  Globe,
  GraduationCap,
  Heart,
  Leaf,
  MessageSquare,
  Paintbrush,
  Palette,
  Rocket,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Category } from '@/lib/api';

interface CategoryExplorationProps {
  categories: Category[];
  categoryCounts: Record<string, number>;
  loading: boolean;
  setSelectedCategory: (category: string) => void;
  scrollToSection: (ref: React.RefObject<HTMLDivElement | null>) => void;
  competitionsSectionRef: React.RefObject<HTMLDivElement | null>;
}

type CategoryVisual = {
  icon: LucideIcon;
  color: string;
  bg: string;
};

const categoryVisuals: CategoryVisual[] = [
  { icon: Cpu, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
  { icon: Palette, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/20' },
  { icon: GraduationCap, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  { icon: Rocket, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  { icon: Globe, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  { icon: Beaker, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/20' },
  { icon: Leaf, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/20' },
  { icon: MessageSquare, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/20' },
  { icon: Heart, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20' },
  { icon: Paintbrush, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/20' },
];

const getCategoryVisual = (index: number): CategoryVisual => categoryVisuals[index % categoryVisuals.length];

export default function CategoryExploration({
  categories,
  categoryCounts,
  loading,
  setSelectedCategory,
  scrollToSection,
  competitionsSectionRef,
}: CategoryExplorationProps) {
  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    scrollToSection(competitionsSectionRef);
  };

  return (
    <section className="space-y-8">
      <div className="space-y-1 border-b border-slate-200 pb-5 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <Compass className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xl font-black text-slate-850 dark:text-white">
            Khám Phá Theo Lĩnh Vực (Category Compass)
          </h3>
        </div>
        <p className="text-slate-500 text-xs font-medium">
          Dữ liệu lĩnh vực được lấy trực tiếp từ backend Category API.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card
              key={index}
              className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl"
            >
              <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="w-full space-y-2">
                  <div className="h-3 w-24 mx-auto rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  <div className="h-2 w-16 mx-auto rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  <div className="h-2 w-32 mx-auto rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Chưa có Category từ API.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((category, index) => {
            const visual = getCategoryVisual(index);
            const IconComp = visual.icon;
            const count = categoryCounts[category.CategoryID] ?? 0;

            return (
              <Card
                key={category.CategoryID}
                onClick={() => handleCategoryClick(category.CategoryID)}
                className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl cursor-pointer hover:shadow-md hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300 group"
              >
                <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${visual.bg}`}>
                    <IconComp className={`w-6 h-6 ${visual.color}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">
                      {category.CategoryName}
                    </h4>
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-0.5">
                      {count} cuộc thi
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-2 leading-relaxed font-semibold">
                      {category.Description || 'Chưa có mô tả từ API.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
