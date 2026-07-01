import { z } from 'zod';

export const scoreSchema = z.object({
  ScoreId: z.string().uuid(),
  SubmissionId: z.string().uuid(),
  AssignmentId: z.string().uuid(),
  CriteriaId: z.string().uuid(),
  ScoreValue: z.number(),
  Comment: z.string().nullable().optional(),
  ScoredAt: z.string(),
});

export const judgeAssignmentSchema = z.object({
  AssignmentId: z.string().uuid(),
  JudgeId: z.string().uuid(),
  RoundId: z.string().uuid(),
  AssignedAt: z.string(),
});

export type Score = z.infer<typeof scoreSchema>;
export type JudgeAssignment = z.infer<typeof judgeAssignmentSchema>;
