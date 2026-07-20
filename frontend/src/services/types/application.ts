import { z } from 'zod';
import { userSkillSchema, normalizeKeys } from './skill';

export const teamApplicationSchema = z.preprocess(
  normalizeKeys,
  z.object({
    ApplicationId: z.string().uuid(),
    RecruitmentId: z.string().uuid(),
    TeamId: z.string().uuid(),
    TeamName: z.string(),
    UserId: z.string().uuid(),
    ApplicantName: z.string(),
    ApplicantEmail: z.string(),
    ApplicantSkills: z.array(userSkillSchema).default([]),
    Message: z.string(),
    Status: z.string(),
    CreatedAt: z.string(),
    UpdatedAt: z.string().nullable().optional(),
  })
);

export const applyToTeamRequestSchema = z.object({
  Message: z.string().min(1, 'Lời nhắn không được để trống'),
});

export const processApplicationRequestSchema = z.object({
  Accept: z.boolean(),
});

export type TeamApplication = z.infer<typeof teamApplicationSchema>;
export type ApplyToTeamRequest = z.infer<typeof applyToTeamRequestSchema>;
export type ProcessApplicationRequest = z.infer<typeof processApplicationRequestSchema>;
