'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, HelpCircle, ChevronRight, LogOut, Menu, ChevronLeft, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const isCoordinatorRole = (role?: string): boolean => {
  return role === 'Coordinator' || role === 'EventCoordinator';
};

export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    const nextValue = !isCollapsed;
    setIsCollapsed(nextValue);
    localStorage.setItem('sidebar_collapsed', String(nextValue));
  };

  useEffect(() => {
    const session = localStorage.getItem('seal_user');
    if (!session) {
      void Promise.resolve().then(() => {
        setAuthorized(false);
        setAuthChecked(true);
        router.push('/login');
      });
      return;
    }

    try {
      const user = JSON.parse(session) as { Role?: string };
      if (!isCoordinatorRole(user.Role)) {
        void Promise.resolve().then(() => {
          setAuthorized(false);
          setAuthChecked(true);
          router.push('/');
        });
        return;
      }

      localStorage.setItem('seal_user', JSON.stringify({ ...user, Role: 'Coordinator' }));
      void Promise.resolve().then(() => {
        setAuthorized(true);
        setAuthChecked(true);
      });
    } catch {
      localStorage.removeItem('seal_user');
      void Promise.resolve().then(() => {
        setAuthorized(false);
        setAuthChecked(true);
        router.push('/login');
      });
    }
  }, [router]);

  const navItems = [
    {
      label: 'Quản trị cuộc thi',
      href: '/coordinator',
      icon: ShieldCheck,
      description: 'Nhật ký kiểm toán & thống kê IRR',
    },
  ];

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans antialiased text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-200">
      <aside className={cn(
        'bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 select-none dark:bg-slate-900 dark:border-slate-800 transition-all duration-300 ease-in-out overflow-hidden',
        isCollapsed ? 'w-0 border-r-0' : 'w-80'
      )}>
        <div className="w-80 flex flex-col h-full shrink-0">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold text-lg">
                C
              </div>
              <div>
                <h2 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-tight text-sm">
                  Admin Portal
                </h2>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Trần Điều Phối
                </p>
              </div>
            </div>
            <Badge className="bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-extrabold dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
              ADMIN
            </Badge>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'w-full text-left flex gap-4 p-4 rounded-xl transition-all duration-200 group relative outline-none',
                    isActive
                      ? 'bg-slate-50 text-rose-600 dark:bg-slate-800/60 dark:text-rose-400'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/30'
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-rose-600 rounded-r-full dark:bg-rose-400" />
                  )}

                  <Icon
                    className={cn(
                      'w-5 h-5 mt-0.5 shrink-0 transition-transform group-hover:scale-105',
                      isActive ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    )}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className={cn(
                      'font-semibold text-sm tracking-tight',
                      isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'
                    )}>
                      {item.label}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-tight">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-4">
            <Link
              href="/"
              className="flex items-center justify-between text-xs text-rose-600 hover:text-rose-700 font-bold dark:text-rose-400 dark:hover:text-rose-300 outline-none w-full text-left cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Home className="w-4 h-4 text-rose-500" /> Quay lại Trang chủ
              </span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('seal_user');
                router.push('/login');
              }}
              className="flex items-center justify-between text-xs text-rose-600 hover:text-rose-700 font-bold dark:text-rose-400 dark:hover:text-rose-300 outline-none w-full text-left cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <LogOut className="w-4 h-4 text-rose-500" /> Đăng xuất tài khoản
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal flex items-start gap-1">
              <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Audit Logs ghi lại các quyết định chấm điểm và loại bỏ bài nộp, giúp đảm bảo minh bạch.</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative">
        <button
          onClick={toggleSidebar}
          className="absolute top-6 left-6 z-40 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-200 outline-none cursor-pointer"
          title={isCollapsed ? 'Mở thanh điều hướng' : 'Thu gọn thanh điều hướng'}
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        <div className="flex-1 py-8 pr-8 pl-20 overflow-y-auto w-full space-y-8">
          {authorized && authChecked ? children : (
            <div className="space-y-6">
              <Skeleton className="h-10 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <Skeleton className="h-56 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
