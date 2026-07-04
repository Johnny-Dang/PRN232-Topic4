'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, ExternalLink, FileCode2, FileText, Info, RefreshCw, Send, Users, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  createSubmissionLinks,
  getCategories,
  getEvents,
  getRounds,
  getScores,
  getSubmissions,
  getTeamMembers,
  getTeams,
  updateSubmissionLinks,
  Event as ApiEvent,
  Round as ApiRound,
  Submission,
  Team,
} from '@/lib/api';

type TeamMemberWithProfile = Awaited<ReturnType<typeof getTeamMembers>>[number];
type ScoreWithDetails = Awaited<ReturnType<typeof getScores>>[number];
type SubmissionWithTeam = Submission & { Team: Team };

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

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error !== 'object' || error === null || !('response' in error)) return fallback;

  const response = (error as { response?: { data?: { message?: string } } }).response;
  return response?.data?.message || fallback;
};

const getSubmissionStatusLabel = (status: Submission['Status']): string => {
  if (status === 'Graded') return 'Đã chấm điểm';
  if (status === 'Updated') return 'Đã cập nhật';
  if (status === 'Disqualified') return 'Đã loại';
  return 'Đã nộp bài';
};

export default function LeaderPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [slideUrl, setSlideUrl] = useState('');

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMemberWithProfile[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionWithTeam[]>([]);
  const [currentSubmission, setCurrentSubmission] = useState<SubmissionWithTeam | null>(null);
  const [scores, setScores] = useState<ScoreWithDetails[]>([]);
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [rounds, setRounds] = useState<ApiRound[]>([]);

  const targetRound = useMemo(() => [...rounds].sort((a, b) => b.RoundOrder - a.RoundOrder)[0], [rounds]);

  const loadData = async () => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const currentUserId = getStoredUserId();
      const fetchedTeams = await getTeams();
      const myTeam = currentUserId
        ? fetchedTeams.find((item) => item.TeamLeaderId.toLowerCase() === currentUserId.toLowerCase())
        : undefined;

      setTeam(myTeam || null);
      setMembers([]);
      setSubmissions([]);
      setCurrentSubmission(null);
      setScores([]);
      setEvent(null);
      setRounds([]);
      setRepoUrl('');
      setDemoUrl('');
      setSlideUrl('');

      if (!myTeam) {
        setErrorMessage('Không tìm thấy đội gắn với tài khoản trưởng nhóm hiện tại.');
        return;
      }

      const [membersData, eventsData, categoriesData, allSubmissions] = await Promise.all([
        getTeamMembers(myTeam.TeamID),
        getEvents(),
        getCategories(),
        getSubmissions(),
      ]);

      const category = categoriesData.find((item) => item.CategoryID === myTeam.CategoryID);
      const myEvent = category ? eventsData.find((item) => item.EventID === category.EventID) : null;
      const roundsData = myEvent ? await getRounds(myEvent.EventID) : [];
      const teamSubmissions = allSubmissions.filter((item) => item.TeamID === myTeam.TeamID);
      const orderedRounds = [...roundsData].sort((a, b) => b.RoundOrder - a.RoundOrder);
      const activeSubmission =
        orderedRounds.map((round) => teamSubmissions.find((item) => item.RoundID === round.RoundID)).find(Boolean) ||
        [...teamSubmissions].sort(
          (a, b) => new Date(b.SubmittedAt).getTime() - new Date(a.SubmittedAt).getTime()
        )[0];

      setMembers(membersData);
      setEvent(myEvent || null);
      setRounds(roundsData);
      setSubmissions(teamSubmissions);
      setCurrentSubmission(activeSubmission || null);

      if (activeSubmission) {
        setRepoUrl(activeSubmission.RepositoryURL);
        setDemoUrl(activeSubmission.DemoURL);
        setSlideUrl(activeSubmission.SlideURL);
        setScores(await getScores(activeSubmission.SubmissionID));
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Không thể tải dữ liệu đội từ API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, []);

  const handleSubmit = async (eventForm: React.FormEvent) => {
    eventForm.preventDefault();
    if (!team) {
      setErrorMessage('Không tìm thấy đội gắn với tài khoản trưởng nhóm hiện tại.');
      return;
    }

    setUpdating(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const links = {
        RepositoryURL: repoUrl.trim(),
        DemoURL: demoUrl.trim(),
        SlideURL: slideUrl.trim(),
      };

      if (currentSubmission) {
        const updatedSubmission = await updateSubmissionLinks(currentSubmission.SubmissionID, links);
        if (updatedSubmission) {
          const submissionWithTeam = { ...updatedSubmission, Team: team };
          setCurrentSubmission(submissionWithTeam);
          setSubmissions((current) =>
            current.map((item) => (item.SubmissionID === updatedSubmission.SubmissionID ? submissionWithTeam : item))
          );
        }
        setSuccessMessage('Cập nhật đường dẫn bài nộp dự án thành công.');
      } else {
        if (!targetRound) {
          setErrorMessage('Chưa có vòng thi từ API để tạo bài nộp mới.');
          return;
        }

        const createdSubmission = await createSubmissionLinks(team.TeamID, targetRound.RoundID, links);
        if (createdSubmission) {
          const submissionWithTeam = { ...createdSubmission, Team: team };
          setCurrentSubmission(submissionWithTeam);
          setSubmissions((current) => [submissionWithTeam, ...current]);
        }
        setSuccessMessage('Tạo bài nộp dự án thành công.');
      }
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage(getApiErrorMessage(error, 'Không thể cập nhật bài nộp qua API.'));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Cổng Trưởng Nhóm</h2>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            {team ? `Nhóm: ${team.TeamName}` : 'Chưa tìm thấy đội'} | Sự kiện: {event?.EventName || 'Chưa có'}
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
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <FileCode2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Cổng nộp bài dự án
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-400">
                      Dữ liệu được gửi trực tiếp tới API Submissions.
                    </CardDescription>
                  </div>
                  {currentSubmission && (
                    <Badge className="border border-blue-100 bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                      {getSubmissionStatusLabel(currentSubmission.Status)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      GitHub Repository URL
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                        value={repoUrl}
                        onChange={(event) => setRepoUrl(event.target.value)}
                      />
                      {repoUrl && (
                        <a
                          href={repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 items-center justify-center rounded-xl border border-slate-200 px-3 hover:bg-slate-50 dark:border-slate-700"
                        >
                          <ExternalLink className="h-4 w-4 text-slate-500" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Video Demo URL
                    </label>
                    <Input
                      type="url"
                      className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                      value={demoUrl}
                      onChange={(event) => setDemoUrl(event.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Slide báo cáo URL
                    </label>
                    <Input
                      type="url"
                      className="h-10 rounded-xl border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                      value={slideUrl}
                      onChange={(event) => setSlideUrl(event.target.value)}
                    />
                  </div>

                  {successMessage && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
                      <CheckCircle className="h-4 w-4 text-emerald-600" /> {successMessage}
                    </div>
                  )}

                  {errorMessage && (
                    <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                      {errorMessage}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      className="h-10 rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                      disabled={updating || !team || (!currentSubmission && !targetRound)}
                    >
                      <Send className="mr-2 h-3.5 w-3.5" />
                      {updating ? 'Đang gửi...' : currentSubmission ? 'Cập nhật bài nộp' : 'Tạo bài nộp'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-base font-bold">Lịch sử bài nộp qua các vòng</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Danh sách bài nộp lấy từ API Submissions.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {submissions.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-4 text-center text-xs font-medium text-slate-500 dark:bg-slate-950">
                    Chưa có bài nộp từ API.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                          <TableHead className="text-xs font-bold uppercase text-slate-700">Vòng thi</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-slate-700">Thời gian</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-slate-700">Liên kết</TableHead>
                          <TableHead className="text-right text-xs font-bold uppercase text-slate-700">
                            Trạng thái
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.map((submission) => {
                          const round = rounds.find((item) => item.RoundID === submission.RoundID);
                          const hasLinks = submission.RepositoryURL || submission.DemoURL || submission.SlideURL;

                          return (
                            <TableRow key={submission.SubmissionID}>
                              <TableCell className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {round?.RoundName || 'Vòng thi'}
                              </TableCell>
                              <TableCell className="text-xs text-slate-500">{submission.SubmittedAt}</TableCell>
                              <TableCell>
                                {hasLinks ? (
                                  <div className="flex gap-2">
                                    {submission.RepositoryURL && (
                                      <a href={submission.RepositoryURL} target="_blank" rel="noopener noreferrer">
                                        <FileCode2 className="h-4 w-4 text-slate-500" />
                                      </a>
                                    )}
                                    {submission.DemoURL && (
                                      <a href={submission.DemoURL} target="_blank" rel="noopener noreferrer">
                                        <Video className="h-4 w-4 text-rose-500" />
                                      </a>
                                    )}
                                    {submission.SlideURL && (
                                      <a href={submission.SlideURL} target="_blank" rel="noopener noreferrer">
                                        <FileText className="h-4 w-4 text-indigo-500" />
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400">Chưa có liên kết</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge className="border border-blue-100 bg-blue-50 text-[10px] text-blue-600">
                                  {getSubmissionStatusLabel(submission.Status)}
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
                  <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Bảng điểm đánh giá
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Điểm chi tiết của bài nộp hiện tại.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-0">
                {scores.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 py-6 text-center text-xs text-slate-400 dark:bg-slate-950">
                    <Info className="mx-auto mb-1 h-6 w-6 text-slate-300" />
                    Chưa có điểm đánh giá từ API.
                  </div>
                ) : (
                  scores.map((score) => (
                    <div
                      key={score.ScoreID}
                      className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {score.Criteria.CriteriaName}
                        </h5>
                        <p className="text-[10px] leading-normal text-slate-400">N/X: &quot;{score.Comment}&quot;</p>
                      </div>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {score.ScoreValue.toFixed(1)}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Thành viên nhóm ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6 pt-0">
                {members.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-3 text-xs font-medium text-slate-500 dark:bg-slate-950">
                    Chưa có API trả về danh sách thành viên.
                  </div>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.TeamMemberId}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {member.User.FullName}
                        </span>
                        <p className="text-[10px] text-slate-400">{member.User.Email}</p>
                      </div>
                      {member.User.UserID === team?.TeamLeaderId && (
                        <Badge className="bg-indigo-600 px-1.5 py-0 text-[8px] font-bold text-white">Lead</Badge>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
