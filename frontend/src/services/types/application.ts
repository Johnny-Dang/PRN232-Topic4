import { z } from 'zod';
import { userSkillSchema, normalizeKeys } from './skill';

export const teamApplicationSchema = z.preprocess(
  normalizeKeys,
  z.object({
    ApplicationId: z.string(),
    RecruitmentId: z.string(),
    TeamId: z.string(),
    TeamName: z.string(),
    UserId: z.string(),
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
