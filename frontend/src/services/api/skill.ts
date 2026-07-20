import { z } from 'zod';
import { apiClient } from './apiClient';
import {
  userSkillSchema,
  UserSkill,
  UpdateUserSkillsRequest,
} from '../types/skill';

export async function getMySkillsApi(): Promise<UserSkill[]> {
  const response = await apiClient.get('/UserSkills/my-skills');
  return z.array(userSkillSchema).parse(response.data);
}

export async function getUserSkillsApi(userId: string): Promise<UserSkill[]> {
  if (!userId) throw new Error('userId is required');
  const response = await apiClient.get(`/UserSkills/${userId}`);
  return z.array(userSkillSchema).parse(response.data);
}

export async function updateUserSkillsApi(
  data: UpdateUserSkillsRequest
): Promise<UserSkill[]> {
  const response = await apiClient.put('/UserSkills', data);
  return z.array(userSkillSchema).parse(response.data);
}
