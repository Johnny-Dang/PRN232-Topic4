import type { getAuditLogs, getEliminations, Submission as ApiSubmission, Team } from '@/lib/api';
import type { User } from '@/services/types/auth';
import type { Category as FlowCategory, Event as FlowEvent } from '@/services/types/competition';
import type { CategoryMentor } from '@/services/types/mentor';

export interface IrrCriteriaBreakdown {
  id?: string;
  name: string;
  mean: number;
  variance: number;
  stdDev: number;
}

export interface IrrSubmissionData {
  submissionId: string;
  teamName: string;
  roundName: string;
  criteria: IrrCriteriaBreakdown[];
}

export type SubmissionWithTeam = ApiSubmission & { Team: Team };
export type EliminationList = Awaited<ReturnType<typeof getEliminations>>;
export type AuditLogList = Awaited<ReturnType<typeof getAuditLogs>>;

export interface ApiErrorShape {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export type CoordinatorEvent = FlowEvent;
export type CoordinatorCategory = FlowCategory;
export type CoordinatorMentorAssignment = CategoryMentor;
export type CoordinatorMentorUser = User;
