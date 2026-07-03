'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw, Send, CheckCircle2, Video, FileCode2, FileText, Info, XCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategoriesApi } from '@/services/api/competition';
import { approveCategoryMentorApi, getCategoryMentorsApi, rejectCategoryMentorApi } from '@/services/api/mentor';
import type { Category as FlowCategory } from '@/services/types/competition';
import type { CategoryMentor } from '@/services/types/mentor';

import {
  getTeams,
  getSubmissions,
  getCategories,
  getEvents,
  Team,
  Submission,
  Category,
  Event as ApiEvent
} from '@/lib/api';

const getStringProperty = (value: unknown, keys: string[]): string | null => {
  if (typeof value !== 'object' || value === null) return null;

  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const property = record[key];
    if (typeof property === 'string' && property.trim()) {
      return property;
    }
  }

  return null;
};

const getStoredUserId = (): string | null => {
  if (typeof window === 'undefined') return null;

  const storedUser = localStorage.getItem('seal_user');
  if (!storedUser) return null;

  try {
    const parsed = JSON.parse(storedUser) as unknown;
    return getStringProperty(parsed, ['UserID', 'UserId', 'userId']);
  } catch (error) {
    console.error('Cannot parse seal_user from localStorage:', error);
    return null;
  }
};

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return fallback;
  }

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

interface FeedbackLog {
  id: string;
  teamName: string;
  comment: string;
  date: string;
}

