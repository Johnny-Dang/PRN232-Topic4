import { z } from 'zod';

export const roundSchema = z.object({
  RoundId: z.string().uuid(),
  EventId: z.string().uuid(),
  RoundName: z.string(),
  RoundOrder: z.number(),
  SubmissionDeadline: z.string(),
  StartDate: z.string(),
  EndDate: z.string(),
});

export const eventSchema = z.object({
  EventId: z.string().uuid(),
  EventName: z.string(),
  Season: z.string(),
  Year: z.number(),
  Description: z.string(),
  StartDate: z.string(),
  EndDate: z.string(),
  Rounds: z.array(roundSchema).default([]),
});

export const categorySchema = z.object({
  CategoryId: z.string().uuid(),
  EventId: z.string().uuid(),
  CategoryName: z.string(),
  Description: z.string(),
});

export type Round = z.infer<typeof roundSchema>;
export type Event = z.infer<typeof eventSchema>;
export type Category = z.infer<typeof categorySchema>;
