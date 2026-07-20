import { z } from 'zod';

const idSchema = z.string().min(1);

export const mentorScheduleSchema = z
  .object({
    ScheduleId: idSchema.optional(),
    scheduleId: idSchema.optional(),
    MentorUserId: idSchema.optional(),
    mentorUserId: idSchema.optional(),
    MentorName: z.string().optional(),
    mentorName: z.string().optional(),
    MentorEmail: z.string().optional(),
    mentorEmail: z.string().optional(),
    StartTime: z.string().optional(),
    startTime: z.string().optional(),
    EndTime: z.string().optional(),
    endTime: z.string().optional(),
    MeetingLocation: z.string().nullable().optional(),
    meetingLocation: z.string().nullable().optional(),
    IsBooked: z.boolean().optional(),
    isBooked: z.boolean().optional(),
  })
  .passthrough()
  .transform((item) => ({
    scheduleId: item.ScheduleId ?? item.scheduleId ?? '',
    mentorUserId: item.MentorUserId ?? item.mentorUserId ?? '',
    mentorName: item.MentorName ?? item.mentorName ?? '',
    mentorEmail: item.MentorEmail ?? item.mentorEmail ?? '',
    startTime: item.StartTime ?? item.startTime ?? '',
    endTime: item.EndTime ?? item.endTime ?? '',
    meetingLocation: item.MeetingLocation ?? item.meetingLocation ?? null,
    isBooked: item.IsBooked ?? item.isBooked ?? false,
  }));

export const mentorBookingSchema = z
  .object({
    BookingId: idSchema.optional(),
    bookingId: idSchema.optional(),
    ScheduleId: idSchema.optional(),
    scheduleId: idSchema.optional(),
    TeamId: idSchema.optional(),
    teamId: idSchema.optional(),
    TeamName: z.string().optional(),
    teamName: z.string().optional(),
    MentorUserId: idSchema.optional(),
    mentorUserId: idSchema.optional(),
    MentorName: z.string().optional(),
    mentorName: z.string().optional(),
    StartTime: z.string().optional(),
    startTime: z.string().optional(),
    EndTime: z.string().optional(),
    endTime: z.string().optional(),
    Objective: z.string().optional(),
    objective: z.string().optional(),
    Status: z.string().optional(),
    status: z.string().optional(),
    MeetingLink: z.string().nullable().optional(),
    meetingLink: z.string().nullable().optional(),
    Notes: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    CreatedAt: z.string().optional(),
    createdAt: z.string().optional(),
  })
  .passthrough()
  .transform((item) => ({
    bookingId: item.BookingId ?? item.bookingId ?? '',
    scheduleId: item.ScheduleId ?? item.scheduleId ?? '',
    teamId: item.TeamId ?? item.teamId ?? '',
    teamName: item.TeamName ?? item.teamName ?? '',
    mentorUserId: item.MentorUserId ?? item.mentorUserId ?? '',
    mentorName: item.MentorName ?? item.mentorName ?? '',
    startTime: item.StartTime ?? item.startTime ?? '',
    endTime: item.EndTime ?? item.endTime ?? '',
    objective: item.Objective ?? item.objective ?? '',
    status: item.Status ?? item.status ?? 'PENDING',
    meetingLink: item.MeetingLink ?? item.meetingLink ?? null,
    notes: item.Notes ?? item.notes ?? null,
    createdAt: item.CreatedAt ?? item.createdAt ?? '',
  }));

export const mentoringFeedbackSchema = z
  .object({
    FeedbackId: idSchema.optional(),
    feedbackId: idSchema.optional(),
    BookingId: idSchema.optional(),
    bookingId: idSchema.optional(),
    TeamId: idSchema.optional(),
    teamId: idSchema.optional(),
    TeamName: z.string().optional(),
    teamName: z.string().optional(),
    MentorUserId: idSchema.optional(),
    mentorUserId: idSchema.optional(),
    MentorName: z.string().optional(),
    mentorName: z.string().optional(),
    HealthStatus: z.string().optional(),
    healthStatus: z.string().optional(),
    Content: z.string().optional(),
    content: z.string().optional(),
    CreatedAt: z.string().optional(),
    createdAt: z.string().optional(),
  })
  .passthrough()
  .transform((item) => ({
    feedbackId: item.FeedbackId ?? item.feedbackId ?? '',
    bookingId: item.BookingId ?? item.bookingId ?? '',
    teamId: item.TeamId ?? item.teamId ?? '',
    teamName: item.TeamName ?? item.teamName ?? '',
    mentorUserId: item.MentorUserId ?? item.mentorUserId ?? '',
    mentorName: item.MentorName ?? item.mentorName ?? '',
    healthStatus: item.HealthStatus ?? item.healthStatus ?? 'Green',
    content: item.Content ?? item.content ?? '',
    createdAt: item.CreatedAt ?? item.createdAt ?? '',
  }));

