import { z } from 'zod';
import { apiClient } from './apiClient';
import { teamSchema, submissionSchema } from '../types/team';

export async function getTeamsApi() {
  const response = await apiClient.get('/Teams');
  return z.array(teamSchema).parse(response.data);
}

export async function getTeamByIdApi(teamId: string) {
  if (!teamId) throw new Error('teamId is required');
  const response = await apiClient.get(`/Teams/${teamId}`);
  return teamSchema.parse(response.data);
}

export async function getSubmissionsApi() {
  const response = await apiClient.get('/Submissions');
  return z.array(submissionSchema).parse(response.data);
}
