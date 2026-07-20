import { z } from 'zod';
import { apiClient } from './apiClient';
import {
  teamApplicationSchema,
  TeamApplication,
  ApplyToTeamRequest,
  ProcessApplicationRequest,
} from '../types/application';

export async function applyToTeamApi(
  recruitmentId: string,
  data: ApplyToTeamRequest
): Promise<TeamApplication> {
  if (!recruitmentId) throw new Error('recruitmentId is required');
  const response = await apiClient.post(
    `/TeamApplication/recruitments/${recruitmentId}/apply`,
    data
  );
  return teamApplicationSchema.parse(response.data);
}

export async function getTeamApplicationsApi(
  teamId: string
): Promise<TeamApplication[]> {
  if (!teamId) throw new Error('teamId is required');
  const response = await apiClient.get(`/TeamApplication/teams/${teamId}`);
  return z.array(teamApplicationSchema).parse(response.data);
}

export async function getMyApplicationsApi(): Promise<TeamApplication[]> {
  const response = await apiClient.get('/TeamApplication/my-applications');
  return z.array(teamApplicationSchema).parse(response.data);
}

export async function processApplicationApi(
  applicationId: string,
  data: ProcessApplicationRequest
): Promise<TeamApplication> {
  if (!applicationId) throw new Error('applicationId is required');
  const response = await apiClient.post(
    `/TeamApplication/${applicationId}/process`,
    data
  );
  return teamApplicationSchema.parse(response.data);
}
