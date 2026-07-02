'use client';

import React from 'react';
import { Calendar, Users, FileCode2, BarChart3, HelpCircle, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SidebarTab = 'events' | 'teams' | 'submissions' | 'evaluation';

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    {
      id: 'events' as SidebarTab,
      label: 'Sự kiện & Vòng thi',
      icon: Calendar,
      description: 'Quản lý sự kiện, vòng thi, tiêu chí & rule thăng hạng',
    },
    {
      id: 'teams' as SidebarTab,
      label: 'Đội thi & Thành viên',
      icon: Users,
      description: 'Xem chi tiết đội, thành viên & phân chia hạng mục',
    },
    {
      id: 'submissions' as SidebarTab,
      label: 'Bài nộp & Nhật ký',
      icon: FileCode2,
      description: 'Cổng bài nộp, GitHub Repo & lịch sử Audit Logs',
    },
    {
      id: 'evaluation' as SidebarTab,
      label: 'Đánh giá & RBL Analytics',
      icon: BarChart3,
      description: 'Chấm điểm, độ lệch chuẩn IRR, hiệu chuẩn & loại thi',
    },
  ];

  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 select-none dark:bg-slate-900 dark:border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-indigo-200 dark:shadow-none">
          S
        </div>
        <div>
          <h1 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-tight text-base">
            SEAL Hackathon
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Hệ thống Quản lý & Nghiên cứu RBL
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full text-left flex gap-4 p-4 rounded-xl transition-all duration-200 group relative outline-none",
                isActive
                  ? "bg-slate-50 text-indigo-600 dark:bg-slate-800/60 dark:text-indigo-400"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/30"
              )}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-600 rounded-r-full dark:bg-indigo-400" />
              )}
              
              <Icon
                className={cn(
                  "w-5 h-5 mt-0.5 shrink-0 transition-transform group-hover:scale-105",
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )}
              />
              <div className="flex flex-col gap-0.5">
                <span className={cn(
                  "font-semibold text-sm tracking-tight",
                  isActive ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300"
                )}>
                  {item.label}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-tight">
                  {item.description}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5" /> Client Version: 1.0.0
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold uppercase text-[10px]">
            Dev
          </span>
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal flex items-start gap-1">
          <HelpCircle className="w-3 h-3 mt-0.5 shrink-0" />
          <span>Lối thiết kế Skeletal & Minimalist giúp giao diện mượt mà và trực quan hóa phân phối điểm chấm.</span>
        </div>
      </div>
    </aside>
  );
}
