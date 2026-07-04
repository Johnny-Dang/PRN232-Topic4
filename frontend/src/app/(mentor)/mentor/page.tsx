'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  FileCode2,
  FileText,
  Info,
  MessageSquare,
  RefreshCw,
  Send,
  Video,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCategoriesApi } from '@/services/api/competition';
import { approveCategoryMentorApi, getCategoryMentorsApi, rejectCategoryMentorApi } from '@/services/api/mentor';
import type { Category as FlowCategory } from '@/services/types/competition';
import type { CategoryMentor } from '@/services/types/mentor';
import { getCategories, getEvents, getSubmissions, getTeams, Category, Event as ApiEvent, Submission, Team } from '@/lib/api';

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

const getAssignmentStatusClass = (status: CategoryMentor['Status']): string => {
  if (status === 'Approved') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (status === 'Rejected') return 'bg-rose-50 text-rose-700 border-rose-100';
  return 'bg-amber-50 text-amber-700 border-amber-100';
};

const getCategoryName = (categories: FlowCategory[], categoryId: string): string => {
  return categories.find((category) => category.CategoryId === categoryId)?.CategoryName || categoryId.substring(0, 8);
};

export default function MentorPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [assignmentMessage, setAssignmentMessage] = useState('');
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentActionId, setAssignmentActionId] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [feedbackText, setFeedbackText] = useState('');

  const [assignedCategories, setAssignedCategories] = useState<Category[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [submissions, setSubmissions] = useState<(Submission & { Team: Team })[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [flowCategories, setFlowCategories] = useState<FlowCategory[]>([]);
  const [categoryMentorAssignments, setCategoryMentorAssignments] = useState<CategoryMentor[]>([]);

  const loadData = async () => {
    setLoading(true);
    setAssignmentError('');

    try {
      const storedUserId = getStoredUserId();
      setCurrentUserId(storedUserId ?? '');

      const [fetchedEvents, fetchedCategories, fetchedTeams, allSubmissions] = await Promise.all([
        getEvents(),
        getCategories(),
        getTeams(),
        getSubmissions(),
      ]);
      setEvents(fetchedEvents);

      let visibleAssignments: CategoryMentor[] = [];
      let fetchedFlowCategories: FlowCategory[] = [];

      try {
        [fetchedFlowCategories, visibleAssignments] = await Promise.all([getCategoriesApi(), getCategoryMentorsApi()]);
        visibleAssignments = storedUserId
          ? visibleAssignments.filter((assignment) => assignment.UserId.toLowerCase() === storedUserId.toLowerCase())
          : visibleAssignments;

        setFlowCategories(fetchedFlowCategories);
        setCategoryMentorAssignments(visibleAssignments);
      } catch (flowError) {
        console.error('Cannot load mentor assignment workflow data:', flowError);
        setFlowCategories([]);
        setCategoryMentorAssignments([]);
      }

      const approvedCategoryIds = new Set(
        visibleAssignments
          .filter((assignment) => assignment.Status === 'Approved')
          .map((assignment) => assignment.CategoryId.toLowerCase())
      );
      const myCategories = fetchedCategories.filter((category) => approvedCategoryIds.has(category.CategoryID.toLowerCase()));
      const myTeams = fetchedTeams.filter((team) =>
        myCategories.some((category) => category.CategoryID === team.CategoryID)
      );
      const mySubmissions = allSubmissions.filter((submission) =>
        myTeams.some((team) => team.TeamID === submission.TeamID)
      );

      setAssignedCategories(myCategories);
      setTeams(myTeams);
      setSubmissions(mySubmissions);
      setSelectedTeamId(myTeams[0]?.TeamID || '');
    } catch (error) {
      console.error(error);
      setAssignmentError('Không thể tải dữ liệu Mentor từ API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, []);

  const handleAssignmentDecision = async (categoryMentorId: string, decision: 'approve' | 'reject') => {
    setAssignmentActionId(categoryMentorId);
    setAssignmentMessage('');
    setAssignmentError('');

    try {
      const updatedAssignment =
        decision === 'approve'
          ? await approveCategoryMentorApi(categoryMentorId)
          : await rejectCategoryMentorApi(categoryMentorId);

      setCategoryMentorAssignments((current) =>
        current.map((assignment) =>
          assignment.CategoryMentorId === updatedAssignment.CategoryMentorId ? updatedAssignment : assignment
        )
      );
      setAssignmentMessage(decision === 'approve' ? 'Đã chấp thuận phân công Mentor.' : 'Đã từ chối phân công Mentor.');
      await loadData();
    } catch (error: unknown) {
      console.error(error);
      setAssignmentError(getApiErrorMessage(error, 'Không thể cập nhật trạng thái phân công Mentor.'));
    } finally {
      setAssignmentActionId('');
    }
  };

  const handleSendFeedback = (event: React.FormEvent) => {
    event.preventDefault();
    if (!feedbackText.trim() || !selectedTeamId) return;

    setSubmitting(true);
    setSuccessMessage('Backend chưa có API gửi feedback Mentor, nên frontend không tạo log giả.');
    setSubmitting(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Cổng Cố Vấn Học Thuật (Mentor Portal)
          </h2>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            Xem bài nộp, nhận phân công category và hỗ trợ nhóm theo dữ liệu API.
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
          <div className="space-y-6 lg:col-span-1">
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" /> Yêu cầu phân công
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Xác nhận hoặc từ chối đề xuất phụ trách Category từ Coordinator.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-0">
                {currentUserId && <div className="truncate font-mono text-[10px] text-slate-400">Mentor ID: {currentUserId}</div>}
                {assignmentError && (
                  <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                    {assignmentError}
                  </div>
                )}
                {assignmentMessage && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
                    {assignmentMessage}
                  </div>
                )}

                {categoryMentorAssignments.length === 0 ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                    Chưa có yêu cầu phân công từ API.
                  </div>
                ) : (
                  categoryMentorAssignments.map((assignment) => (
                    <div key={assignment.CategoryMentorId} className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h5 className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                            {getCategoryName(flowCategories, assignment.CategoryId)}
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
                            disabled={assignmentActionId === assignment.CategoryMentorId}
                            onClick={() => void handleAssignmentDecision(assignment.CategoryMentorId, 'approve')}
                          >
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Đồng ý
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="rounded-xl text-xs font-bold"
                            disabled={assignmentActionId === assignment.CategoryMentorId}
                            onClick={() => void handleAssignmentDecision(assignment.CategoryMentorId, 'reject')}
                          >
                            <XCircle className="mr-1.5 h-3.5 w-3.5" /> Từ chối
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-base font-bold">Hạng mục phụ trách</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Chỉ hiển thị category đã được phê duyệt từ API.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-6 pt-0">
                {assignedCategories.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-3 text-xs font-medium text-slate-500 dark:bg-slate-950">
                    Chưa có category được phân công.
                  </div>
                ) : (
                  assignedCategories.map((category) => {
                    const event = events.find((item) => item.EventID === category.EventID);
                    return (
                      <div key={category.CategoryID} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{category.CategoryName}</h5>
                        <span className="text-[10px] font-semibold uppercase text-slate-400">{event?.EventName || ''}</span>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Gửi phản hồi / Góp ý
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Form này đang chờ backend bổ sung API gửi feedback.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <form onSubmit={handleSendFeedback} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Chọn đội thi</label>
                    <select
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                      value={selectedTeamId}
                      onChange={(event) => setSelectedTeamId(event.target.value)}
                      disabled={teams.length === 0}
                    >
                      {teams.length === 0 ? (
                        <option value="">Chưa có đội được phân công</option>
                      ) : (
                        teams.map((team) => (
                          <option key={team.TeamID} value={team.TeamID}>
                            {team.TeamName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Nội dung tư vấn / Nhận xét
                    </label>
                    <textarea
                      rows={4}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                      value={feedbackText}
                      onChange={(event) => setFeedbackText(event.target.value)}
                    />
                  </div>
                  {successMessage && (
                    <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs font-medium text-amber-700">
                      <Info className="h-4 w-4 text-amber-600" /> {successMessage}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="h-10 rounded-xl bg-sky-600 px-5 text-xs font-bold text-white transition-colors hover:bg-sky-700"
                      disabled={submitting || teams.length === 0}
                    >
                      <Send className="mr-2 h-3.5 w-3.5" /> {submitting ? 'Đang gửi...' : 'Kiểm tra API feedback'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-base font-bold">Bài nộp của các nhóm phụ trách</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Truy cập GitHub, video và slide từ API Submissions.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {submissions.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-4 text-center text-xs font-medium text-slate-500 dark:bg-slate-950">
                    Chưa có bài nộp thuộc category được phân công.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                          <TableHead className="text-xs font-bold uppercase text-slate-700">Tên đội</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-slate-700">Nộp lúc</TableHead>
                          <TableHead className="text-xs font-bold uppercase text-slate-700">Liên kết dự án</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.map((submission) => (
                          <TableRow key={submission.SubmissionID}>
                            <TableCell className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {submission.Team.TeamName}
                            </TableCell>
                            <TableCell className="text-[10px] text-slate-500 dark:text-slate-400">
                              {submission.SubmittedAt}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {submission.RepositoryURL && (
                                  <a
                                    href={submission.RepositoryURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-[10px] font-bold hover:bg-slate-50 dark:border-slate-700"
                                  >
                                    <FileCode2 className="h-3.5 w-3.5 text-slate-500" /> Code
                                  </a>
                                )}
                                {submission.DemoURL && (
                                  <a
                                    href={submission.DemoURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-[10px] font-bold text-rose-600 hover:bg-slate-50 dark:border-slate-700"
                                  >
                                    <Video className="h-3.5 w-3.5" /> Video
                                  </a>
                                )}
                                {submission.SlideURL && (
                                  <a
                                    href={submission.SlideURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-[10px] font-bold hover:bg-slate-50 dark:border-slate-700"
                                  >
                                    <FileText className="h-3.5 w-3.5 text-indigo-500" /> Slide
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

            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Nhật ký góp ý của bạn
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
          </div>
        </div>
      )}
    </div>
  );
}
