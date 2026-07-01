import { z } from 'zod';
import { apiClient } from './apiClient';
import { scoreSchema, judgeAssignmentSchema } from '../types/judge';

export async function getScoresApi() {
  const response = await apiClient.get('/Scores');
  return z.array(scoreSchema).parse(response.data);
}

export async function getJudgeAssignmentsApi() {
  const response = await apiClient.get('/JudgeAssignment');
  return z.array(judgeAssignmentSchema).parse(response.data);
}