export default function MentorPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [assignmentMessage, setAssignmentMessage] = useState<string>('');
  const [assignmentError, setAssignmentError] = useState<string>('');
  const [assignmentActionId, setAssignmentActionId] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Form states
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState<string>('');

  // Loaded states
  const [assignedCategories, setAssignedCategories] = useState<Category[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [submissions, setSubmissions] = useState<(Submission & { Team: Team })[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [flowCategories, setFlowCategories] = useState<FlowCategory[]>([]);
  const [categoryMentorAssignments, setCategoryMentorAssignments] = useState<CategoryMentor[]>([]);

  // Local feedback log
  const [feedbackLogs, setFeedbackLogs] = useState<FeedbackLog[]>([
    { id: '1', teamName: 'Phoenix AI', comment: 'Đề án AI thiết kế tốt, cần chú ý hiệu năng xử lý ảnh thời gian thực.', date: '2026-03-18 10:00' },
    { id: '2', teamName: 'Beta Coders', comment: 'Hệ thống Web đáp ứng tốt các yêu cầu Agile, giao diện thiết kế theo Skeletal khá mượt.', date: '2026-03-18 11:30' }
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const storedUserId = getStoredUserId();
      setCurrentUserId(storedUserId ?? '');

      const fetchedEvents = await getEvents();
      setEvents(fetchedEvents);

      // Mentor Phạm Văn Tùng (00000000-0000-0000-0000-000000000009)
      // Assigned Categories: Web Application (C0000000-0000-0000-0000-000000000001) & AI Solution (C0000000-0000-0000-0000-000000000003)
      const fetchedCategories = await getCategories();
      let myCats = fetchedCategories.filter(c => 
        c.CategoryID === 'C0000000-0000-0000-0000-000000000001' || 
        c.CategoryID === 'C0000000-0000-0000-0000-000000000003'
      );

      try {
        const [fetchedFlowCategories, fetchedAssignments] = await Promise.all([
          getCategoriesApi(),
          getCategoryMentorsApi(),
        ]);
        const visibleAssignments = storedUserId
          ? fetchedAssignments.filter((assignment) => assignment.UserId.toLowerCase() === storedUserId.toLowerCase())
          : fetchedAssignments;
        const approvedCategoryIds = new Set(
          visibleAssignments
            .filter((assignment) => assignment.Status === 'Approved')
            .map((assignment) => assignment.CategoryId.toLowerCase())
        );

        setFlowCategories(fetchedFlowCategories);
        setCategoryMentorAssignments(visibleAssignments);

        if (approvedCategoryIds.size > 0) {
          myCats = fetchedCategories.filter((category) => approvedCategoryIds.has(category.CategoryID.toLowerCase()));
        }
      } catch (flowError) {
        console.error('Cannot load mentor assignment workflow data:', flowError);
      }

      setAssignedCategories(myCats);

      const fetchedTeams = await getTeams();
      // Filter teams belonging to my categories
      const myTeams = fetchedTeams.filter(t => myCats.some(c => c.CategoryID === t.CategoryID));
      setTeams(myTeams);
      if (myTeams.length > 0) {
        setSelectedTeamId(myTeams[0].TeamID);
      }

      const allSubs = await getSubmissions();
      // Filter submissions belonging to my categories
      const mySubs = allSubs.filter(s => myTeams.some(t => t.TeamID === s.TeamID));
      setSubmissions(mySubs);
    } catch (e) {
      console.error(e);
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
      const updatedAssignment = decision === 'approve'
        ? await approveCategoryMentorApi(categoryMentorId)
        : await rejectCategoryMentorApi(categoryMentorId);

      setCategoryMentorAssignments((current) =>
        current.map((assignment) =>
          assignment.CategoryMentorId === updatedAssignment.CategoryMentorId ? updatedAssignment : assignment
        )
      );
      if (updatedAssignment.Status === 'Approved') {
        const approvedCategory = flowCategories.find(
          (category) => category.CategoryId === updatedAssignment.CategoryId
        );
        if (approvedCategory) {
          setAssignedCategories((current) => {
            if (current.some((category) => category.CategoryID === approvedCategory.CategoryId)) {
              return current;
            }

            return [
              ...current,
              {
                CategoryID: approvedCategory.CategoryId,
                EventID: approvedCategory.EventId,
                CategoryName: approvedCategory.CategoryName,
                Description: approvedCategory.Description,
              },
            ];
          });
        }
      }
      setAssignmentMessage(
        decision === 'approve'
          ? 'Đã chấp thuận phân công Mentor.'
          : 'Đã từ chối phân công Mentor.'
      );
    } catch (error: unknown) {
      console.error(error);
      setAssignmentError(getApiErrorMessage(error, 'Không thể cập nhật trạng thái phân công Mentor.'));
    } finally {
      setAssignmentActionId('');
    }
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || !selectedTeamId) return;

    setSubmitting(true);
    setSuccessMessage('');

    setTimeout(() => {
      const targetTeam = teams.find(t => t.TeamID === selectedTeamId);
      const newLog = {
        id: Date.now().toString(),
        teamName: targetTeam ? targetTeam.TeamName : 'Đội thi',
        comment: feedbackText,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      setFeedbackLogs([newLog, ...feedbackLogs]);
      setFeedbackText('');
      setSubmitting(false);
      setSuccessMessage('Gửi ý kiến phản hồi đến đội thi thành công!');
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight dark:text-white">
            Cổng Cố Vấn Học Thuật (Mentor Portal)
          </h2>
          <p className="text-slate-500 text-xs mt-1 dark:text-slate-400 font-medium leading-relaxed">
            Xem danh sách bài nộp, mã nguồn dự án và hỗ trợ phản hồi chuyên môn cho các nhóm.
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
          
          {/* Left panel: List categories & feedback form */}
          <div className="lg:col-span-1 space-y-6">

            <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" /> Yêu cầu phân công
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 font-medium">
                  Xác nhận hoặc từ chối đề xuất phụ trách Category từ Coordinator.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                {currentUserId && (
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    Mentor ID: {currentUserId}
                  </div>
                )}

                {assignmentError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-medium">
                    {assignmentError}
                  </div>
                )}

                {assignmentMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-medium">
                    {assignmentMessage}
                  </div>
                )}

                {categoryMentorAssignments.length === 0 ? (
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-500 font-medium dark:border-slate-800 dark:bg-slate-950">
                    Chưa có yêu cầu phân công từ API.
                  </div>
                ) : (
                  categoryMentorAssignments.map((assignment) => (
                    <div key={assignment.CategoryMentorId} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                            {getCategoryName(flowCategories, assignment.CategoryId)}
                          </h5>
                          <span className="text-[10px] text-slate-400 font-mono truncate block">
                            {assignment.CategoryMentorId}
                          </span>
                        </div>
                        <Badge className={`text-[9px] font-extrabold border ${getAssignmentStatusClass(assignment.Status)}`}>
                          {assignment.Status}
                        </Badge>
                      </div>

                      {assignment.Status === 'Pending' && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                            disabled={assignmentActionId === assignment.CategoryMentorId}
                            onClick={() => void handleAssignmentDecision(assignment.CategoryMentorId, 'approve')}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Đồng ý
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="rounded-xl text-xs font-bold"
                            disabled={assignmentActionId === assignment.CategoryMentorId}
                            onClick={() => void handleAssignmentDecision(assignment.CategoryMentorId, 'reject')}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1.5" /> Từ chối
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            
            {/* Assigned categories */}
            <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold">Hạng mục phụ trách</CardTitle>
                <CardDescription className="text-xs text-slate-400 font-medium">Hạng mục cố vấn được phân công trong sự kiện.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                {assignedCategories.map((cat) => {
                  const event = events.find(e => e.EventID === cat.EventID);
                  return (
                    <div key={cat.CategoryID} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs">{cat.CategoryName}</h5>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">{event?.EventName || ''}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Write feedback form */}
            <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Gửi phản hồi / Góp ý
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 font-medium">Nhập nhận xét hướng dẫn gửi trực tiếp cho đội thi.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <form onSubmit={handleSendFeedback} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Chọn đội thi</label>
                    <select
                      id="mentor-feedback-team"
                      aria-label="Chọn đội thi để gửi phản hồi"
                      title="Chọn đội thi để gửi phản hồi"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none dark:bg-slate-800 dark:border-slate-700"
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                    >
                      {teams.map((t) => (
                        <option key={t.TeamID} value={t.TeamID}>
                          {t.TeamName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Nội dung tư vấn / Nhận xét</label>
                    <textarea
                      rows={4}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-none dark:bg-slate-800 dark:border-slate-700"
                      placeholder="Nhập hướng dẫn về công nghệ, thuật toán hoặc thiết kế giao diện..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      required
                    />
                  </div>

                  {successMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {successMessage}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl h-10 font-bold px-5 text-xs transition-colors dark:bg-sky-600 dark:hover:bg-sky-700"
                      disabled={submitting}
                    >
                      <Send className="w-3.5 h-3.5 mr-2" /> {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

          </div>

          {/* Right panel: Submissions list & Feedback log history */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Project Submissions table */}
            <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold">Bài nộp của các nhóm phụ trách</CardTitle>
                <CardDescription className="text-xs text-slate-400 font-medium">
                  Truy cập GitHub và Video để cố vấn định hướng kịp thời.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="border border-slate-200 rounded-xl overflow-hidden dark:border-slate-800">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                      <TableRow className="border-slate-200 dark:border-slate-800">
                        <TableHead className="font-bold text-slate-700 text-xs uppercase dark:text-slate-300">Tên Đội</TableHead>
                        <TableHead className="font-bold text-slate-700 text-xs uppercase dark:text-slate-300">Nộp lúc</TableHead>
                        <TableHead className="font-bold text-slate-700 text-xs uppercase dark:text-slate-300">Liên kết dự án</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((sub) => (
                        <TableRow key={sub.SubmissionID} className="border-slate-100 dark:border-slate-800">
                          <TableCell className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                            {sub.Team.TeamName}
                          </TableCell>
                          <TableCell className="text-slate-500 dark:text-slate-400 text-[10px]">
                            {sub.SubmittedAt}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {sub.RepositoryURL && (
                                <a
                                  href={sub.RepositoryURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-8 px-2.5 rounded-lg border border-slate-200 text-[10px] font-bold flex items-center gap-1 hover:bg-slate-50 dark:border-slate-700"
                                >
                                  <FileCode2 className="w-3.5 h-3.5 text-slate-500" /> Code
                                </a>
                              )}
                              {sub.DemoURL && (
                                <a
                                  href={sub.DemoURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-8 px-2.5 rounded-lg border border-slate-200 text-[10px] font-bold flex items-center gap-1 hover:bg-slate-50 dark:border-slate-700 text-rose-600"
                                >
                                  <Video className="w-3.5 h-3.5" /> Video
                                </a>
                              )}
                              {sub.SlideURL && (
                                <a
                                  href={sub.SlideURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-8 px-2.5 rounded-lg border border-slate-200 text-[10px] font-bold flex items-center gap-1 hover:bg-slate-50 dark:border-slate-700"
                                >
                                  <FileText className="w-3.5 h-3.5 text-indigo-500" /> Slide
                                </a>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Feedback History Logs */}
            <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Nhật ký góp ý của bạn
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 font-medium">Lịch sử các phản hồi bạn đã gửi cho các nhóm.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="relative pl-6 border-l border-slate-200 space-y-5 dark:border-slate-700">
                  {feedbackLogs.map((log) => (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-sky-500 ring-4 ring-slate-50 dark:border-slate-900 dark:ring-slate-900" />
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Nhận xét gửi nhóm {log.teamName}
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed font-medium">
                            {log.comment}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold self-start md:self-center shrink-0">
                          {log.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      )}
    </div>
  );
}
