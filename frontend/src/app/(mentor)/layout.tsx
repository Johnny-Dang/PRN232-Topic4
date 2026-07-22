'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileCode2,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import NotificationBell from '@/components/NotificationBell';
import { cn } from '@/lib/utils';

function hasAccessToken(user: Record<string, unknown>): boolean {
  return Boolean(user.AccessToken || user.accessToken || user.token);
}

function MentorLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'assignments';

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
      const user = JSON.parse(session) as { Role?: string } & Record<string, unknown>;
      if (user.Role !== 'Mentor' || !hasAccessToken(user)) {
        localStorage.removeItem('seal_user');
        router.push('/login');
        return;
      }

      void Promise.resolve().then(() => setAuthorized(true));
    } catch {
      localStorage.removeItem('seal_user');
      router.push('/login');
    }
  }, [router]);

  const navItems = [
    {
      label: 'Yêu cầu phân công',
      href: '/mentor?tab=assignments',
      icon: Clock,
      description: 'Duyệt đề xuất từ Coordinator',
      tabValue: 'assignments',
    },
    {
      label: 'Lịch rảnh của tôi',
      href: '/mentor?tab=schedules',
      icon: Clock,
      description: 'Thiết lập slot thời gian hỗ trợ',
      tabValue: 'schedules',
    },
    {
      label: 'Lịch hẹn Mentoring',
      href: '/mentor?tab=bookings',
      icon: MessageSquare,
      description: 'Duyệt lịch hẹn & gửi Feedback',
      tabValue: 'bookings',
    },
    {
      label: 'Hạng mục phụ trách',
      href: '/mentor?tab=categories',
      icon: CheckCircle2,
      description: 'Các category đã nhận',
      tabValue: 'categories',
    },
    {
      label: 'Đội thi phụ trách',
      href: '/mentor?tab=teams',
      icon: Users,
      description: 'Đội thuộc category đã nhận',
      tabValue: 'teams',
    },
    {
      label: 'Bài nộp của nhóm',
      href: '/mentor?tab=submissions',
      icon: FileCode2,
      description: 'Theo dõi tiến độ đội thi',
      tabValue: 'submissions',
    },
    {
      label: 'Gửi Phản hồi Checkpoint',
      href: '/mentor?tab=feedback-form',
      icon: MessageSquare,
      description: 'Đánh giá Health Status & Góp ý',
      tabValue: 'feedback-form',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased transition-colors duration-200 dark:bg-slate-950 dark:text-slate-50">
      <aside
        className={cn(
          'sticky top-0 flex h-screen shrink-0 select-none flex-col overflow-hidden border-r border-slate-200 bg-white transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900',
          isCollapsed ? 'w-0 border-r-0' : 'w-80',
        )}
      >
        <div className="flex h-full w-80 shrink-0 flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-lg font-bold text-white">
                M
              </div>
              <div>
                <h2 className="text-sm font-bold leading-tight tracking-tight text-slate-800 dark:text-slate-100">
                  Mentor Portal
                </h2>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Academic Advisor
                </p>
              </div>
            </div>
            <Badge className="border border-sky-100 bg-sky-50 text-[10px] font-extrabold text-sky-600 dark:border-sky-900/30 dark:bg-sky-950/20 dark:text-sky-400">
              MENTOR
            </Badge>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === '/mentor' && currentTab === item.tabValue;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group relative flex w-full gap-4 rounded-xl p-4 text-left outline-none transition-all duration-200',
                    isActive
                      ? 'bg-slate-50 text-sky-600 dark:bg-slate-800/60 dark:text-sky-400'
                      : 'text-slate-600 hover:bg-slate-50/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/30 dark:hover:text-slate-100',
                  )}
                >
                  {isActive && <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-sky-600 dark:bg-sky-400" />}
                  <Icon
                    className={cn(
                      'mt-0.5 h-5 w-5 shrink-0 transition-transform group-hover:scale-105',
                      isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300',
                    )}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className={cn('text-sm font-semibold tracking-tight', isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300')}>
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
              className="flex w-full items-center justify-between text-left text-xs font-bold text-sky-600 outline-none hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            >
              <span className="flex items-center gap-1.5">
                <Home className="h-4 w-4 text-sky-500" /> Quay lại Trang chủ
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
              <span>Dữ liệu Mentor được lấy trực tiếp từ backend theo tài khoản đang đăng nhập.</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col">
        <button
          onClick={toggleSidebar}
          className="absolute left-6 top-6 z-40 cursor-pointer rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm outline-none transition-all duration-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          title={isCollapsed ? 'Mở thanh điều hướng' : 'Thu gọn thanh điều hướng'}
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>

        <div className="flex-1 space-y-8 overflow-y-auto py-8 pl-20 pr-8">
          {authorized ? (
            children
          ) : (
            <div className="space-y-6">
              <Skeleton className="h-10 w-1/3 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <Skeleton className="h-56 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
            </div>
          )}
        </div>
      </main>

      {/* Fixed notification bell - always visible in top right */}
      <div className="fixed top-6 right-6 z-[100]">
        <NotificationBell />
      </div>
    </div>
  );
}

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 dark:bg-slate-950">Đang tải bố cục...</div>}>
      <MentorLayoutContent>{children}</MentorLayoutContent>
    </Suspense>
  );
}
