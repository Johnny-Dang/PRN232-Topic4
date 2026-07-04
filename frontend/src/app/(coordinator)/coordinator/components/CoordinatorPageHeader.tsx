'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CoordinatorPageHeaderProps {
  loading: boolean;
  onReload: () => void;
}

export default function CoordinatorPageHeader({ loading, onReload }: CoordinatorPageHeaderProps) {
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
  );
}
