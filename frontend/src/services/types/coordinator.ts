import { z } from 'zod';

export const advancementRuleSchema = z.object({
  RuleId: z.string().uuid(),
  RoundId: z.string().uuid(),
  CategoryId: z.string().uuid(),
  TopN: z.number(),
});

export const eliminationSchema = z.object({
  EliminationId: z.string().uuid(),
  SubmissionId: z.string().uuid(),
  UserId: z.string().uuid(),
  Reason: z.string(),
  EliminatedAt: z.string(),
});

export const auditLogSchema = z.object({
  LogId: z.string().uuid(),
  UserId: z.string().uuid(),
  ActionType: z.string(),
  OldValue: z.string().nullable().optional(),
  NewValue: z.string(),
  CreatedAt: z.string(),
});

export const notificationSchema = z.object({
  NotificationId: z.string().uuid(),
  UserId: z.string().uuid(),
  Message: z.string(),
  IsRead: z.boolean(),
  CreatedAt: z.string(),
});

export type AdvancementRule = z.infer<typeof advancementRuleSchema>;
export type Elimination = z.infer<typeof eliminationSchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;
export type Notification = z.infer<typeof notificationSchema>;
