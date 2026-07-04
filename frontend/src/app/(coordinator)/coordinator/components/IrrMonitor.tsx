'use client';

import { AlertTriangle, GitCompare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { IrrSubmissionData } from './types';

interface IrrMonitorProps {
  data: IrrSubmissionData[];
}

export default function IrrMonitor({ data }: IrrMonitorProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <GitCompare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Bảng đối soát chênh lệch điểm
        </CardTitle>
        <CardDescription className="text-xs font-medium text-slate-400">
          Tính phương sai và độ lệch chuẩn để giám sát sự chênh lệch lớn giữa các giám khảo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-0">
        {data.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
            Chưa có bài đã chấm để tính IRR.
          </div>
        ) : (
          data.map((item) => (
            <div
              key={item.submissionId}
              className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50"
            >
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Nhóm: {item.teamName} ({item.roundName})
              </h4>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {item.criteria.map((criteria) => {
                  const hasHighDiscrepancy = criteria.stdDev > 0.8;

                  return (
                    <div
                      key={criteria.name}
                      className={`flex flex-col justify-between rounded-xl border p-3 ${
                        hasHighDiscrepancy
                          ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/20'
                          : 'border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950'
                      }`}
                    >
                      <div>
                        <h5 className="truncate text-[11px] font-bold text-slate-800 dark:text-slate-200">
                          {criteria.name}
                        </h5>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-base font-black text-slate-900 dark:text-slate-100">
                            {criteria.mean.toFixed(2)}
                          </span>
                          <span className="text-[9px] font-bold uppercase text-slate-400">Mean</span>
                        </div>
                      </div>

                      <div className="mt-2 space-y-0.5 border-t border-slate-100 pt-2 text-[10px] text-slate-500 dark:border-slate-800/60 dark:text-slate-400">
                        <div className="flex justify-between">
                          <span>Phương sai:</span>
                          <span>{criteria.variance.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Độ lệch:</span>
                          <span className={hasHighDiscrepancy ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}>
                            {criteria.stdDev.toFixed(3)}
                          </span>
                        </div>
                      </div>

                      {hasHighDiscrepancy && (
                        <div className="mt-1.5 flex items-start gap-0.5 rounded bg-amber-100/20 p-1 text-[9px] leading-normal text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                          <span>SD &gt; 0.8: lệch điểm cao.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
