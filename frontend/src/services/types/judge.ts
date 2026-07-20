import { z } from 'zod';

export const scoreSchema = z.object({
  ScoreId: z.string(),
  SubmissionId: z.string(),
  AssignmentId: z.string(),
  CriteriaId: z.string(),
  ScoreValue: z.number(),
  Comment: z.string().nullable().optional(),
  ScoredAt: z.string(),
});

export const judgeAssignmentSchema = z.object({
  AssignmentId: z.string(),
  JudgeId: z.string(),
  RoundId: z.string(),
  AssignedAt: z.string(),
});

export type Score = z.infer<typeof scoreSchema>;
export type JudgeAssignment = z.infer<typeof judgeAssignmentSchema>;
