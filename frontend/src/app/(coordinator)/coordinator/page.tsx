'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Activity, Trash2, GitCompare, AlertTriangle, Send, UserPlus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategoriesApi } from '@/services/api/competition';
import { createCategoryMentorApi, getCategoryMentorsApi } from '@/services/api/mentor';
import type { Category as FlowCategory } from '@/services/types/competition';
import type { CategoryMentor } from '@/services/types/mentor';

import {
  getRounds,
  getSubmissions,
  getScores,
  getEliminations,
  getAuditLogs,
  calculateMean,
  calculateVariance,
  calculateStdDev,
  Submission as ApiSubmission,
  Team
} from '@/lib/api';

interface IrrCriteriaBreakdown {
  name: string;
  mean: number;
  variance: number;
  stdDev: number;
}

interface IrrSubmissionData {
  submissionId: string;
  teamName: string;
  roundName: string;
  criteria: IrrCriteriaBreakdown[];
}

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

export default function CoordinatorPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingDisq, setSubmittingDisq] = useState<boolean>(false);
  const [disqSuccess, setDisqSuccess] = useState<string>('');
 
  // Form states to Disqualify
  const [disqSubId, setDisqSubId] = useState<string>('');
  const [disqReason, setDisqReason] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [mentorUserId, setMentorUserId] = useState<string>('');
  const [assigningMentor, setAssigningMentor] = useState<boolean>(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState<string>('');
  const [assignmentError, setAssignmentError] = useState<string>('');
 
  // Loaded states
  const [submissions, setSubmissions] = useState<(ApiSubmission & { Team: Team })[]>([]);
  const [eliminations, setEliminations] = useState<Awaited<ReturnType<typeof getEliminations>>>([]);
  const [auditLogs, setAuditLogs] = useState<Awaited<ReturnType<typeof getAuditLogs>>>([]);
  const [flowCategories, setFlowCategories] = useState<FlowCategory[]>([]);
  const [mentorAssignments, setMentorAssignments] = useState<CategoryMentor[]>([]);
   
  // Statistical IRR calculations for all graded submissions
  const [irrData, setIrrData] = useState<IrrSubmissionData[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        fetchedRounds,
        fetchedSubs,
        fetchedEliminations,
        fetchedLogs
      ] = await Promise.all([
        getRounds(),
        getSubmissions(),
        getEliminations(),
        getAuditLogs()
      ]);

      setSubmissions(fetchedSubs);
      setEliminations(fetchedEliminations);
      setAuditLogs(fetchedLogs);

      try {
        const [fetchedFlowCategories, fetchedMentorAssignments] = await Promise.all([
          getCategoriesApi(),
          getCategoryMentorsApi(),
        ]);
        setFlowCategories(fetchedFlowCategories);
        setMentorAssignments(fetchedMentorAssignments);
        setSelectedCategoryId((current) => current || fetchedFlowCategories[0]?.CategoryId || '');
      } catch (flowError) {
        console.error('Cannot load mentor assignment workflow data:', flowError);
      }

      if (fetchedSubs.length > 0) {
        setDisqSubId(fetchedSubs[0].SubmissionID);
      }

      // Compute IRR details for each graded submission
      const computedIrr: IrrSubmissionData[] = [];
      for (const sub of fetchedSubs) {
        if (sub.Status === 'Graded') {
          const scores = await getScores(sub.SubmissionID);
          if (scores.length > 0) {
            // Group by criteria
            const criteriaIds = Array.from(new Set(scores.map(s => s.Criteria.CriteriaID)));
            const critBreakdown = criteriaIds.map(cid => {
              const critScores = scores.filter(s => s.Criteria.CriteriaID === cid);
              const scoreVals = critScores.map(s => s.ScoreValue);
              return {
                name: critScores[0].Criteria.CriteriaName,
                mean: calculateMean(scoreVals),
                variance: calculateVariance(scoreVals),
                stdDev: calculateStdDev(scoreVals)
              };
            });

            computedIrr.push({
              submissionId: sub.SubmissionID,
              teamName: sub.Team.TeamName,
              roundName: fetchedRounds.find(r => r.RoundID === sub.RoundID)?.RoundName || 'Vòng thi',
              criteria: critBreakdown
            });
          }
        }
      }
      setIrrData(computedIrr);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, []);

  const handleAssignMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId || !mentorUserId.trim()) return;

    setAssigningMentor(true);
    setAssignmentSuccess('');
    setAssignmentError('');

    try {
      const createdAssignment = await createCategoryMentorApi({
        CategoryId: selectedCategoryId,
        UserId: mentorUserId.trim(),
      });

      setMentorAssignments((current) => [
        createdAssignment,
        ...current.filter((assignment) => assignment.CategoryMentorId !== createdAssignment.CategoryMentorId),
      ]);
      setMentorUserId('');
      setAssignmentSuccess('Đã gửi yêu cầu phân công Mentor. Trạng thái hiện tại: Pending.');
    } catch (error: unknown) {
      console.error(error);
      setAssignmentError(getApiErrorMessage(error, 'Không thể phân công Mentor cho Category đã chọn.'));
    } finally {
      setAssigningMentor(false);
    }
  };

  const handleDisqualify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disqSubId || !disqReason.trim()) return;

    setSubmittingDisq(true);
    setDisqSuccess('');

    setTimeout(() => {
      const targetSub = submissions.find(s => s.SubmissionID === disqSubId);
      if (targetSub) {
        // Mock updating local state
        targetSub.Status = 'Disqualified';
        const newElim: Awaited<ReturnType<typeof getEliminations>>[number] = {
          EliminationId: Date.now().toString(),
          SubmissionId: disqSubId,
          UserId: '00000000-0000-0000-0000-000000000013',
          Reason: disqReason,
          EliminatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          Submission: targetSub,
          Team: targetSub.Team,
          Coordinator: {
            UserID: '00000000-0000-0000-0000-000000000013',
            Email: 'coordinator.se@fpt.edu.vn',
            FullName: 'Trần Điều Phối',
            Phone: '0901000013',
            Role: 'Coordinator',
            AccountStatus: 'Approved'
          }
        };
        setEliminations([newElim, ...eliminations]);

        // Add to audit logs
        const newLog: Awaited<ReturnType<typeof getAuditLogs>>[number] = {
          LogID: Date.now().toString(),
          UserID: '00000000-0000-0000-0000-000000000013',
          ActionType: 'SUBMISSION_DISQUALIFY',
          OldValue: null,
          NewValue: JSON.stringify({ TeamName: targetSub.Team.TeamName, Reason: disqReason }),
          CreatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          User: {
            UserID: '00000000-0000-0000-0000-000000000013',
            Email: 'coordinator.se@fpt.edu.vn',
            FullName: 'Trần Điều Phối',
            Phone: '0901000013',
            Role: 'Coordinator',
            AccountStatus: 'Approved'
          }
        };
        setAuditLogs([newLog, ...auditLogs]);
      }

      setDisqReason('');
      setSubmittingDisq(false);
      setDisqSuccess('Đã loại bỏ bài dự thi và ghi nhận vào nhật ký kiểm toán!');
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight dark:text-white">
            Cổng Quản Trị & Giám Sát (Admin Portal)
          </h2>
          <p className="text-slate-500 text-xs mt-1 dark:text-slate-400 font-medium leading-relaxed">
            Giám sát độ chênh lệch điểm (IRR), kiểm tra nhật ký hoạt động (Audit Logs) và thực thi kỷ luật.
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
          
          {/* Left panel: Disqualify console & eliminations */}
          <div className="lg:col-span-1 space-y-6">

            <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <UserPlus className="w-5 h-5" /> Phân công Mentor
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 font-medium">
                  Gửi đề xuất Mentor phụ trách Category. Mentor sẽ nhận yêu cầu ở trạng thái Pending.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-5">
                <form onSubmit={handleAssignMentor} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="mentor-category" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Category thi đấu
                    </label>
                    <select
                      id="mentor-category"
                      aria-label="Chọn Category thi đấu để phân công Mentor"
                      title="Chọn Category thi đấu để phân công Mentor"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none dark:bg-slate-800 dark:border-slate-700"
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      disabled={flowCategories.length === 0}
                    >
                      {flowCategories.length === 0 ? (
                        <option value="">Chưa tải được Category từ API</option>
                      ) : (
                        flowCategories.map((category) => (
                          <option key={category.CategoryId} value={category.CategoryId}>
                            {category.CategoryName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="mentor-user-id" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Mentor User ID
                    </label>
                    <Input
                      id="mentor-user-id"
                      className="rounded-xl h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
                      placeholder="00000000-0000-0000-0000-000000000009"
                      value={mentorUserId}
                      onChange={(e) => setMentorUserId(e.target.value)}
                      required
                    />
                  </div>

                  {assignmentError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-medium">
                      {assignmentError}
                    </div>
                  )}

                  {assignmentSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-medium">
                      {assignmentSuccess}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 font-bold px-5 text-xs transition-colors"
                      disabled={assigningMentor || !selectedCategoryId}
                    >
                      <Send className="w-3.5 h-3.5 mr-2" /> {assigningMentor ? 'Đang gửi...' : 'Gửi phân công'}
                    </Button>
                  </div>
                </form>

                <div className="space-y-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Phân công gần đây
                  </div>
                  {mentorAssignments.length === 0 ? (
                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-500 font-medium dark:border-slate-800 dark:bg-slate-950">
                      Chưa có dữ liệu phân công từ API.
                    </div>
                  ) : (
                    mentorAssignments.slice(0, 5).map((assignment) => (
                      <div key={assignment.CategoryMentorId} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/40 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {getCategoryName(flowCategories, assignment.CategoryId)}
                          </span>
                          <Badge className={`text-[9px] font-extrabold border ${getAssignmentStatusClass(assignment.Status)}`}>
                            {assignment.Status}
                          </Badge>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          Mentor: {assignment.UserId}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Disqualify trigger console */}
            <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <Trash2 className="w-5 h-5" /> Thực thi loại đội (Disqualify)
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 font-medium">BTC hủy kết quả bài nộp của nhóm do vi phạm hoặc điểm thấp.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <form onSubmit={handleDisqualify} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Chọn bài nộp của đội</label>
                    <select
                      id="disqualify-submission"
                      aria-label="Chọn bài nộp của đội để loại"
                      title="Chọn bài nộp của đội để loại"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none dark:bg-slate-800 dark:border-slate-700"
                      value={disqSubId}
                      onChange={(e) => setDisqSubId(e.target.value)}
                    >
                      {submissions
                        .filter(s => s.Status !== 'Disqualified')
                        .map((s) => (
                          <option key={s.SubmissionID} value={s.SubmissionID}>
                            {s.Team.TeamName} (ID: {s.SubmissionID.substring(0,8)})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Lý do loại bỏ chính thức</label>
                    <textarea
                      rows={3}
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-none dark:bg-slate-800 dark:border-slate-700"
                      placeholder="Nhập lý do chi tiết (Ví dụ: Sao chép mã nguồn, vi phạm thời gian nộp bài...)"
                      value={disqReason}
                      onChange={(e) => setDisqReason(e.target.value)}
                      required
                    />
                  </div>

                  {disqSuccess && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                      <ShieldCheck className="w-4 h-4 text-rose-600" /> {disqSuccess}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-10 font-bold px-5 text-xs transition-colors"
                      disabled={submittingDisq}
                    >
                      <Send className="w-3.5 h-3.5 mr-2" /> {submittingDisq ? 'Đang thực thi...' : 'Đình chỉ bài nộp'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Eliminations list */}
            <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold text-rose-600 dark:text-rose-400">Danh sách đã bị loại</CardTitle>
                <CardDescription className="text-xs text-slate-400 font-medium">Lịch sử các quyết định đình chỉ thi đấu công khai.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                {eliminations.map((elim) => (
                  <div key={elim.EliminationId} className="p-3 border border-rose-100 bg-rose-50/10 rounded-xl dark:border-slate-800 dark:bg-rose-950/5 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{elim.Team.TeamName}</span>
                      <span className="text-[9px] text-slate-400 font-semibold">{elim.EliminatedAt}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      Lý do: {elim.Reason}
                    </p>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block text-right">Bởi: {elim.Coordinator.FullName}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>

          {/* Right panel: IRR discrepancy & Audit logs timeline */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* IRR discrepancy grid */}
            <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Bảng đối soát chênh lệch điểm (IRR Monitor)
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 font-medium">
                  Tính toán phương sai và độ lệch chuẩn để giám sát sự chênh lệch lớn giữa các giám khảo.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                <div className="space-y-4">
                  {irrData.map((item) => (
                    <div key={item.submissionId} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                          Xếp hạng điểm nhóm: {item.teamName} ({item.roundName})
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {item.criteria.map((crit: IrrCriteriaBreakdown) => {
                          const hasHighDiscrepancy = crit.stdDev > 0.8;
                          return (
                            <div key={crit.name} className={`p-3 border rounded-xl flex flex-col justify-between ${
                              hasHighDiscrepancy 
                                ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30' 
                                : 'bg-white border-slate-100 dark:bg-slate-950 dark:border-slate-800'
                            }`}>
                              <div>
                                <h5 className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">{crit.name}</h5>
                                <div className="flex items-baseline gap-1 mt-1">
                                  <span className="text-base font-black text-slate-900 dark:text-slate-100">{crit.mean.toFixed(2)}</span>
                                  <span className="text-[9px] text-slate-400 font-bold uppercase">Mean</span>
                                </div>
                              </div>
                              
                              <div className="border-t border-slate-100 dark:border-slate-800/60 mt-2 pt-2 text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
                                <div className="flex justify-between">
                                  <span>Phương sai (Var):</span>
                                  <span>{crit.variance.toFixed(3)}</span>
                                </div>
                                <div className="flex justify-between font-bold">
                                  <span>Độ lệch (SD):</span>
                                  <span className={hasHighDiscrepancy ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}>
                                    {crit.stdDev.toFixed(3)}
                                  </span>
                                </div>
                              </div>
                              {hasHighDiscrepancy && (
                                <div className="mt-1.5 text-[9px] text-amber-700 dark:text-amber-400 bg-amber-100/20 p-1 rounded leading-normal flex items-start gap-0.5">
                                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                                  <span>SD &gt; 0.8: Lệch điểm cao!</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Audit logs terminal view */}
            <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Bảng kiểm toán hoạt động (Audit Log Monitor)
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 font-medium">Nhật ký truy vết thời gian thực mọi quyết định tạo sự kiện, tạo đội và chấm điểm.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="relative pl-6 border-l border-slate-200 space-y-5 dark:border-slate-700">
                  {auditLogs.map((log) => (
                    <div key={log.LogID} className="relative">
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-slate-400 ring-4 ring-slate-50 dark:border-slate-900 dark:ring-slate-900" />
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                        <div>
                          <Badge className="bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 text-[8px] font-extrabold">
                            {log.ActionType}
                          </Badge>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1">
                            {log.User.FullName} ({log.User.Role})
                          </p>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-normal font-mono">
                            {log.NewValue}
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold self-start md:self-center shrink-0">
                          {log.CreatedAt}
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
