import { z } from 'zod';

export const categoryMentorSchema = z.object({
  CategoryMentorId: z.string().uuid(),
  CategoryId: z.string().uuid(),
  MentorId: z.string().uuid(),
  AssignedAt: z.string(),
});

export type CategoryMentor = z.infer<typeof categoryMentorSchema>;
