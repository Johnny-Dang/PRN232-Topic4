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
// Fields are optional to handle various API response formats
export const notificationSchema = z.object({
  NotificationId: z.string().optional(),
  notificationId: z.string().optional(),
  UserId: z.string().optional(),
  userId: z.string().optional(),
  Message: z.string().optional(),
  message: z.string().optional(),
  IsRead: z.boolean().optional(),
  isRead: z.boolean().optional(),
  CreatedAt: z.string().optional(),
  createdAt: z.string().optional(),
});

export type Notification = z.infer<typeof notificationSchema>;
