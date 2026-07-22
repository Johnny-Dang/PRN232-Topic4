import { z } from 'zod';

const idSchema = z.string().min(1);

const normalizeStatus = (status: string | undefined): 'Pending' | 'Approved' | 'Rejected' => {
  if (!status) return 'Pending';
  const normalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  if (normalized === 'Pending' || normalized === 'Approved' || normalized === 'Rejected') {
    return normalized as 'Pending' | 'Approved' | 'Rejected';
  }
  return 'Pending';
};

export const categoryMentorStatusSchema = z.enum(['Pending', 'Approved', 'Rejected']);

const normalizedCategoryMentorSchema = z.object({
  CategoryMentorId: idSchema,
  CategoryId: idSchema,
  UserId: idSchema,
  Status: categoryMentorStatusSchema,
  CategoryName: z.string(),
  MentorFullName: z.string(),
  MentorEmail: z.string(),
});

export const categoryMentorSchema = z
  .object({
    CategoryMentorId: idSchema.optional(),
    categoryMentorId: idSchema.optional(),
    CategoryId: idSchema.optional(),
    categoryId: idSchema.optional(),
    UserId: idSchema.optional(),
    userId: idSchema.optional(),
    Status: z.string().optional(),
    status: z.string().optional(),
    CategoryName: z.string().optional(),
    categoryName: z.string().optional(),
    MentorFullName: z.string().optional(),
    mentorFullName: z.string().optional(),
    MentorEmail: z.string().optional(),
    mentorEmail: z.string().optional(),
  })
  .passthrough()
  .transform((assignment) => ({
    CategoryMentorId: assignment.CategoryMentorId ?? assignment.categoryMentorId ?? '',
    CategoryId: assignment.CategoryId ?? assignment.categoryId ?? '',
    UserId: assignment.UserId ?? assignment.userId ?? '',
    Status: normalizeStatus(assignment.Status ?? assignment.status),
    CategoryName: assignment.CategoryName ?? assignment.categoryName ?? '',
    MentorFullName: assignment.MentorFullName ?? assignment.mentorFullName ?? '',
    MentorEmail: assignment.MentorEmail ?? assignment.mentorEmail ?? '',
  }))
  .pipe(normalizedCategoryMentorSchema);

export const addCategoryMentorRequestSchema = z.object({
  CategoryId: idSchema,
  UserId: idSchema,
});

export const mentorCategorySchema = z
  .object({
    CategoryId: idSchema.optional(),
    categoryId: idSchema.optional(),
    EventId: idSchema.optional(),
    eventId: idSchema.optional(),
    CategoryName: z.string().optional(),
    categoryName: z.string().optional(),
    Description: z.string().optional(),
    description: z.string().optional(),
    EventName: z.string().optional(),
    eventName: z.string().optional(),
    AssignmentStatus: z.string().optional(),
    assignmentStatus: z.string().optional(),
  })
  .passthrough()
  .transform((category) => ({
    CategoryId: category.CategoryId ?? category.categoryId ?? '',
    EventId: category.EventId ?? category.eventId ?? '',
    CategoryName: category.CategoryName ?? category.categoryName ?? '',
    Description: category.Description ?? category.description ?? '',
    EventName: category.EventName ?? category.eventName ?? '',
    AssignmentStatus: category.AssignmentStatus ?? category.assignmentStatus ?? '',
  }));

export const mentorTeamSchema = z
  .object({
    TeamId: idSchema.optional(),
    teamId: idSchema.optional(),
    TeamName: z.string().optional(),
    teamName: z.string().optional(),
    TeamLeaderId: idSchema.optional(),
    teamLeaderId: idSchema.optional(),
    CategoryId: idSchema.optional(),
    categoryId: idSchema.optional(),
    CategoryName: z.string().optional(),
    categoryName: z.string().optional(),
    TeamStatus: z.string().optional(),
    teamStatus: z.string().optional(),
  })
  .passthrough()
  .transform((team) => ({
    TeamId: team.TeamId ?? team.teamId ?? '',
    TeamName: team.TeamName ?? team.teamName ?? '',
    TeamLeaderId: team.TeamLeaderId ?? team.teamLeaderId ?? '',
    CategoryId: team.CategoryId ?? team.categoryId ?? '',
    CategoryName: team.CategoryName ?? team.categoryName ?? '',
    TeamStatus: team.TeamStatus ?? team.teamStatus ?? '',
  }));

export const mentorSubmissionSchema = z
  .object({
    SubmissionId: idSchema.optional(),
    submissionId: idSchema.optional(),
    TeamId: idSchema.optional(),
    teamId: idSchema.optional(),
    TeamName: z.string().optional(),
    teamName: z.string().optional(),
    CategoryId: idSchema.optional(),
    categoryId: idSchema.optional(),
    CategoryName: z.string().optional(),
    categoryName: z.string().optional(),
    RoundId: idSchema.optional(),
    roundId: idSchema.optional(),
    RoundName: z.string().optional(),
    roundName: z.string().optional(),
    RepositoryURL: z.string().optional(),
    repositoryURL: z.string().optional(),
    DemoURL: z.string().optional(),
    demoURL: z.string().optional(),
    SlideURL: z.string().optional(),
    slideURL: z.string().optional(),
    SubmittedAt: z.string().optional(),
    submittedAt: z.string().optional(),
    Status: z.string().optional(),
    status: z.string().optional(),
  })
  .passthrough()
  .transform((submission) => ({
    SubmissionId: submission.SubmissionId ?? submission.submissionId ?? '',
    TeamId: submission.TeamId ?? submission.teamId ?? '',
    TeamName: submission.TeamName ?? submission.teamName ?? '',
    CategoryId: submission.CategoryId ?? submission.categoryId ?? '',
    CategoryName: submission.CategoryName ?? submission.categoryName ?? '',
    RoundId: submission.RoundId ?? submission.roundId ?? '',
    RoundName: submission.RoundName ?? submission.roundName ?? '',
    RepositoryURL: submission.RepositoryURL ?? submission.repositoryURL ?? '',
    DemoURL: submission.DemoURL ?? submission.demoURL ?? '',
    SlideURL: submission.SlideURL ?? submission.slideURL ?? '',
    SubmittedAt: submission.SubmittedAt ?? submission.submittedAt ?? '',
    Status: submission.Status ?? submission.status ?? '',
  }));

export type CategoryMentorStatus = z.infer<typeof categoryMentorStatusSchema>;
export type CategoryMentor = z.infer<typeof categoryMentorSchema>;
export type AddCategoryMentorRequest = z.infer<typeof addCategoryMentorRequestSchema>;
export type MentorCategory = z.infer<typeof mentorCategorySchema>;
export type MentorTeam = z.infer<typeof mentorTeamSchema>;
export type MentorSubmission = z.infer<typeof mentorSubmissionSchema>;
