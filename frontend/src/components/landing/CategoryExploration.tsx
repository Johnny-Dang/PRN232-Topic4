'use client';

import React from 'react';
import { 
  Compass, 
  Cpu, 
  Palette, 
  GraduationCap, 
  Rocket, 
  Globe, 
  Beaker, 
  Leaf, 
  MessageSquare, 
  Heart, 
  Paintbrush,
  type LucideIcon
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface CategoryExplorationProps {
  setSelectedCategory: (category: string) => void;
  scrollToSection: (ref: React.RefObject<HTMLDivElement | null>) => void;
  competitionsSectionRef: React.RefObject<HTMLDivElement | null>;
}

export default function CategoryExploration({
  setSelectedCategory,
  scrollToSection,
  competitionsSectionRef,
}: CategoryExplorationProps) {

  const categoryMeta: Record<string, { icon: LucideIcon; color: string; bg: string; label: string; count: number; desc: string }> = {
    Technology: { icon: Cpu, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/20', label: 'Công nghệ', count: 12, desc: 'Lập trình, AI, Blockchain, Website' },
    Design: { icon: Palette, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/20', label: 'Thiết kế', count: 8, desc: 'Thiết kế UI/UX, Đồ họa, Poster' },
    Academic: { icon: GraduationCap, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20', label: 'Học thuật', count: 15, desc: 'Olympic Toán, Tin, Nghiên cứu lý thuyết' },
    Startup: { icon: Rocket, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20', label: 'Khởi nghiệp', count: 6, desc: 'Ý tưởng khởi nghiệp, Mô hình Agile' },
    Language: { icon: Globe, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20', label: 'Ngoại ngữ', count: 9, desc: 'Hùng biện tiếng Anh, Tranh biện quốc tế' },
    Science: { icon: Beaker, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/20', label: 'Khoa học', count: 7, desc: 'Khoa học tự nhiên, Thực nghiệm' },
    Environment: { icon: Leaf, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/20', label: 'Môi trường', count: 5, desc: 'Dự án xanh, Phát triển bền vững' },
    SoftSkills: { icon: MessageSquare, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/20', label: 'Kỹ năng mềm', count: 10, desc: 'Giao tiếp, Làm việc nhóm, Lãnh đạo' },
    Volunteer: { icon: Heart, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20', label: 'Tình nguyện', count: 11, desc: 'Công tác xã hội, Hỗ trợ cộng đồng' },
    Art: { icon: Paintbrush, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/20', label: 'Nghệ thuật', count: 4, desc: 'Âm nhạc, Hội họa, Nhiếp ảnh' },
  };

  const handleCategoryClick = (catKey: string) => {
    setSelectedCategory(catKey);
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
          Dễ dàng tìm thấy các cuộc thi thuộc sở trường của bạn qua 10 nhóm lĩnh vực tuyển chọn.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(categoryMeta).map(([key, data]) => {
          const IconComp = data.icon;
          return (
            <Card
              key={key}
              onClick={() => handleCategoryClick(key)}
              className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl cursor-pointer hover:shadow-md hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300 group"
            >
              <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${data.bg}`}>
                  <IconComp className={`w-6 h-6 ${data.color}`} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">
                    {data.label}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-0.5">
                    {data.count} cuộc thi
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-2 leading-relaxed font-semibold">
                    {data.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
