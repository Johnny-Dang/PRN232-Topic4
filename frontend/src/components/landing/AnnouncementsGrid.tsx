'use client';

import React from 'react';
import { Bell, Calendar, Pin } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Announcement } from '@/lib/api';

interface AnnouncementsGridProps {
  announcementsSectionRef: React.RefObject<HTMLDivElement | null>;
  announcements: Announcement[];
  loading: boolean;
}

export default function AnnouncementsGrid({
  announcementsSectionRef,
  announcements,
  loading,
}: AnnouncementsGridProps) {

  const getAnnouncementTypeStyle = (type: string) => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-rose-50 border-rose-105 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400',
          label: 'Quan trọng'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-105 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-450',
          label: 'Gia hạn / Thay đổi'
        };
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400',
          label: 'Kết quả'
        };
      case 'info':
      default:
        return {
          bg: 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400',
          label: 'Cập nhật'
        };
    }
  };

  return (
    <section ref={announcementsSectionRef} className="space-y-8 scroll-mt-32">
      <div className="space-y-1 border-b border-slate-200 pb-5 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xl font-black text-slate-850 dark:text-white">
            Bảng Tin & Thông Báo Quan Trọng
          </h3>
        </div>
        <p className="text-slate-500 text-xs font-medium">
          Dòng thời gian các thông báo khẩn cấp, tài liệu kỹ thuật và hướng dẫn kiểm thử dự án từ Ban tổ chức.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <Skeleton className="h-20 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {announcements.map((ann) => {
            const typeMeta = getAnnouncementTypeStyle(ann.Type);
            const isPinned = ann.AnnouncementID === 'N003'; // Hardcoded pin for the urgent warning as in original page.tsx
            return (
              <Card
                key={ann.AnnouncementID}
                className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between"
              >
                <CardHeader className="p-6 pb-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge className={`border font-extrabold text-[8px] py-0.5 px-2.5 rounded-full ${typeMeta.bg}`}>
                      {typeMeta.label}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {ann.PublishedAt}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight flex items-start gap-1.5 leading-snug">
                    {isPinned && <Pin className="w-4 h-4 text-indigo-650 shrink-0 mt-0.5 rotate-45" />}
                    <span>{ann.Title}</span>
                  </h4>
                </CardHeader>

                <CardContent className="p-6 pt-0 text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
                  {ann.Content}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
