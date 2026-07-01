import { z } from 'zod';

export const teamSchema = z.object({
  TeamId: z.string().uuid(),
  TeamName: z.string(),
  TeamLeaderId: z.string().uuid(),
  CategoryId: z.string().uuid(),
  TeamStatus: z.string(),
});

export const submissionSchema = z.object({
  SubmissionId: z.string().uuid(),
  TeamId: z.string().uuid(),
  RoundId: z.string().uuid(),
  RepositoryUrl: z.string().url().or(z.string().nullable().or(z.string().optional())),
  DemoUrl: z.string().url().or(z.string().nullable().or(z.string().optional())),
  SlideUrl: z.string().url().or(z.string().nullable().or(z.string().optional())),
  SubmittedAt: z.string(),
  Status: z.string(),
});

export type Team = z.infer<typeof teamSchema>;
export type Submission = z.infer<typeof submissionSchema>;
