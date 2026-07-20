import { z } from "zod";

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

// Support both PascalCase (backend) and camelCase
export const notificationSchema = z.object({
  NotificationId: z.string(),
  UserId: z.string(),
  Message: z.string(),
  IsRead: z.boolean(),
  CreatedAt: z.string(),
});

export type Notification = z.infer<typeof notificationSchema>;
