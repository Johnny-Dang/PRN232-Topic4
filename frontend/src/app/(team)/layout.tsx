'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Trophy,
  UserCheck,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    const nextValue = !isCollapsed;
    setIsCollapsed(nextValue);
    localStorage.setItem('sidebar_collapsed', String(nextValue));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsCollapsed(localStorage.getItem('sidebar_collapsed') === 'true');

    const session = localStorage.getItem('seal_user');
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(session) as { Role?: string };
      const isAuthorized = user.Role === 'Leader' || user.Role === 'Member';
      if (!isAuthorized) {
        router.push('/');
      }
      setAuthorized(isAuthorized);
    } catch {
      localStorage.removeItem('seal_user');
      router.push('/login');
    }
  }, [router]);

  const navItems = [
    {
      label: 'Cổng Trưởng nhóm',
      href: '/leader',
      icon: UserCheck,
      description: 'Nộp bài & quản lý repo dự án',
    },
    {
      label: 'Cổng Thành viên',
      href: '/member',
      icon: Users,
      description: 'Tra cứu hạng mục & thông tin',
    },
    {
      label: 'Sự kiện của tôi',
      href: '/my-events',
      icon: CalendarDays,
      description: 'Danh sách sự kiện đang & đã tham gia',
    },
    {
      label: 'Thông báo & Thể lệ',
      href: '/competitions',
      icon: Trophy,
      description: 'Thông báo, mục tiêu & luật thi',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased transition-colors duration-200 dark:bg-slate-950 dark:text-slate-50">
      <aside
        className={cn(
          'sticky top-0 flex h-screen shrink-0 select-none flex-col overflow-hidden border-r border-slate-200 bg-white transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900',
          isCollapsed ? 'w-0 border-r-0' : 'w-80'
        )}
      >
        <div className="flex h-full w-80 shrink-0 flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
                T
              </div>
              <div>
                <h2 className="text-sm font-bold leading-tight tracking-tight text-slate-800 dark:text-slate-100">
                  Team Portal
                </h2>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Team Workspace
                </p>
              </div>
            </div>
            <Badge className="border border-emerald-100 bg-emerald-50 text-[10px] font-extrabold text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400">
              ACTIVE
            </Badge>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group relative flex w-full gap-4 rounded-xl p-4 text-left outline-none transition-all duration-200',
                    isActive
                      ? 'bg-slate-50 text-indigo-600 dark:bg-slate-800/60 dark:text-indigo-400'
                      : 'text-slate-600 hover:bg-slate-50/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/30 dark:hover:text-slate-100'
                  )}
                >
                  {isActive && <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-indigo-600 dark:bg-indigo-400" />}
                  <Icon
                    className={cn(
                      'mt-0.5 h-5 w-5 shrink-0 transition-transform group-hover:scale-105',
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    )}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={cn(
                        'text-sm font-semibold tracking-tight',
                        isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="text-[11px] font-normal leading-tight text-slate-500 dark:text-slate-400">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
            <Link
              href="/"
              className="flex w-full cursor-pointer items-center justify-between text-left text-xs font-bold text-indigo-600 outline-none hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <span className="flex items-center gap-1.5">
                <Home className="h-4 w-4 text-indigo-500" /> Quay lại Trang chủ
              </span>
              <ChevronRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('seal_user');
                router.push('/login');
              }}
              className="flex w-full cursor-pointer items-center justify-between text-left text-xs font-bold text-rose-600 outline-none hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
            >
              <span className="flex items-center gap-1.5">
                <LogOut className="h-4 w-4 text-rose-500" /> Đăng xuất tài khoản
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-1 text-[11px] leading-normal text-slate-400 dark:text-slate-500">
              <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>Nộp bài trực tiếp giúp tự động đồng bộ hóa thông tin và ghi lại nhật ký kiểm toán.</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col">
        <button
          onClick={toggleSidebar}
          className="absolute left-6 top-6 z-40 rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm outline-none transition-all duration-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          title={isCollapsed ? 'Mở thanh điều hướng' : 'Thu gọn thanh điều hướng'}
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>

        <div className="flex-1 space-y-8 overflow-y-auto py-8 pl-20 pr-8">
          {authorized ? children : (
            <div className="space-y-6">
              <Skeleton className="h-10 w-1/3 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-56 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
