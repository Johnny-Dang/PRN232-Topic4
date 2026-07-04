'use client';

import { useCallback, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategoriesApi, getEventsApi } from '@/services/api/competition';
import { getCategoryMentorsApi } from '@/services/api/mentor';
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
import EventHomeManager from './components/EventHomeManager';
import IrrMonitor from './components/IrrMonitor';
import MentorAssignmentPanel from './components/MentorAssignmentPanel';
import type {
  AuditLogList,
  CoordinatorCategory,
  CoordinatorEvent,
  CoordinatorMentorAssignment,
  EliminationList,
  IrrSubmissionData,
  SubmissionWithTeam,
} from './components/types';

export default function CoordinatorPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [events, setEvents] = useState<CoordinatorEvent[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionWithTeam[]>([]);
  const [eliminations, setEliminations] = useState<EliminationList>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogList>([]);
  const [categories, setCategories] = useState<CoordinatorCategory[]>([]);
  const [mentorAssignments, setMentorAssignments] = useState<CoordinatorMentorAssignment[]>([]);
  const [irrData, setIrrData] = useState<IrrSubmissionData[]>([]);

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

      try {
        const [fetchedCategories, fetchedMentorAssignments] = await Promise.all([
          getCategoriesApi(),
          getCategoryMentorsApi(),
        ]);

        setCategories(fetchedCategories);
        setMentorAssignments(fetchedMentorAssignments);
        setSelectedCategoryId((current) => current || fetchedCategories[0]?.CategoryId || '');
      } catch (mentorError) {
        console.error('Không thể tải dữ liệu phân công Mentor:', mentorError);
      }

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
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, [loadData]);

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
    setMentorAssignments((current) => [
      assignment,
      ...current.filter((item) => item.CategoryMentorId !== assignment.CategoryMentorId),
    ]);
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
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <EventHomeManager
              events={events}
              onEventCreated={handleEventCreated}
              onEventUpdated={handleEventUpdated}
              onEventDeleted={handleEventDeleted}
            />

            <MentorAssignmentPanel
              categories={categories}
              assignments={mentorAssignments}
              selectedCategoryId={selectedCategoryId}
              onSelectedCategoryChange={setSelectedCategoryId}
              onAssignmentCreated={handleAssignmentCreated}
            />

            <DisqualifyPanel submissions={submissions} />
          </div>

          <div className="space-y-6 lg:col-span-2">
            <IrrMonitor data={irrData} />
            <AuditLogMonitor logs={auditLogs} />

            {eliminations.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                Đã ghi nhận {eliminations.length} quyết định loại bài trong phiên dữ liệu hiện tại.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
