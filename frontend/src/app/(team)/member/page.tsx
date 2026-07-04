'use client';

import React, { useEffect, useState } from 'react';
import { Bookmark, Calendar, CheckCircle2, RefreshCw, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  getAdvancementRules,
  getCategories,
  getEvents,
  getRankings,
  getRounds,
  getTeamMembers,
  getTeams,
  Category as ApiCategory,
  Event as ApiEvent,
  Round as ApiRound,
  Team,
} from '@/lib/api';

type TeamMemberWithProfile = Awaited<ReturnType<typeof getTeamMembers>>[number];
type RankingWithTeam = Awaited<ReturnType<typeof getRankings>>[number];
type AdvancementRuleData = Awaited<ReturnType<typeof getAdvancementRules>>[number];

const getStringProperty = (value: unknown, keys: string[]): string | null => {
  if (typeof value !== 'object' || value === null) return null;

  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const property = record[key];
    if (typeof property === 'string' && property.trim()) return property;
  }

  return null;
};

const getStoredUserId = (): string | null => {
  if (typeof window === 'undefined') return null;

  const storedUser = localStorage.getItem('seal_user');
  if (!storedUser) return null;

  try {
    return getStringProperty(JSON.parse(storedUser) as unknown, ['UserID', 'UserId', 'userId']);
  } catch (error) {
    console.error('Cannot parse seal_user from localStorage:', error);
    return null;
  }
};

export default function MemberPage() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMemberWithProfile[]>([]);
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [category, setCategory] = useState<ApiCategory | null>(null);
  const [rounds, setRounds] = useState<ApiRound[]>([]);
  const [rankings, setRankings] = useState<RankingWithTeam[]>([]);
  const [rules, setRules] = useState<AdvancementRuleData[]>([]);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const currentUserId = getStoredUserId();
      const fetchedTeams = await getTeams();
      const [eventsData, categoriesData] = await Promise.all([getEvents(), getCategories()]);

      let myTeam: Team | undefined;
      let myMembers: TeamMemberWithProfile[] = [];

      for (const candidateTeam of fetchedTeams) {
        if (currentUserId && candidateTeam.TeamLeaderId.toLowerCase() === currentUserId.toLowerCase()) {
          myTeam = candidateTeam;
          myMembers = await getTeamMembers(candidateTeam.TeamID);
          break;
        }

        const candidateMembers = await getTeamMembers(candidateTeam.TeamID);
        if (
          currentUserId &&
          candidateMembers.some((member) => member.UserId.toLowerCase() === currentUserId.toLowerCase())
        ) {
          myTeam = candidateTeam;
          myMembers = candidateMembers;
          break;
        }
      }

      setTeam(myTeam || null);
      setMembers(myMembers);
      setEvent(null);
      setCategory(null);
      setRounds([]);
      setRankings([]);
      setRules([]);

      if (!myTeam) {
        setErrorMessage('Không tìm thấy đội gắn với tài khoản thành viên hiện tại.');
        return;
      }

      const myCategory = categoriesData.find((item) => item.CategoryID === myTeam.CategoryID);
      const myEvent = myCategory ? eventsData.find((item) => item.EventID === myCategory.EventID) : null;
      const roundsData = myEvent ? await getRounds(myEvent.EventID) : [];
      const rulesData = await getAdvancementRules();

      const rankingRows: RankingWithTeam[] = [];
      for (const round of roundsData) {
        const roundRankings = await getRankings(round.RoundID);
        rankingRows.push(...roundRankings.filter((ranking) => ranking.TeamId === myTeam.TeamID));
      }

      setCategory(myCategory || null);
      setEvent(myEvent || null);
      setRounds(roundsData);
      setRules(rulesData);
      setRankings(rankingRows);
    } catch (error) {
      console.error(error);
      setErrorMessage('Không thể tải dữ liệu thành viên từ API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Cổng Thành Viên Đội</h2>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            Tra cứu thông tin đội, hồ sơ sinh viên và kết quả thăng hạng qua các vòng thi.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-slate-200 text-xs font-semibold"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Tải lại dữ liệu
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-44 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-56 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {errorMessage && (
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                {errorMessage}
              </div>
            )}

            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <Bookmark className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Hồ sơ nhóm dự thi
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-400">
                      Hồ sơ đăng ký chính thức lấy từ API.
                    </CardDescription>
                  </div>
                  {team && (
                    <Badge className="border border-emerald-100 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                      {team.TeamStatus}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-0">
                {!team ? (
                  <div className="rounded-xl bg-slate-50 p-4 text-xs font-medium text-slate-500 dark:bg-slate-950">
                    Chưa có dữ liệu đội từ API cho tài khoản hiện tại.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Tên đội
                        </span>
                        <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                          {team.TeamName}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Hạng mục
                        </span>
                        <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                          {category?.CategoryName || 'Chưa có'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Sự kiện chính
                        </span>
                        <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                          {event?.EventName || 'Chưa có'}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Mùa giải
                        </span>
                        <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                          {event ? `${event.Season} ${event.Year}` : 'Chưa có'}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

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
                  <div className="rounded-xl bg-slate-50 p-4 text-center text-xs font-medium text-slate-500 dark:bg-slate-950">
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
          </div>

          <div className="space-y-6 lg:col-span-1">
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Thành viên nhóm ({members.length})
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Thành viên lấy từ API team members nếu backend có hỗ trợ.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-6 pt-0">
                {members.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-3 text-xs font-medium text-slate-500 dark:bg-slate-950">
                    Chưa có API trả về danh sách thành viên.
                  </div>
                ) : (
                  members.map((member) => {
                    const isFpt = member.StudentProfile?.StudentType === 'FPT';
                    return (
                      <div
                        key={member.TeamMemberId}
                        className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {member.User.FullName}
                          </span>
                          <p className="text-[9px] font-semibold uppercase text-slate-400">
                            {member.StudentProfile?.UniversityName || 'Đại học'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-right">
                          <span className="font-mono text-xs font-bold text-slate-700">
                            {member.StudentProfile?.StudentCode || '-'}
                          </span>
                          <Badge className="border border-blue-100 bg-blue-50 text-[8px] font-extrabold text-blue-600">
                            {isFpt ? 'SINH VIÊN FPT' : 'SINH VIÊN NGOÀI'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="border-none bg-slate-900/5 dark:bg-slate-900">
              <CardContent className="space-y-3 p-6">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Quy định thăng hạng vòng thi
                </h4>
                <p className="text-xs leading-normal text-slate-500 dark:text-slate-400">
                  Chỉ các đội nằm trong Top N của hạng mục đăng ký mới có quyền thăng hạng và mở cổng nộp bài cho vòng
                  tiếp theo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
