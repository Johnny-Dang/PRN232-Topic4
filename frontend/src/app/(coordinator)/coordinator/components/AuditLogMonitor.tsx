'use client';

import { Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AuditLogList } from './types';

interface AuditLogMonitorProps {
  logs: AuditLogList;
}

export default function AuditLogMonitor({ logs }: AuditLogMonitorProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Bảng kiểm toán hoạt động
        </CardTitle>
        <CardDescription className="text-xs font-medium text-slate-400">
          Nhật ký truy vết các quyết định tạo sự kiện, tạo đội, chấm điểm và xử lý bài dự thi.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-0">
        {logs.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
            Chưa có nhật ký hoạt động.
          </div>
        ) : (
          <div className="relative space-y-5 border-l border-slate-200 pl-6 dark:border-slate-700">
            {logs.map((log) => (
              <div key={log.LogID} className="relative">
                <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-slate-400 ring-4 ring-slate-50 dark:border-slate-900 dark:ring-slate-900" />

                <div className="flex flex-col justify-between gap-1 md:flex-row md:items-center">
                  <div>
                    <Badge className="border border-slate-200 bg-slate-100 text-[8px] font-extrabold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {log.ActionType}
                    </Badge>
                    <p className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                      {log.User.FullName} ({log.User.Role})
                    </p>
                    <div className="mt-1 rounded-xl border border-slate-100 bg-slate-50 p-2.5 font-mono text-[11px] leading-normal text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                      {log.NewValue}
                    </div>
                  </div>
                  <span className="shrink-0 self-start text-[9px] font-semibold text-slate-400 dark:text-slate-500 md:self-center">
                    {log.CreatedAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
