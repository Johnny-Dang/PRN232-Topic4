import React from 'react';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Category as ApiCategory, Round as ApiRound, Team } from '@/lib/api';

type RankingWithTeam = {
  RoundId: string;
  TeamId: string;
  RankPosition: number;
  TotalScore: number;
};

type AdvancementRuleData = {
  RoundId: string;
  CategoryId: string;
  TopN: number;
};

interface TeamRoundsCardProps {
  team: Team;
  category: ApiCategory | null;
  rounds: ApiRound[];
  rankings: RankingWithTeam[];
  rules: AdvancementRuleData[];
}

export const TeamRoundsCard: React.FC<TeamRoundsCardProps> = ({
  category,
  rounds,
  rankings,
  rules,
}) => {
  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Tiến độ thăng hạng vòng thi
        </CardTitle>
        <CardDescription className="text-xs font-medium text-slate-400">
          Bảng điểm xếp hạng lấy từ API Rankings.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {rounds.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-4 text-center text-xs font-medium text-slate-500 dark:bg-slate-955">
            Chưa có vòng thi từ API.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead className="text-xs font-bold uppercase text-slate-700">Vòng thi</TableHead>
                  <TableHead className="text-center text-xs font-bold uppercase text-slate-700">
                    Xếp hạng
                  </TableHead>
                  <TableHead className="text-center text-xs font-bold uppercase text-slate-700">
                    Tổng điểm
                  </TableHead>
                  <TableHead className="text-right text-xs font-bold uppercase text-slate-700">
                    Trạng thái
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rounds.map((round) => {
                  const rank = rankings.find((item) => item.RoundId === round.RoundID);
                  const rule = rules.find(
                    (item) => item.RoundId === round.RoundID && item.CategoryId === category?.CategoryID
                  );
                  const advances = rank && rule ? rank.RankPosition <= rule.TopN : null;

                  return (
                    <TableRow key={round.RoundID}>
                      <TableCell className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {round.RoundName}
                      </TableCell>
                      <TableCell className="text-center text-xs font-bold text-slate-700">
                        {rank ? `Hạng ${rank.RankPosition}` : '-'}
                      </TableCell>
                      <TableCell className="text-center text-xs font-bold text-slate-800">
                        {rank ? rank.TotalScore.toFixed(2) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          {advances === null ? 'Chờ cập nhật' : advances ? 'Thăng vòng' : 'Bị loại'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
