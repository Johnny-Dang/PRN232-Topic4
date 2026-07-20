import { z } from 'zod';
import { apiClient } from './apiClient';
import {
  teamRecruitmentSchema,
  TeamRecruitment,
  CreateTeamRecruitmentRequest,
} from '../types/recruitment';

export interface GetRecruitmentsFilter {
  eventId?: string;
  categoryId?: string;
  roleNeeded?: string;
}

export async function getRecruitmentsApi(
  filter?: GetRecruitmentsFilter
): Promise<TeamRecruitment[]> {
  const params: Record<string, string> = {};
  if (filter?.eventId) params.eventId = filter.eventId;
  if (filter?.categoryId) params.categoryId = filter.categoryId;
  if (filter?.roleNeeded) params.roleNeeded = filter.roleNeeded;

  const response = await apiClient.get('/TeamRecruitment', { params });
  return z.array(teamRecruitmentSchema).parse(response.data);
}

export async function getRecruitmentByIdApi(
  recruitmentId: string
): Promise<TeamRecruitment> {
  if (!recruitmentId) throw new Error('recruitmentId is required');
  const response = await apiClient.get(`/TeamRecruitment/${recruitmentId}`);
  return teamRecruitmentSchema.parse(response.data);
}

export async function getRecruitmentsByTeamApi(
  teamId: string
): Promise<TeamRecruitment[]> {
  if (!teamId) throw new Error('teamId is required');
  const response = await apiClient.get(`/TeamRecruitment/teams/${teamId}`);
  return z.array(teamRecruitmentSchema).parse(response.data);
}

export async function createTeamRecruitmentApi(
  teamId: string,
  data: CreateTeamRecruitmentRequest
): Promise<TeamRecruitment> {
  if (!teamId) throw new Error('teamId is required');
  const response = await apiClient.post(`/TeamRecruitment/teams/${teamId}`, data);
  return teamRecruitmentSchema.parse(response.data);
}

export async function closeRecruitmentApi(
  recruitmentId: string
): Promise<TeamRecruitment> {
  if (!recruitmentId) throw new Error('recruitmentId is required');
  const response = await apiClient.patch(`/TeamRecruitment/${recruitmentId}/close`);
  return teamRecruitmentSchema.parse(response.data);
}
