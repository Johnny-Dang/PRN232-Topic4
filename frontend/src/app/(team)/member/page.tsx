'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, RefreshCw, CheckCircle2, Bookmark } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import {
  getTeams,
  getTeamMembers,
  getEvents,
  getCategories,
  getRounds,
  getRankings,
  getAdvancementRules,
  Team,
  Event as ApiEvent,
  Category as ApiCategory,
  Round as ApiRound,
} from '@/lib/api';

type TeamMemberWithProfile = Awaited<ReturnType<typeof getTeamMembers>>[number];
type RankingWithTeam = Awaited<ReturnType<typeof getRankings>>[number];
type AdvancementRuleData = Awaited<ReturnType<typeof getAdvancementRules>>[number];

export default function MemberPage() {
  const [loading, setLoading] = useState<boolean>(true);

  // Loaded states
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMemberWithProfile[]>([]);
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [category, setCategory] = useState<ApiCategory | null>(null);
  const [rounds, setRounds] = useState<ApiRound[]>([]);
  const [rankings, setRankings] = useState<RankingWithTeam[]>([]);
  const [rules, setRules] = useState<AdvancementRuleData[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Find Team Phoenix AI (which leader.phoenix manages, let's load this team's data)
      const fetchedTeams = await getTeams();
      const myTeam = fetchedTeams.find(t => t.TeamLeaderId === '00000000-0000-0000-0000-000000000001') || fetchedTeams[0];
      setTeam(myTeam);

      if (myTeam) {
        // Fetch members
        const membersData = await getTeamMembers(myTeam.TeamID);
        setMembers(membersData);

        // Fetch category & event details
        const eventsData = await getEvents();
        const categoriesData = await getCategories();
        const myCat = categoriesData.find(c => c.CategoryID === myTeam.CategoryID);
        setCategory(myCat || null);

        const myEvent = myCat ? eventsData.find(e => e.EventID === myCat.EventID) : null;
        setEvent(myEvent || null);

        if (myEvent) {
          const roundsData = await getRounds(myEvent.EventID);
          setRounds(roundsData);
          
          const rulesData = await getAdvancementRules();
          setRules(rulesData);
        }

        // Fetch rankings
        const allRanks = await getRankings();
        const teamRanks = allRanks.filter(r => r.TeamId === myTeam.TeamID);
        setRankings(teamRanks);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight dark:text-white">
            Cổng Thành Viên Đội
          </h2>
          <p className="text-slate-500 text-xs mt-1 dark:text-slate-400 font-medium leading-relaxed">
            Tra cứu thông tin danh sách, hồ sơ sinh viên & kết quả thăng hạng qua các vòng thi.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl h-9 border-slate-200 text-xs font-semibold"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Tải lại dữ liệu
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-44 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <Skeleton className="h-56 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Team details */}
            <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Hồ sơ nhóm dự thi
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 font-medium">Hồ sơ đăng ký chính thức của nhóm.</CardDescription>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400">
                    ĐÃ DUYỆT HỒ SƠ
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tên Đội</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{team?.TeamName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Hạng mục</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{category?.CategoryName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sự kiện chính</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{event?.EventName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Niên khóa / Mùa</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{event?.Season} {event?.Year}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advancement Progress */}
            <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Tiến độ thăng hạng vòng thi
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 font-medium">Bảng điểm xếp hạng của nhóm qua từng vòng thi.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="border border-slate-200 rounded-xl overflow-hidden dark:border-slate-800">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                      <TableRow className="border-slate-200 dark:border-slate-800">
                        <TableHead className="font-bold text-slate-700 text-xs uppercase dark:text-slate-300">Vòng thi</TableHead>
                        <TableHead className="font-bold text-slate-700 text-xs uppercase dark:text-slate-300 text-center">Xếp hạng</TableHead>
                        <TableHead className="font-bold text-slate-700 text-xs uppercase dark:text-slate-300 text-center">Tổng điểm</TableHead>
                        <TableHead className="font-bold text-slate-700 text-xs uppercase dark:text-slate-300 text-right">Trạng thái vòng</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rounds.map((round) => {
                        const rank = rankings.find(r => r.RoundId === round.RoundID);
                        const rule = rules.find(rl => rl.RoundId === round.RoundID && rl.CategoryId === category?.CategoryID);
                        
                        // Check if team advances
                        let statusText = 'Chờ cập nhật';
                        let statusColor = 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
                        
                        if (rank && rule) {
                          const advances = rank.RankPosition <= rule.TopN;
                          statusText = advances ? 'Thăng vòng' : 'Bị loại';
                          statusColor = advances
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                            : 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
                        } else if (round.RoundOrder === 3 && rank) {
                          // Final round
                          statusText = rank.RankPosition === 1 ? 'Vô Địch 🏆' : 'Á Quân';
                          statusColor = rank.RankPosition === 1
                            ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                            : 'bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30';
                        }

                        return (
                          <TableRow key={round.RoundID} className="border-slate-100 dark:border-slate-800">
                            <TableCell className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                              {round.RoundName}
                            </TableCell>
                            <TableCell className="text-center font-bold text-slate-700 dark:text-slate-300 text-xs">
                              {rank ? `Hạng ${rank.RankPosition}` : '-'}
                            </TableCell>
                            <TableCell className="text-center font-bold text-slate-800 dark:text-slate-200 text-xs">
                              {rank ? rank.TotalScore.toFixed(2) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge className={`${statusColor} text-[10px] font-bold px-2 py-0.5`}>
                                {statusText}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column: Members university checks */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Student profiles verifier */}
            <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Xác thực MSSV & Trường học
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 font-medium">BTC đối soát sinh viên FPT (nội bộ) và sinh viên trường khác (ngoài).</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                {members.map((memb) => {
                  const isFpt = memb.StudentProfile?.StudentType === 'FPT';
                  return (
                    <div key={memb.TeamMemberId} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 flex justify-between items-center gap-4">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{memb.User.FullName}</span>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase">{memb.StudentProfile?.UniversityName || 'Đại học'}</p>
                      </div>
                      
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                          {memb.StudentProfile?.StudentCode}
                        </span>
                        <Badge className={
                          isFpt 
                            ? 'bg-orange-50 text-orange-600 border border-orange-100 text-[8px] font-extrabold hover:bg-orange-50' 
                            : 'bg-blue-50 text-blue-600 border border-blue-100 text-[8px] font-extrabold hover:bg-blue-50'
                        }>
                          {isFpt ? 'SINH VIÊN FPT' : 'SINH VIÊN NGOÀI'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Event guidelines */}
            <Card className="bg-slate-900/5 dark:bg-slate-900 border-none">
              <CardContent className="p-6 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Quy định thăng hạng vòng thi
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  Theo thể thức quy tắc thăng hạng của SEAL Hackathon, chỉ có các đội nằm trong <b>Top N</b> của Hạng mục đăng ký mới có quyền thăng hạng và được mở cổng nộp bài cho vòng thi tiếp theo.
                </p>
              </CardContent>
            </Card>

          </div>

        </div>
      )}
    </div>
  );
}
