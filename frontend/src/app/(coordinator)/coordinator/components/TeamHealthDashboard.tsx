'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, RefreshCw, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCoordinatorHealthOverviewApi } from '@/services/api/mentorship';
import type { CoordinatorHealthOverview } from '@/services/types/mentorship';
import { useAutoDismissState } from '@/hooks/useAutoDismiss';

export default function TeamHealthDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CoordinatorHealthOverview | null>(null);
  const [error, setError] = useAutoDismissState('');
  const [filter, setFilter] = useState<'ALL' | 'RED' | 'YELLOW' | 'GREEN' | 'ZERO_BOOKINGS'>('ALL');

  const fetchHealthOverview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getCoordinatorHealthOverviewApi();
      setData(res);
    } catch (err: unknown) {
      setError('Không thể tải dữ liệu tiến độ & sức khỏe các đội thi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHealthOverview();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, [fetchHealthOverview]);

  const getHealthBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'RED':
        return <Badge className="bg-rose-500 text-white font-bold text-xs"><ShieldAlert className="mr-1 h-3 w-3" /> Red (Báo động)</Badge>;
      case 'YELLOW':
        return <Badge className="bg-amber-500 text-white font-bold text-xs"><AlertTriangle className="mr-1 h-3 w-3" /> Yellow (Chậm)</Badge>;
      default:
        return <Badge className="bg-emerald-500 text-white font-bold text-xs"><CheckCircle2 className="mr-1 h-3 w-3" /> Green (Tốt)</Badge>;
    }
  };

  const filteredTeams = (data?.teams || []).filter((team) => {
    if (filter === 'RED') return team.healthStatus.toUpperCase() === 'RED';
    if (filter === 'YELLOW') return team.healthStatus.toUpperCase() === 'YELLOW';
    if (filter === 'GREEN') return team.healthStatus.toUpperCase() === 'GREEN';
    if (filter === 'ZERO_BOOKINGS') return team.totalBookings === 0;
    return true;
  });

  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Giám Sát Sức Khỏe & Tiến Độ Đội Thi (Mentoring Checkpoints)
            </CardTitle>
            <CardDescription className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Theo dõi tình hình thực tế các đội trước ngày nộp bài. Phát hiện sớm các đội có nguy cơ bỏ cuộc (Red) hoặc chưa từng gặp Mentor.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHealthOverview}
            disabled={loading}
            className="h-8 rounded-xl text-xs"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <div
            onClick={() => setFilter('ALL')}
            className={`cursor-pointer rounded-2xl border p-4 transition-all ${
              filter === 'ALL' ? 'border-indigo-600 bg-indigo-50/50 shadow-sm dark:bg-indigo-950/20' : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tổng Đội Thi</p>
            <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{data?.totalTeams ?? 0}</p>
          </div>

          <div
            onClick={() => setFilter('GREEN')}
            className={`cursor-pointer rounded-2xl border p-4 transition-all ${
              filter === 'GREEN' ? 'border-emerald-600 bg-emerald-50/50 shadow-sm dark:bg-emerald-950/20' : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Green (Tốt)</p>
            <p className="mt-1 text-2xl font-black text-emerald-600">{data?.greenTeamsCount ?? 0}</p>
          </div>

          <div
            onClick={() => setFilter('YELLOW')}
            className={`cursor-pointer rounded-2xl border p-4 transition-all ${
              filter === 'YELLOW' ? 'border-amber-600 bg-amber-50/50 shadow-sm dark:bg-amber-950/20' : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Yellow (Chậm)</p>
            <p className="mt-1 text-2xl font-black text-amber-600">{data?.yellowTeamsCount ?? 0}</p>
          </div>

          <div
            onClick={() => setFilter('RED')}
            className={`cursor-pointer rounded-2xl border p-4 transition-all ${
              filter === 'RED' ? 'border-rose-600 bg-rose-50/50 shadow-sm dark:bg-rose-950/20' : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Red (Nguy cơ)</p>
            <p className="mt-1 text-2xl font-black text-rose-600">{data?.redTeamsCount ?? 0}</p>
          </div>

          <div
            onClick={() => setFilter('ZERO_BOOKINGS')}
            className={`cursor-pointer rounded-2xl border p-4 transition-all ${
              filter === 'ZERO_BOOKINGS' ? 'border-purple-600 bg-purple-50/50 shadow-sm dark:bg-purple-950/20' : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Chưa Đặt Lịch</p>
            <p className="mt-1 text-2xl font-black text-purple-600">{data?.zeroBookingsCount ?? 0}</p>
          </div>
        </div>

        {/* Team Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 font-bold">Tên Đội</th>
                <th className="px-4 py-3 font-bold">Đội Trưởng</th>
                <th className="px-4 py-3 font-bold">Sự Kiện & Thể Loại</th>
                <th className="px-4 py-3 font-bold">Trạng Thái Sức Khỏe</th>
                <th className="px-4 py-3 font-bold">Số Buổi Hẹn</th>
                <th className="px-4 py-3 font-bold">Feedback Gần Nhất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                    Không tìm thấy đội thi đáp ứng bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => (
                  <tr key={team.teamId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {team.teamName}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                      {team.teamLeaderName || 'Chưa cập nhật'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      <div>{team.eventName || 'N/A'}</div>
                      <div className="text-[10px] text-indigo-600 font-semibold">{team.categoryName}</div>
                    </td>
                    <td className="px-4 py-3">
                      {getHealthBadge(team.healthStatus)}
                    </td>
                    <td className="px-4 py-3 font-bold">
                      {team.totalBookings === 0 ? (
                        <span className="text-purple-600 font-bold">0 buổi</span>
                      ) : (
                        <span>{team.totalBookings} buổi</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      {team.lastFeedbackContent ? (
                        <div>
                          <p className="truncate font-medium text-slate-700 dark:text-slate-200" title={team.lastFeedbackContent}>
                            &quot;{team.lastFeedbackContent}&quot;
                          </p>
                          {team.lastMentoredAt && (
                            <p className="text-[10px] text-slate-400">
                              {new Date(team.lastMentoredAt).toLocaleDateString('vi-VN')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa có feedback</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
