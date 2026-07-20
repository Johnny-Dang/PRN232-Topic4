import { z } from 'zod';

const idSchema = z.string().min(1);

type NormalizedRound = {
  RoundId: string;
  EventId: string;
  RoundName: string;
  RoundOrder: number;
  SubmissionDeadline: string;
  StartDate: string;
  EndDate: string;
};

export const roundSchema = z
  .object({
    RoundId: idSchema.optional(),
    roundId: idSchema.optional(),
    EventId: idSchema.optional(),
    eventId: idSchema.optional(),
    RoundName: z.string().optional(),
    roundName: z.string().optional(),
    RoundOrder: z.number().optional(),
    roundOrder: z.number().optional(),
    SubmissionDeadline: z.string().optional(),
    submissionDeadline: z.string().optional(),
    StartDate: z.string().optional(),
    startDate: z.string().optional(),
    EndDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .passthrough()
  .transform((round): NormalizedRound => ({
    RoundId: round.RoundId ?? round.roundId ?? '',
    EventId: round.EventId ?? round.eventId ?? '',
    RoundName: round.RoundName ?? round.roundName ?? '',
    RoundOrder: round.RoundOrder ?? round.roundOrder ?? 0,
    SubmissionDeadline: round.SubmissionDeadline ?? round.submissionDeadline ?? '',
    StartDate: round.StartDate ?? round.startDate ?? '',
    EndDate: round.EndDate ?? round.endDate ?? '',
  }));

type NormalizedEvent = {
  EventId: string;
  EventName: string;
  Season: string;
  Year: number;
  Description: string;
  StartDate: string;
  EndDate: string;
  Status: string;
  IsPublished: boolean;
  PublishedAt: string | null;
  PublishedBy: string | null;
  IsFeatured: boolean;
  BannerUrl: string;
  Organizer: string;
  Format: string;
  Audience: string;
  Prize: string;
  Rounds: NormalizedRound[];
};

export const eventSchema = z
  .object({
    EventId: idSchema.optional(),
    eventId: idSchema.optional(),
    EventName: z.string().optional(),
    eventName: z.string().optional(),
    Season: z.string().optional(),
    season: z.string().optional(),
    Year: z.number().optional(),
    year: z.number().optional(),
    Description: z.string().optional(),
    description: z.string().optional(),
    StartDate: z.string().optional(),
    startDate: z.string().optional(),
    EndDate: z.string().optional(),
    endDate: z.string().optional(),
    Status: z.string().optional(),
    status: z.string().optional(),
    IsPublished: z.boolean().optional(),
    isPublished: z.boolean().optional(),
    PublishedAt: z.string().nullable().optional(),
    publishedAt: z.string().nullable().optional(),
    PublishedBy: idSchema.nullable().optional(),
    publishedBy: idSchema.nullable().optional(),
    IsFeatured: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    BannerUrl: z.string().optional(),
    bannerUrl: z.string().optional(),
    Organizer: z.string().optional(),
    organizer: z.string().optional(),
    Format: z.string().optional(),
    format: z.string().optional(),
    Audience: z.string().optional(),
    audience: z.string().optional(),
    Prize: z.string().optional(),
    prize: z.string().optional(),
    Rounds: z.array(roundSchema).optional(),
    rounds: z.array(roundSchema).optional(),
  })
  .passthrough()
  .transform((event): NormalizedEvent => ({
    EventId: event.EventId ?? event.eventId ?? '',
    EventName: event.EventName ?? event.eventName ?? '',
    Season: event.Season ?? event.season ?? '',
    Year: event.Year ?? event.year ?? 0,
    Description: event.Description ?? event.description ?? '',
    StartDate: event.StartDate ?? event.startDate ?? '',
    EndDate: event.EndDate ?? event.endDate ?? '',
    Status: event.Status ?? event.status ?? 'Draft',
    IsPublished: event.IsPublished ?? event.isPublished ?? false,
    PublishedAt: event.PublishedAt ?? event.publishedAt ?? null,
    PublishedBy: event.PublishedBy ?? event.publishedBy ?? null,
    IsFeatured: event.IsFeatured ?? event.isFeatured ?? false,
    BannerUrl: event.BannerUrl ?? event.bannerUrl ?? '',
    Organizer: event.Organizer ?? event.organizer ?? '',
    Format: event.Format ?? event.format ?? 'Online',
    Audience: event.Audience ?? event.audience ?? 'Students',
    Prize: event.Prize ?? event.prize ?? '',
    Rounds: event.Rounds ?? event.rounds ?? [],
  }));

const normalizedCategorySchema = z.object({
  CategoryId: idSchema,
  EventId: idSchema,
  CategoryName: z.string(),
  Description: z.string(),
});

export const categorySchema = z
  .object({
    CategoryId: idSchema.optional(),
    categoryId: idSchema.optional(),
    EventId: idSchema.optional(),
    eventId: idSchema.optional(),
    CategoryName: z.string().optional(),
    categoryName: z.string().optional(),
    Description: z.string().optional(),
    description: z.string().optional(),
  })
  .passthrough()
  .transform((category) => ({
    CategoryId: category.CategoryId ?? category.categoryId ?? '',
    EventId: category.EventId ?? category.eventId ?? '',
    CategoryName: category.CategoryName ?? category.categoryName ?? '',
    Description: category.Description ?? category.description ?? '',
  }))
  .pipe(normalizedCategorySchema);

export const createEventRequestSchema = z.object({
  EventName: z.string().min(2),
  Season: z.string().min(2),
  Year: z.number().int().min(2000).max(2100),
  Description: z.string().default(''),
  StartDate: z.string(),
  EndDate: z.string(),
  Organizer: z.string().default(''),
  Format: z.enum(['Online', 'Offline', 'Hybrid']).default('Online'),
  Audience: z.string().default('Sinh viên'),
  Prize: z.string().default(''),
}).passthrough();

export type CreateEventRequest = z.infer<typeof createEventRequestSchema> & {
  BannerImage?: File | null;
};

export const categoryRequestSchema = z.object({
  EventId: idSchema,
  CategoryName: z.string().trim().min(2).max(150),
  Description: z.string().max(2000).default(''),
});

export const addRoundRequestSchema = z
  .object({
    RoundName: z.string().trim().min(2).max(150),
    RoundOrder: z.number().int().min(1).max(100),
    SubmissionDeadline: z.string().datetime(),
    StartDate: z.string().datetime(),
    EndDate: z.string().datetime(),
  })
  .refine((round) => new Date(round.StartDate) < new Date(round.EndDate), {
    message: 'Thời gian bắt đầu vòng thi phải sớm hơn thời gian kết thúc.',
    path: ['EndDate'],
  })
  .refine(
    (round) => {
      const deadline = new Date(round.SubmissionDeadline);
      return deadline >= new Date(round.StartDate) && deadline <= new Date(round.EndDate);
    },
    {
      message: 'Hạn nộp bài phải nằm trong thời gian diễn ra vòng thi.',
      path: ['SubmissionDeadline'],
    }
  );

export type Round = z.infer<typeof roundSchema>;
export type Event = z.infer<typeof eventSchema>;
export type Category = z.infer<typeof categorySchema>;
export type CategoryRequest = z.infer<typeof categoryRequestSchema>;
export type AddRoundRequest = z.infer<typeof addRoundRequestSchema>;
