'use client';

import React from 'react';
import { AlarmClock, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { DetailedCompetition } from '@/lib/api';

interface DeadlineFocusProps {
  deadlineCompetitions: DetailedCompetition[];
  loading: boolean;
  handleAction: (title: string, message: string) => void;
  onViewDetails: (comp: DetailedCompetition) => void;
}

export default function DeadlineFocus({
  deadlineCompetitions,
  loading,
  handleAction,
  onViewDetails,
}: DeadlineFocusProps) {
  // Take top 3 closest to deadline
  const displayItems = deadlineCompetitions.slice(0, 3);

  if (!loading && displayItems.length === 0) return null;

  return (
    <section className="space-y-8">
      <div className="space-y-1 border-b border-slate-200 pb-5 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <AlarmClock className="w-6 h-6 text-amber-500 animate-swing" />
          <h3 className="text-xl font-black text-slate-855 dark:text-white">
            Tiêu Điểm Hạn Chót (Deadline Focus)
          </h3>
        </div>
        <p className="text-slate-500 text-xs font-medium">
          Đăng ký gấp! Thời hạn còn lại tính bằng ngày cho các đội thi hoàn tất thủ tục ghi danh.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <Skeleton className="h-48 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayItems.map((comp) => (
            <Card
              key={`dl-${comp.ID}`}
              className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 p-5 rounded-2xl relative shadow-xl overflow-hidden group hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Expiring tag highlight banner */}
              <div className="absolute right-0 top-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[8.5px] font-black px-3.5 py-1.2 rounded-bl-xl tracking-wider uppercase z-10 flex items-center gap-1 shadow-md shadow-amber-950/40">
                <Clock className="w-3 h-3" /> {comp.DaysLeft <= 0 ? 'NGÀY CUỐI' : `CÒN ${comp.DaysLeft} NGÀY`}
              </div>

              <CardHeader className="p-0 pb-4 border-b border-white/5 space-y-2">
                <Badge className="bg-amber-500/20 text-amber-300 border-none text-[8px] font-extrabold uppercase px-2 py-0.5 tracking-wider w-fit">
                  HẠN CHÓT GẤP
                </Badge>

                <h4 
                  onClick={() => onViewDetails(comp)}
                  className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight pt-1 cursor-pointer"
                >
                  {comp.Name}
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold">
                  Đơn vị tổ chức: <strong>{comp.Organizer}</strong>
                </p>
              </CardHeader>

              <CardContent className="p-0 pt-4 space-y-4 text-xs text-slate-300 flex-1 flex flex-col justify-between">
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold line-clamp-3">
                  {comp.Description}
                </p>

                <div className="space-y-1.5 bg-white/5 rounded-xl p-2.5 border border-white/5 mt-2">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-400 font-semibold">Hình thức:</span>
                    <span className="font-extrabold text-white">{comp.Format}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-400 font-semibold">Giải thưởng:</span>
                    <span className="font-extrabold text-amber-300">{comp.Prize}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    onClick={() => onViewDetails(comp)}
                    className="flex-1 rounded-xl text-[11px] font-semibold h-8.5 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                  >
                    Chi tiết
                  </Button>
                  <Button
                    onClick={() => handleAction(`Đăng ký ${comp.Name}`, `Xác nhận đăng ký tham dự ${comp.Name} do thời hạn sắp kết thúc.`)}
                    className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white border-none text-[11px] font-bold h-8.5 cursor-pointer"
                  >
                    Đăng ký
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
