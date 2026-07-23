'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTeamRoundProgress, TeamRoundProgressStatus } from '@/lib/api';

interface TeamRoundsCardProps {
  teamId: string;
}

const statusLabel: Record<TeamRoundProgressStatus, string> = {
  Upcoming: 'Sắp diễn ra',
  InProgress: 'Chờ chốt',
  AwaitingFinalization: 'Đang chốt',
  Advanced: 'Thăng vòng',
  Eliminated: 'Bị loại',
};

const statusClass: Record<TeamRoundProgressStatus, string> = {
  Upcoming: 'border-slate-200 bg-slate-50 text-slate-500',
  InProgress: 'border-blue-100 bg-blue-50 text-blue-600',
  AwaitingFinalization: 'border-amber-100 bg-amber-50 text-amber-700',
  Advanced: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  Eliminated: 'border-rose-100 bg-rose-50 text-rose-700',
};

export const TeamRoundsCard: React.FC<TeamRoundsCardProps> = ({ teamId }) => {
  const { data: progress = [], isLoading, isError } = useQuery({
    queryKey: ['team-round-progress', teamId],
    queryFn: () => getTeamRoundProgress(teamId),
    enabled: Boolean(teamId),
  });

  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Tiến độ thăng hạng vòng thi
        </CardTitle>
        <CardDescription className="text-xs font-medium text-slate-400">
          Hạng trước khi chốt là tạm thời; kết quả thăng vòng chỉ có hiệu lực sau khi round được chốt.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {isLoading ? (
          <div className="rounded-xl bg-slate-50 p-4 text-center text-xs font-medium text-slate-500 dark:bg-slate-950">
            Đang tải tiến độ vòng thi...
          </div>
        ) : isError ? (
          <div className="rounded-xl bg-rose-50 p-4 text-center text-xs font-medium text-rose-600">
            Không thể tải tiến độ vòng thi.
          </div>
        ) : progress.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-4 text-center text-xs font-medium text-slate-500 dark:bg-slate-950">
            Chưa có vòng thi.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="text-xs font-bold uppercase text-slate-700">Vòng thi</TableHead>
                  <TableHead className="text-center text-xs font-bold uppercase text-slate-700">Xếp hạng</TableHead>
                  <TableHead className="text-center text-xs font-bold uppercase text-slate-700">Tổng điểm</TableHead>
                  <TableHead className="text-right text-xs font-bold uppercase text-slate-700">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {progress.map((round) => (
                  <TableRow key={round.RoundId}>
                    <TableCell className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      <div>{round.RoundName}</div>
                      {!round.CanSubmit && round.BlockedReason && (
                        <div className="mt-1 max-w-xs text-[10px] font-medium text-slate-400">
                          {round.BlockedReason}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-xs font-bold text-slate-700">
                      {round.RankPosition == null
                        ? '-'
                        : `${round.IsFinalized ? 'Hạng' : 'Hạng tạm'} ${round.RankPosition}`}
                    </TableCell>
                    <TableCell className="text-center text-xs font-bold text-slate-800">
                      {round.TotalScore == null ? '-' : round.TotalScore.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={`border px-2 py-0.5 text-[10px] font-bold ${statusClass[round.Status]}`}>
                        {statusLabel[round.Status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
