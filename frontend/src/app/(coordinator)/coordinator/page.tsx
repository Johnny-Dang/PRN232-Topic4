'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';
import { getMentorsApi } from '@/services/api/auth';
import { getCategoriesApi, getEventsApi } from '@/services/api/competition';
import { getCategoryMentorsApi, getCategoryMentorsByCategoryApi } from '@/services/api/mentor';
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
import CategoryManager from './components/CategoryManager';
import CoordinatorPageHeader from './components/CoordinatorPageHeader';
import DisqualifyPanel from './components/DisqualifyPanel';
import EventCriteriaConfig from './components/EventCriteriaConfig';
import EventHomeManager from './components/EventHomeManager';
import IrrMonitor from './components/IrrMonitor';
import JudgeAssignmentPanel from './components/JudgeAssignmentPanel';
import MentorAssignmentPanel from './components/MentorAssignmentPanel';
import MentorManager from './components/MentorManager';
import RankingBoard from './components/RankingBoard';
import AdvancementRuleConfig from './components/AdvancementRuleConfig';
import CalibrationSampleList from './components/Calibration/CalibrationSampleList';
import TeamHealthDashboard from './components/TeamHealthDashboard';
import NotificationManager from './components/NotificationManager';
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
  const [selectedCategoryEventId, setSelectedCategoryEventId] = useState('');
  const [events, setEvents] = useState<CoordinatorEvent[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionWithTeam[]>([]);
  const [eliminations, setEliminations] = useState<EliminationList>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogList>([]);
  const [categories, setCategories] = useState<CoordinatorCategory[]>([]);
  const [mentors, setMentors] = useState<CoordinatorMentorUser[]>([]);
  const [mentorAssignments, setMentorAssignments] = useState<CoordinatorMentorAssignment[]>([]);
  const [allMentorAssignments, setAllMentorAssignments] = useState<CoordinatorMentorAssignment[]>([]);
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

      const [categoriesResult, mentorsResult, assignmentsResult] = await Promise.allSettled([
        getCategoriesApi(),
        getMentorsApi(),
        getCategoryMentorsApi(),
      ]);
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

      if (assignmentsResult.status === 'fulfilled') {
        setAllMentorAssignments(assignmentsResult.value);
      } else {
        console.error('Cannot load mentor assignments:', assignmentsResult.reason);
        setAllMentorAssignments([]);
        mentorWorkflowErrors.push('Không thể tải phân công Mentor từ API.');
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

  useEffect(() => {
    let refreshTimer: number | undefined;
    const refreshDashboard = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        void loadData();
      }, 300);
    };

    window.addEventListener('seal:notification', refreshDashboard);
    return () => {
      window.removeEventListener('seal:notification', refreshDashboard);
      window.clearTimeout(refreshTimer);
    };
  }, [loadData]);

  const handleSelectedCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    void loadAssignmentsByCategory(categoryId);
  };

  const handleCategoryEventChange = (eventId: string) => {
    setSelectedCategoryEventId(eventId);
    const firstCategory = categories.find((category) => !eventId || category.EventId === eventId);
    handleSelectedCategoryChange(firstCategory?.CategoryId || '');
  };

  const filteredMentorCategories = categories.filter(
    (category) => !selectedCategoryEventId || category.EventId === selectedCategoryEventId,
  );

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
    setAllMentorAssignments((current) => [
      assignment,
      ...current.filter((item) => item.CategoryMentorId !== assignment.CategoryMentorId),
    ]);
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

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <CategoryManager
                categories={categories}
                events={events}
                selectedEventId={selectedCategoryEventId}
                onSelectedEventChange={handleCategoryEventChange}
                onCategoriesChange={setCategories}
              />
              <MentorAssignmentPanel
                categories={filteredMentorCategories}
                mentors={mentors}
                assignments={mentorAssignments}
                assignmentsLoading={assignmentLoading}
                selectedCategoryId={selectedCategoryId}
                onSelectedCategoryChange={handleSelectedCategoryChange}
                onAssignmentCreated={handleAssignmentCreated}
              />
            </div>
          )}

          {activeTab === 'mentors' && (
            <MentorManager
              mentors={mentors}
              categories={categories}
              assignments={allMentorAssignments}
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

          {activeTab === 'calibration-samples' && (
            <CalibrationSampleList />
          )}

          {activeTab === 'health-overview' && (
            <TeamHealthDashboard />
          )}

          {activeTab === 'notifications' && (
            <NotificationManager />
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
