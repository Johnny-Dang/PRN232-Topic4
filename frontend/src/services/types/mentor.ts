import { z } from 'zod';

export const categoryMentorStatusSchema = z.enum(['Pending', 'Approved', 'Rejected']);

const normalizedCategoryMentorSchema = z.object({
  CategoryMentorId: z.string().uuid(),
  CategoryId: z.string().uuid(),
  UserId: z.string().uuid(),
  Status: categoryMentorStatusSchema,
});

export const categoryMentorSchema = z
  .object({
    CategoryMentorId: z.string().uuid().optional(),
    categoryMentorId: z.string().uuid().optional(),
    CategoryId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    UserId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    Status: categoryMentorStatusSchema.optional(),
    status: categoryMentorStatusSchema.optional(),
  })
  .passthrough()
  .transform((assignment) => ({
    CategoryMentorId: assignment.CategoryMentorId ?? assignment.categoryMentorId ?? '',
    CategoryId: assignment.CategoryId ?? assignment.categoryId ?? '',
    UserId: assignment.UserId ?? assignment.userId ?? '',
    Status: assignment.Status ?? assignment.status ?? 'Pending',
  }))
  .pipe(normalizedCategoryMentorSchema);

export const addCategoryMentorRequestSchema = z.object({
  CategoryId: z.string().uuid('Category không hợp lệ'),
  UserId: z.string().uuid('Mentor ID không hợp lệ'),
});

export type CategoryMentorStatus = z.infer<typeof categoryMentorStatusSchema>;
export type CategoryMentor = z.infer<typeof categoryMentorSchema>;
export type AddCategoryMentorRequest = z.infer<typeof addCategoryMentorRequestSchema>;