export const teamHealthSummarySchema = z
  .object({
    TeamId: idSchema.optional(),
    teamId: idSchema.optional(),
    TeamName: z.string().optional(),
    teamName: z.string().optional(),
    EventId: z.string().nullable().optional(),
    eventId: z.string().nullable().optional(),
    EventName: z.string().optional(),
    eventName: z.string().optional(),
    CategoryId: z.string().nullable().optional(),
    categoryId: z.string().nullable().optional(),
    CategoryName: z.string().optional(),
    categoryName: z.string().optional(),
    TeamLeaderName: z.string().optional(),
    teamLeaderName: z.string().optional(),
    HealthStatus: z.string().optional(),
    healthStatus: z.string().optional(),
    TotalBookings: z.number().optional(),
    totalBookings: z.number().optional(),
    LastMentoredAt: z.string().nullable().optional(),
    lastMentoredAt: z.string().nullable().optional(),
    LastFeedbackContent: z.string().nullable().optional(),
    lastFeedbackContent: z.string().nullable().optional(),
  })
  .passthrough()
  .transform((item) => ({
    teamId: item.TeamId ?? item.teamId ?? '',
    teamName: item.TeamName ?? item.teamName ?? '',
    eventId: item.EventId ?? item.eventId ?? null,
    eventName: item.EventName ?? item.eventName ?? '',
    categoryId: item.CategoryId ?? item.categoryId ?? null,
    categoryName: item.CategoryName ?? item.categoryName ?? '',
    teamLeaderName: item.TeamLeaderName ?? item.teamLeaderName ?? '',
    healthStatus: item.HealthStatus ?? item.healthStatus ?? 'Green',
    totalBookings: item.TotalBookings ?? item.totalBookings ?? 0,
    lastMentoredAt: item.LastMentoredAt ?? item.lastMentoredAt ?? null,
    lastFeedbackContent: item.LastFeedbackContent ?? item.lastFeedbackContent ?? null,
  }));

export const coordinatorHealthOverviewSchema = z
  .object({
    TotalTeams: z.number().optional(),
    totalTeams: z.number().optional(),
    GreenTeamsCount: z.number().optional(),
    greenTeamsCount: z.number().optional(),
    YellowTeamsCount: z.number().optional(),
    yellowTeamsCount: z.number().optional(),
    RedTeamsCount: z.number().optional(),
    redTeamsCount: z.number().optional(),
    ZeroBookingsCount: z.number().optional(),
    zeroBookingsCount: z.number().optional(),
    Teams: z.array(teamHealthSummarySchema).optional(),
    teams: z.array(teamHealthSummarySchema).optional(),
  })
  .passthrough()
  .transform((item) => ({
    totalTeams: item.TotalTeams ?? item.totalTeams ?? 0,
    greenTeamsCount: item.GreenTeamsCount ?? item.greenTeamsCount ?? 0,
    yellowTeamsCount: item.YellowTeamsCount ?? item.yellowTeamsCount ?? 0,
    redTeamsCount: item.RedTeamsCount ?? item.redTeamsCount ?? 0,
    zeroBookingsCount: item.ZeroBookingsCount ?? item.zeroBookingsCount ?? 0,
    teams: item.Teams ?? item.teams ?? [],
  }));

// Request Payload Types
export interface CreateSchedulePayload {
  startTime: string;
  endTime: string;
  meetingLocation?: string | null;
}

export interface CreateBookingPayload {
  scheduleId: string;
  objective: string;
}

export interface UpdateBookingStatusPayload {
  status: string;
  meetingLink?: string | null;
  notes?: string | null;
}

export interface CreateFeedbackPayload {
  bookingId: string;
  healthStatus: 'Green' | 'Yellow' | 'Red';
  content: string;
}

// Inferred Response Types
export type MentorSchedule = z.infer<typeof mentorScheduleSchema>;
export type MentorBooking = z.infer<typeof mentorBookingSchema>;
export type MentoringFeedback = z.infer<typeof mentoringFeedbackSchema>;
export type TeamHealthSummary = z.infer<typeof teamHealthSummarySchema>;
export type CoordinatorHealthOverview = z.infer<typeof coordinatorHealthOverviewSchema>;
