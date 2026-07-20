import { z } from 'zod';

export const advancementRuleSchema = z.object({
  RuleId: z.string(),
  RoundId: z.string(),
  CategoryId: z.string(),
  TopN: z.number(),
});

export const eliminationSchema = z.object({
  EliminationId: z.string(),
  SubmissionId: z.string(),
  UserId: z.string(),
  Reason: z.string(),
  EliminatedAt: z.string(),
});

export const auditLogSchema = z.object({
  LogId: z.string(),
  UserId: z.string(),
  ActionType: z.string(),
  OldValue: z.string().nullable().optional(),
  NewValue: z.string().nullable().optional(),
  CreatedAt: z.string(),
});

export const notificationSchema = z.object({
  notificationId: z.string(),
  userId: z.string(),
  message: z.string(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export type AdvancementRule = z.infer<typeof advancementRuleSchema>;
export type Elimination = z.infer<typeof eliminationSchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;
export type Notification = z.infer<typeof notificationSchema>;
