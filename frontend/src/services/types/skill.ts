import { z } from 'zod';

export const normalizeKeys = (val: unknown): unknown => {
  if (Array.isArray(val)) {
    return val.map(normalizeKeys);
  }
  if (typeof val === 'object' && val !== null) {
    const res: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(val as Record<string, unknown>)) {
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
      res[pascalKey] = normalizeKeys(v);
    }
    return res;
  }
  return val;
};

export const userSkillSchema = z.preprocess(
  normalizeKeys,
  z.object({
    UserSkillId: z.string().uuid(),
    UserId: z.string().uuid(),
    Role: z.string(),
    SkillName: z.string(),
    ExperienceLevel: z.string().nullable().optional(),
    CreatedAt: z.string(),
  })
);

export const userSkillItemRequestSchema = z.object({
  Role: z.string().min(1, 'Vai trò không được để trống'),
  SkillName: z.string().min(1, 'Tên kỹ năng không được để trống'),
  ExperienceLevel: z.string().optional().nullable(),
});

export const updateUserSkillsRequestSchema = z.object({
  Skills: z.array(userSkillItemRequestSchema),
});

export type UserSkill = z.infer<typeof userSkillSchema>;
export type UserSkillItemRequest = z.infer<typeof userSkillItemRequestSchema>;
export type UpdateUserSkillsRequest = z.infer<typeof updateUserSkillsRequestSchema>;
