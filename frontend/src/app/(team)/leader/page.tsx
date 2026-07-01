'use client';

import React, { useState, useEffect } from 'react';
import { FileCode2, ExternalLink, RefreshCw, Send, CheckCircle, Info, Video, FileText, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import {
  getTeams,
  getTeamMembers,
  getSubmissions,
  getScores,
  getEvents,
  getRounds,
  getCategories,
  mockUsers,
  mockStudentProfiles,
  Team,
  Submission,
  Score,
  Event as ApiEvent,
  Round as ApiRound
} from '@/lib/api';

export default function LeaderPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Form states
  const [repoUrl, setRepoUrl] = useState<string>('https://github.com/phoenix-ai/project-final');
  const [demoUrl, setDemoUrl] = useState<string>('https://youtube.com/phoenix-demo-final');
  const [slideUrl, setSlideUrl] = useState<string>('https://drive.google.com/phoenix-slide-final');

  // Loaded states
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [rounds, setRounds] = useState<ApiRound[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Find Team Phoenix AI (which leader.phoenix manages)
      const fetchedTeams = await getTeams();
      const myTeam = fetchedTeams.find(t => t.TeamLeaderId === '00000000-0000-0000-0000-000000000001') || fetchedTeams[0];
      setTeam(myTeam);

      if (myTeam) {
        // Fetch members
        const membersData = await getTeamMembers(myTeam.TeamID);
        setMembers(membersData);

        // Fetch categories to get event
        const eventsData = await getEvents();
        const categoriesData = await getCategories();
        const category = categoriesData.find(c => c.CategoryID === myTeam.CategoryID);
        const myEvent = category ? eventsData.find(e => e.EventID === category.EventID) : null;
        setEvent(myEvent || null);

        if (myEvent) {
          const roundsData = await getRounds(myEvent.EventID);
          setRounds(roundsData);
        }

        // Fetch submissions
        const allSubs = await getSubmissions();
        const teamSubs = allSubs.filter(s => s.TeamID === myTeam.TeamID);
        setSubmissions(teamSubs);

        // Active round final submission
        const activeSub = teamSubs.find(s => s.RoundID === 'A0000000-0000-0000-0000-000000000003') || teamSubs[0];
        setCurrentSubmission(activeSub || null);

        if (activeSub) {
          setRepoUrl(activeSub.RepositoryURL);
          setDemoUrl(activeSub.DemoURL);
          setSlideUrl(activeSub.SlideURL);

          // Get scores
          const scoresData = await getScores(activeSub.SubmissionID);
          setScores(scoresData);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccessMessage('');
    // Simulate API update
    setTimeout(() => {
      setUpdating(false);
      setSuccessMessage('Cập nhật đường dẫn bài nộp dự án thành công!');
      // Update local state
      if (currentSubmission) {
        currentSubmission.RepositoryURL = repoUrl;
        currentSubmission.DemoURL = demoUrl;
        currentSubmission.SlideURL = slideUrl;
      }
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight dark:text-white">
            Cổng Trưởng Nhóm
          </h2>
          <p className="text-slate-500 text-xs mt-1 dark:text-slate-400 font-medium leading-relaxed">
            {team ? `Nhóm: ${team.TeamName}` : 'Đang tải thông tin...'} | Sự kiện: {event?.EventName || ''}
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
          
          {/* Submission Form Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Project Submission Box */}
            <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <FileCode2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Cổng nộp bài dự án
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 font-medium">
                      Nhập đường dẫn liên kết cho Vòng chung kết (Final Round).
                    </CardDescription>
                  </div>
                  {currentSubmission && (
                    <Badge className={
                      currentSubmission.Status === 'Graded'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400'
                        : 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400'
                    }>
                      {currentSubmission.Status === 'Graded' ? 'Đã chấm điểm' : 'Đã nộp bài'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">GitHub Repository URL</label>
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        className="rounded-xl h-10 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        required
                      />
                      {repoUrl && (
                        <a
                          href={repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 px-3 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 dark:border-slate-700"
                        >
                          <ExternalLink className="w-4 h-4 text-slate-500" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Video Demo URL</label>
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        className="rounded-xl h-10 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                        value={demoUrl}
                        onChange={(e) => setDemoUrl(e.target.value)}
                        required
                      />
                      {demoUrl && (
                        <a
                          href={demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 px-3 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 dark:border-slate-700"
                        >
                          <ExternalLink className="w-4 h-4 text-slate-500" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Slide Báo cáo URL</label>
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        className="rounded-xl h-10 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                        value={slideUrl}
                        onChange={(e) => setSlideUrl(e.target.value)}
                        required
                      />
                      {slideUrl && (
                        <a
                          href={slideUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 px-3 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 dark:border-slate-700"
                        >
                          <ExternalLink className="w-4 h-4 text-slate-500" />
                        </a>
                      )}
                    </div>
                  </div>

                  {successMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> {successMessage}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 font-bold px-5 text-xs transition-colors"
                      disabled={updating}
                    >
                      <Send className="w-3.5 h-3.5 mr-2" /> {updating ? 'Đang cập nhật...' : 'Cập nhật bài nộp'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Submissions History */}
            <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold">Lịch sử bài nộp qua các vòng</CardTitle>
                <CardDescription className="text-xs text-slate-400 font-medium">Danh sách các bài nộp đã ghi nhận trong sự kiện này.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="border border-slate-200 rounded-xl overflow-hidden dark:border-slate-800">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                      <TableRow className="border-slate-200 dark:border-slate-800">
                        <TableHead className="font-bold text-slate-700 text-xs uppercase dark:text-slate-300">Vòng thi</TableHead>
                        <TableHead className="font-bold text-slate-700 text-xs uppercase dark:text-slate-300">Thời gian</TableHead>
                        <TableHead className="font-bold text-slate-700 text-xs uppercase dark:text-slate-300">Tệp đính kèm</TableHead>
                        <TableHead className="font-bold text-slate-700 text-xs uppercase dark:text-slate-300 text-right">Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((sub) => {
                        const round = rounds.find(r => r.RoundID === sub.RoundID);
                        return (
                          <TableRow key={sub.SubmissionID} className="border-slate-100 dark:border-slate-800">
                            <TableCell className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                              {round?.RoundName || 'Vòng thi'}
                            </TableCell>
                            <TableCell className="text-slate-500 dark:text-slate-400 text-xs">
                              {sub.SubmittedAt}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <a href={sub.RepositoryURL} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-slate-100 rounded dark:hover:bg-slate-800" title="Source code">
                                  <FileCode2 className="w-4 h-4 text-slate-500" />
                                </a>
                                <a href={sub.DemoURL} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-slate-100 rounded dark:hover:bg-slate-800" title="Demo Video">
                                  <Video className="w-4 h-4 text-rose-500" />
                                </a>
                                <a href={sub.SlideURL} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-slate-100 rounded dark:hover:bg-slate-800" title="Slides">
                                  <FileText className="w-4 h-4 text-indigo-500" />
                                </a>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge className={
                                sub.Status === 'Graded'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 text-[10px]'
                                  : 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 text-[10px]'
                              }>
                                {sub.Status === 'Graded' ? 'Đã chấm' : 'Đã nộp'}
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

          {/* Right Column: Score & Members */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Scorecard Box */}
            <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Bảng điểm đánh giá
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 font-medium">Kết quả chấm điểm chi tiết của Ban giám khảo.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                {scores.length === 0 ? (
                  <div className="text-slate-400 text-xs text-center py-6 bg-slate-50 rounded-xl dark:bg-slate-950">
                    <Info className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                    Chưa có điểm đánh giá cho bài nộp hiện tại.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scores.map((sc) => (
                      <div key={sc.ScoreID} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 flex justify-between items-start gap-4">
                        <div className="space-y-0.5">
                          <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                            {sc.Criteria.CriteriaName}
                          </h5>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                            N/X: "{sc.Comment}"
                          </p>
                        </div>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                          {sc.ScoreValue.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Members List */}
            <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Thành viên nhóm ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                {members.map((memb) => (
                  <div key={memb.TeamMemberId} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{memb.User.FullName}</span>
                        {memb.User.UserID === team?.TeamLeaderId && (
                          <Badge className="bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0">Lead</Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{memb.User.Email}</p>
                    </div>
                    {memb.StudentProfile && (
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{memb.StudentProfile.StudentCode}</p>
                        <p className="text-[9px] text-slate-400 font-semibold">{memb.StudentProfile.UniversityName}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>

        </div>
      )}
    </div>
  );
}
