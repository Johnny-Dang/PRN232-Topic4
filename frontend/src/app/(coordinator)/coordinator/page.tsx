'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';
import { getMentorsApi } from '@/services/api/auth';
import { getCategoriesApi, getEventsApi } from '@/services/api/competition';
import { getCategoryMentorsByCategoryApi } from '@/services/api/mentor';
import {
  calculateMean,
  calculateStdDev,
  calculateVariance,
  getAuditLogs,
  getEliminations,
  getRounds,
  getScores,
  getSubmissions,
} from '@/lib/api';
import AuditLogMonitor from './components/AuditLogMonitor';
import CoordinatorPageHeader from './components/CoordinatorPageHeader';
import DisqualifyPanel from './components/DisqualifyPanel';
import EventCriteriaConfig from './components/EventCriteriaConfig';
import EventHomeManager from './components/EventHomeManager';
import IrrMonitor from './components/IrrMonitor';
import JudgeAssignmentPanel from './components/JudgeAssignmentPanel';
import MentorAssignmentPanel from './components/MentorAssignmentPanel';
import RankingBoard from './components/RankingBoard';
import AdvancementRuleConfig from './components/AdvancementRuleConfig';
import type {
  AuditLogList,
  CoordinatorCategory,
  CoordinatorEvent,
  CoordinatorMentorAssignment,
  CoordinatorMentorUser,
  EliminationList,
  IrrSubmissionData,
  SubmissionWithTeam,
} from './components/types';

function CoordinatorDashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'events';

  const [loading, setLoading] = useState(true);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [events, setEvents] = useState<CoordinatorEvent[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionWithTeam[]>([]);
  const [eliminations, setEliminations] = useState<EliminationList>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogList>([]);
  const [categories, setCategories] = useState<CoordinatorCategory[]>([]);
  const [mentors, setMentors] = useState<CoordinatorMentorUser[]>([]);
  const [mentorAssignments, setMentorAssignments] = useState<CoordinatorMentorAssignment[]>([]);
  const [irrData, setIrrData] = useState<IrrSubmissionData[]>([]);

  const loadAssignmentsByCategory = useCallback(async (categoryId: string) => {
    if (!categoryId) {
      setMentorAssignments([]);
      return;
    }

    setAssignmentLoading(true);
    try {
      const assignments = await getCategoryMentorsByCategoryApi(categoryId);
      setMentorAssignments(assignments);
    } catch (error) {
      console.error('Cannot load mentor assignments for category:', error);
      setMentorAssignments([]);
      setDashboardError('Không thể tải danh sách phân công Mentor cho Category từ API.');
    } finally {
      setAssignmentLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setDashboardError('');

    try {
      const [fetchedEvents, fetchedRounds, fetchedSubmissions, fetchedEliminations, fetchedLogs] =
        await Promise.all([getEventsApi(), getRounds(), getSubmissions(), getEliminations(), getAuditLogs()]);

      setEvents(fetchedEvents);
      setSubmissions(fetchedSubmissions);
      setEliminations(fetchedEliminations);
      setAuditLogs(fetchedLogs);

      const [categoriesResult, mentorsResult] = await Promise.allSettled([getCategoriesApi(), getMentorsApi()]);
      const mentorWorkflowErrors: string[] = [];
      let nextCategoryId = '';

      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value);
        nextCategoryId = categoriesResult.value[0]?.CategoryId || '';
        setSelectedCategoryId(nextCategoryId);
      } else {
        console.error('Cannot load categories for mentor assignment:', categoriesResult.reason);
        setCategories([]);
        mentorWorkflowErrors.push('Không thể tải Category từ API.');
      }

      if (mentorsResult.status === 'fulfilled') {
        setMentors(mentorsResult.value);
      } else {
        console.error('Cannot load mentors for mentor assignment:', mentorsResult.reason);
        setMentors([]);
        mentorWorkflowErrors.push('Không thể tải danh sách Mentor từ API.');
      }

      if (mentorWorkflowErrors.length > 0) {
        setDashboardError(mentorWorkflowErrors.join(' '));
      }

      await loadAssignmentsByCategory(nextCategoryId);

      const computedIrr: IrrSubmissionData[] = [];
      for (const submission of fetchedSubmissions) {
        if (submission.Status !== 'Graded') continue;

        const scores = await getScores(submission.SubmissionID);
        if (scores.length === 0) continue;

        const criteriaIds = Array.from(new Set(scores.map((score) => score.Criteria.CriteriaID)));
        const criteria = criteriaIds.map((criteriaId) => {
          const criteriaScores = scores.filter((score) => score.Criteria.CriteriaID === criteriaId);
          const scoreValues = criteriaScores.map((score) => score.ScoreValue);

          return {
            name: criteriaScores[0].Criteria.CriteriaName,
            mean: calculateMean(scoreValues),
            variance: calculateVariance(scoreValues),
            stdDev: calculateStdDev(scoreValues),
          };
        });

        computedIrr.push({
          submissionId: submission.SubmissionID,
          teamName: submission.Team.TeamName,
          roundName: fetchedRounds.find((round) => round.RoundID === submission.RoundID)?.RoundName || 'Vòng thi',
          criteria,
        });
      }

      setIrrData(computedIrr);
    } catch (error) {
      console.error(error);
      setDashboardError('Không thể tải dữ liệu Coordinator dashboard. Vui lòng kiểm tra backend API.');
    } finally {
      setLoading(false);
    }
  }, [loadAssignmentsByCategory]);

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, [loadData]);

  const handleSelectedCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    void loadAssignmentsByCategory(categoryId);
  };

  const handleEventCreated = (event: CoordinatorEvent) => {
    setEvents((current) => [event, ...current.filter((item) => item.EventId !== event.EventId)]);
  };

  const handleEventUpdated = (event: CoordinatorEvent) => {
    setEvents((current) => current.map((item) => (item.EventId === event.EventId ? event : item)));
  };

  const handleEventDeleted = (eventId: string) => {
    setEvents((current) => current.filter((item) => item.EventId !== eventId));
  };

  const handleAssignmentCreated = (assignment: CoordinatorMentorAssignment) => {
    if (assignment.CategoryId === selectedCategoryId) {
      setMentorAssignments((current) => [
        assignment,
        ...current.filter((item) => item.CategoryMentorId !== assignment.CategoryMentorId),
      ]);
    }
  };

  return (
    <div className="space-y-8">
      <CoordinatorPageHeader loading={loading} onReload={loadData} />

      {dashboardError && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          {dashboardError}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-44 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-56 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : (
        <div className="w-full space-y-6">
          {activeTab === 'events' && (
            <EventHomeManager
              events={events}
              onEventCreated={handleEventCreated}
              onEventUpdated={handleEventUpdated}
              onEventDeleted={handleEventDeleted}
            />
          )}

          {activeTab === 'mentor-assignment' && (
            <MentorAssignmentPanel
              categories={categories}
              mentors={mentors}
              assignments={mentorAssignments}
              assignmentsLoading={assignmentLoading}
              selectedCategoryId={selectedCategoryId}
              onSelectedCategoryChange={handleSelectedCategoryChange}
              onAssignmentCreated={handleAssignmentCreated}
            />
          )}

          {activeTab === 'disqualify' && (
            <div className="space-y-6">
              <DisqualifyPanel submissions={submissions} />

              {eliminations.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  Đã ghi nhận {eliminations.length} quyết định loại bài trong phiên dữ liệu hiện tại.
                </div>
              )}
            </div>
          )}

          {activeTab === 'irr-monitor' && (
            <IrrMonitor data={irrData} />
          )}

          {activeTab === 'audit-logs' && (
            <AuditLogMonitor logs={auditLogs} />
          )}

          {activeTab === 'event-criteria' && (
            <EventCriteriaConfig />
          )}

          {activeTab === 'advancement-rules' && (
            <AdvancementRuleConfig />
          )}

          {activeTab === 'judge-assignment' && (
            <JudgeAssignmentPanel />
          )}

          {activeTab === 'ranking-board' && (
            <RankingBoard />
          )}
        </div>
      )}
    </div>
  );
}

export default function CoordinatorPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <Skeleton className="h-44 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-56 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    }>
      <CoordinatorDashboardContent />
    </Suspense>
  );
}
