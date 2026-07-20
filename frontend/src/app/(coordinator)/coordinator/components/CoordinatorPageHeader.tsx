'use client';

import { RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/components/NotificationBell';

interface CoordinatorPageHeaderProps {
  loading: boolean;
  onReload: () => void;
}

export default function CoordinatorPageHeader({ loading, onReload }: CoordinatorPageHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('seal_user');
    router.push('/login');
  };

  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Cổng Quản Trị & Giám Sát
        </h2>
        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
          Tạo Event, đưa Event lên Home page, phân công Mentor và theo dõi dữ liệu vận hành.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-slate-200 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:border-slate-700 dark:hover:bg-rose-950/30"
          onClick={handleLogout}
        >
          <LogOut className="mr-1.5 h-3.5 w-3.5" />
          Đăng xuất
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-slate-200 text-xs font-semibold"
          onClick={onReload}
          disabled={loading}
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Tải lại dữ liệu
        </Button>
      </div>
    </div>
  );
}
