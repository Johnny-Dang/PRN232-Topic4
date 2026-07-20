import { z } from 'zod';

export const teamSchema = z.object({
  TeamId: z.string(),
  TeamName: z.string(),
  TeamLeaderId: z.string(),
  EventId: z.string().nullable().optional(),
  CategoryId: z.string().nullable().optional(),
  TeamStatus: z.string(),
});

export const submissionSchema = z.object({
  SubmissionId: z.string(),
  TeamId: z.string(),
  RoundId: z.string(),
  RepositoryUrl: z.string().url().or(z.string().nullable().or(z.string().optional())),
  DemoUrl: z.string().url().or(z.string().nullable().or(z.string().optional())),
  SlideUrl: z.string().url().or(z.string().nullable().or(z.string().optional())),
  SubmittedAt: z.string(),
  Status: z.string(),
});

export type Team = z.infer<typeof teamSchema>;
export type Submission = z.infer<typeof submissionSchema>;
