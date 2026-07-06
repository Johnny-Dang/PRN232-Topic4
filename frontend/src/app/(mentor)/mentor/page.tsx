'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  FileCode2,
  FileText,
  Info,
  MessageSquare,
  RefreshCw,
  Send,
  Users,
  Video,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  approveCategoryMentorApi,
  getMentorAssignmentsApi,
  getMentorCategoriesApi,
  getMentorSubmissionsApi,
  getMentorTeamsApi,
  rejectCategoryMentorApi,
} from '@/services/api/mentor';
import type { CategoryMentor, MentorCategory, MentorSubmission, MentorTeam } from '@/services/types/mentor';

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error !== 'object' || error === null || !('response' in error)) return fallback;

  const response = (error as { response?: { data?: { message?: string } } }).response;
  return response?.data?.message || fallback;
};

const getStoredUserId = (): string => {
  if (typeof window === 'undefined') return '';

  const storedUser = localStorage.getItem('seal_user');
  if (!storedUser) return '';

  try {
    const parsed = JSON.parse(storedUser) as Record<string, unknown>;
    const userId = parsed.UserID || parsed.UserId || parsed.userId;
    return typeof userId === 'string' ? userId : '';
  } catch {
    return '';
  }
};

const getStoredUserShortId = (): string => {
  if (typeof window === 'undefined') return '';

  const storedUser = localStorage.getItem('seal_user');
  if (!storedUser) return '';

  try {
    const parsed = JSON.parse(storedUser) as Record<string, unknown>;
    const shortId = parsed.ShortId || parsed.shortId;
    return typeof shortId === 'string' ? shortId : '';
  } catch {
    return '';
  }
};

const getAssignmentStatusClass = (status: CategoryMentor['Status']): string => {
  if (status === 'Approved') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (status === 'Rejected') return 'bg-rose-50 text-rose-700 border-rose-100';
  return 'bg-amber-50 text-amber-700 border-amber-100';
};

const formatDate = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Chưa có ngày' : date.toLocaleString('vi-VN');
};

function MentorDashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'assignments';

  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentUserShortId, setCurrentUserShortId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [assignments, setAssignments] = useState<CategoryMentor[]>([]);
  const [categories, setCategories] = useState<MentorCategory[]>([]);
  const [teams, setTeams] = useState<MentorTeam[]>([]);
  const [submissions, setSubmissions] = useState<MentorSubmission[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    setCurrentUserId(getStoredUserId());
    setCurrentUserShortId(getStoredUserShortId());

    try {
      const [fetchedAssignments, fetchedCategories, fetchedTeams, fetchedSubmissions] = await Promise.all([
        getMentorAssignmentsApi(),
        getMentorCategoriesApi(),
        getMentorTeamsApi(),
        getMentorSubmissionsApi(),
      ]);

      setAssignments(fetchedAssignments);
      setCategories(fetchedCategories);
      setTeams(fetchedTeams);
      setSubmissions(fetchedSubmissions);
      setSelectedTeamId((current) => current || fetchedTeams[0]?.TeamId || '');
    } catch (loadError: unknown) {
      console.error(loadError);
      setError(getApiErrorMessage(loadError, 'Không thể tải dữ liệu Mentor từ API.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, []);

  const handleAssignmentDecision = async (categoryMentorId: string, decision: 'approve' | 'reject') => {
    setActionId(categoryMentorId);
    setError('');
    setMessage('');

    try {
      await (decision === 'approve'
        ? approveCategoryMentorApi(categoryMentorId)
        : rejectCategoryMentorApi(categoryMentorId));

      setMessage(decision === 'approve' ? 'Đã chấp thuận phân công Mentor.' : 'Đã từ chối phân công Mentor.');
      await loadData();
    } catch (actionError: unknown) {
      console.error(actionError);
      setError(getApiErrorMessage(actionError, 'Không thể cập nhật trạng thái phân công Mentor.'));
    } finally {
      setActionId('');
    }
  };

  const handleSendFeedback = (event: React.FormEvent) => {
    event.preventDefault();
    if (!feedbackText.trim() || !selectedTeamId) return;

    setSubmittingFeedback(true);
    setMessage('Backend chưa có API gửi feedback Mentor, nên frontend chưa tạo dữ liệu mới.');
    setSubmittingFeedback(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Cổng Cố Vấn Học Thuật
          </h2>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            Nhận phân công Category, theo dõi đội thi và xem bài nộp từ API backend.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-slate-200 text-xs font-semibold"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Tải lại dữ liệu
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
          {message}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-44 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-56 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : (
        <div className="w-full space-y-6">
          {activeTab === 'assignments' && (
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  Yêu cầu phân công
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Xác nhận hoặc từ chối đề xuất phụ trách Category từ Coordinator.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-0">
                {currentUserId && (
                  <div className="truncate font-mono text-[10px] text-slate-400">
                    Mentor Code: {currentUserShortId || currentUserId}
                  </div>
                )}
                {assignments.length === 0 ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                    Chưa có yêu cầu phân công từ API.
                  </div>
                ) : (
                  assignments.map((assignment) => (
                    <div
                      key={assignment.CategoryMentorId}
                      className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h5 className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                            {assignment.CategoryName || assignment.CategoryId}
                          </h5>
                          <span className="block truncate font-mono text-[10px] text-slate-400">
                            {assignment.CategoryMentorId}
                          </span>
                        </div>
                        <Badge className={`border text-[9px] font-extrabold ${getAssignmentStatusClass(assignment.Status)}`}>
                          {assignment.Status}
                        </Badge>
                      </div>

                      {assignment.Status === 'Pending' && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                            disabled={actionId === assignment.CategoryMentorId}
                            onClick={() => void handleAssignmentDecision(assignment.CategoryMentorId, 'approve')}
                          >
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            Đồng ý
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="rounded-xl text-xs font-bold"
                            disabled={actionId === assignment.CategoryMentorId}
                            onClick={() => void handleAssignmentDecision(assignment.CategoryMentorId, 'reject')}
                          >
                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'categories' && (
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Hạng mục phụ trách
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Chỉ hiển thị Category đã được Mentor chấp thuận.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-6 pt-0">
                {categories.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-3 text-xs font-medium text-slate-500 dark:bg-slate-950">
                    Chưa có Category đã được phân công.
                  </div>
                ) : (
                  categories.map((category) => (
                    <div
                      key={category.CategoryId}
                      className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50"
                    >
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{category.CategoryName}</h5>
                      <span className="text-[10px] font-semibold uppercase text-slate-400">
                        {category.EventName || category.EventId}
                      </span>
                      {category.Description && (
                        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                          {category.Description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'submissions' && (
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <FileCode2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Bài nộp của các nhóm phụ trách
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Danh sách bài nộp thuộc các Category đã được Mentor chấp thuận.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {submissions.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-4 text-center text-xs font-medium text-slate-500 dark:bg-slate-950">
                    Chưa có bài nộp thuộc Category được phân công.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                          <TableHead className="text-xs font-bold uppercase text-slate-700">Đội thi</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-slate-700">Category</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-slate-700">Vòng</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-slate-700">Nộp lúc</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-slate-700">Liên kết</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.map((submission) => (
                          <TableRow key={submission.SubmissionId}>
                            <TableCell className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {submission.TeamName}
                            </TableCell>
                            <TableCell className="text-xs font-medium text-slate-500">{submission.CategoryName}</TableCell>
                            <TableCell className="text-xs font-medium text-slate-500">{submission.RoundName}</TableCell>
                            <TableCell className="text-[10px] text-slate-500 dark:text-slate-400">
                              {formatDate(submission.SubmittedAt)}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-2">
                                {submission.RepositoryURL && (
                                  <a
                                    href={submission.RepositoryURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-[10px] font-bold hover:bg-slate-50 dark:border-slate-700"
                                  >
                                    <FileCode2 className="h-3.5 w-3.5 text-slate-500" />
                                    Code
                                  </a>
                                )}
                                {submission.DemoURL && (
                                  <a
                                    href={submission.DemoURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-[10px] font-bold text-rose-600 hover:bg-slate-50 dark:border-slate-700"
                                  >
                                    <Video className="h-3.5 w-3.5" />
                                    Video
                                  </a>
                                )}
                                {submission.SlideURL && (
                                  <a
                                    href={submission.SlideURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-[10px] font-bold hover:bg-slate-50 dark:border-slate-700"
                                  >
                                    <FileText className="h-3.5 w-3.5 text-indigo-500" />
                                    Slide
                                  </a>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'feedback-form' && (
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Gửi phản hồi / Góp ý
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Backend hiện chưa có API lưu feedback Mentor, nên form chỉ kiểm tra dữ liệu thật của đội.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <form onSubmit={handleSendFeedback} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="mentor-feedback-team" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Chọn đội thi</label>
                    <select
                      id="mentor-feedback-team"
                      aria-label="Chọn đội thi để gửi phản hồi"
                      title="Chọn đội thi để gửi phản hồi"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                      value={selectedTeamId}
                      onChange={(event) => setSelectedTeamId(event.target.value)}
                      disabled={teams.length === 0}
                    >
                      {teams.length === 0 ? (
                        <option value="">Chưa có đội được phân công</option>
                      ) : (
                        teams.map((team) => (
                          <option key={team.TeamId} value={team.TeamId}>
                            {team.TeamName} - {team.CategoryName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="mentor-feedback-text" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Nội dung tư vấn / Nhận xét
                    </label>
                    <textarea
                      id="mentor-feedback-text"
                      aria-label="Nội dung tư vấn hoặc nhận xét"
                      title="Nội dung tư vấn hoặc nhận xét"
                      rows={4}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                      value={feedbackText}
                      onChange={(event) => setFeedbackText(event.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="h-10 rounded-xl bg-sky-600 px-5 text-xs font-bold text-white transition-colors hover:bg-sky-700"
                      disabled={submittingFeedback || teams.length === 0}
                    >
                      <Send className="mr-2 h-3.5 w-3.5" />
                      {submittingFeedback ? 'Đang gửi...' : 'Kiểm tra API feedback'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'feedback-logs' && (
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Nhật ký góp ý của bạn
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Không hiển thị dữ liệu mẫu khi backend chưa có API feedback.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                  Chưa có API lịch sử feedback Mentor.
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'teams' && (
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Đội thi phụ trách
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Các đội thuộc Category đã được Mentor chấp thuận.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-6 pt-0">
                {teams.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-3 text-xs font-medium text-slate-500 dark:bg-slate-950">
                    Chưa có đội thi thuộc Category phụ trách.
                  </div>
                ) : (
                  teams.map((team) => (
                    <div
                      key={team.TeamId}
                      className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{team.TeamName}</h5>
                          <p className="text-[10px] font-semibold uppercase text-slate-400">{team.CategoryName}</p>
                        </div>
                        <Badge className="border bg-slate-100 text-[9px] font-extrabold text-slate-600">
                          {team.TeamStatus}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function MentorPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/3 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-44 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-56 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      }
    >
      <MentorDashboardContent />
    </Suspense>
  );
}
