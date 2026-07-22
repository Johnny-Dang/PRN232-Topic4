'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { getTeams, getCategories, type Team, type Category } from '@/lib/api';
import MentoringBookingPanel from '../leader/components/MentoringBookingPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MentoringPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedTeams, fetchedCategories] = await Promise.all([
        getTeams().catch(() => []),
        getCategories().catch(() => []),
      ]);
      setTeams(fetchedTeams);
      setCategories(fetchedCategories);
      if (fetchedTeams.length > 0) {
        setSelectedTeamId((current) => current || fetchedTeams[0].TeamID);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const selectedTeam = teams.find((t) => t.TeamID === selectedTeamId) || teams[0];
  const categoryId = selectedTeam?.CategoryID;
  const category = categories.find((c) => c.CategoryID === categoryId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Hẹn Lịch Tư Vấn Với Mentor
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Đặt slot thời gian rảnh với Mentor phụ trách Category của bạn và nhận phản hồi feedback checkpoint.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-slate-200 text-xs font-semibold"
          onClick={() => void loadData()}
          disabled={loading}
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Tải lại
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/3 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-56 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : teams.length === 0 ? (
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-8 text-center text-xs font-semibold text-slate-400">
            Bạn chưa thuộc đội thi nào. Hãy tham gia hoặc tạo đội thi để đặt lịch tư vấn với Mentor.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Đội thi hiện tại:
              </span>
              {teams.length > 1 ? (
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {teams.map((t) => (
                    <option key={t.TeamID} value={t.TeamID}>
                      {t.TeamName}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {selectedTeam?.TeamName}
                </span>
              )}
            </div>

            {category && (
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Category: <strong className="font-extrabold">{category.CategoryName}</strong>
              </div>
            )}
          </div>

          <MentoringBookingPanel categoryId={categoryId} teamId={selectedTeam?.TeamID} />
        </div>
      )}
    </div>
  );
}
