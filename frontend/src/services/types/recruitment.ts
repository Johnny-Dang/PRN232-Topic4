import { z } from 'zod';
import { normalizeKeys } from './skill';

export const teamRecruitmentSchema = z.preprocess(
  normalizeKeys,
  z.object({
    RecruitmentId: z.string(),
    TeamId: z.string(),
    TeamName: z.string(),
    EventId: z.string().nullable().optional(),
    CategoryId: z.string().nullable().optional(),
    RoleNeeded: z.string(),
    Description: z.string(),
    Quantity: z.number(),
    Status: z.string(),
    CreatedAt: z.string(),
    UpdatedAt: z.string().nullable().optional(),
  })
);

export const createTeamRecruitmentRequestSchema = z.object({
  RoleNeeded: z.string().min(1, 'Vui lòng nhập vai trò cần tuyển'),
  Description: z.string().min(1, 'Vui lòng nhập mô tả yêu cầu'),
  Quantity: z.number().min(1, 'Số lượng tuyển phải lớn hơn 0'),
});

export type TeamRecruitment = z.infer<typeof teamRecruitmentSchema>;
export type CreateTeamRecruitmentRequest = z.infer<typeof createTeamRecruitmentRequestSchema>;
