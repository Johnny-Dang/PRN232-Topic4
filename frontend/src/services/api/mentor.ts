import { z } from 'zod';
import { apiClient } from './apiClient';
import {
  addCategoryMentorRequestSchema,
  categoryMentorSchema,
  mentorCategorySchema,
  mentorSubmissionSchema,
  mentorTeamSchema,
  type AddCategoryMentorRequest,
  type CategoryMentor,
  type MentorCategory,
  type MentorSubmission,
  type MentorTeam,
} from '../types/mentor';

export async function getCategoryMentorsApi(): Promise<CategoryMentor[]> {
  const response = await apiClient.get('/CategoryMentor');
  return z.array(categoryMentorSchema).parse(response.data);
}

export async function getMentorAssignmentsApi(): Promise<CategoryMentor[]> {
  const response = await apiClient.get('/Mentor/assignments');
  return z.array(categoryMentorSchema).parse(response.data);
}

export async function getMentorCategoriesApi(): Promise<MentorCategory[]> {
  const response = await apiClient.get('/Mentor/categories');
  return z.array(mentorCategorySchema).parse(response.data);
}

export async function getMentorTeamsApi(): Promise<MentorTeam[]> {
  const response = await apiClient.get('/Mentor/teams');
  return z.array(mentorTeamSchema).parse(response.data);
}

export async function getMentorSubmissionsApi(): Promise<MentorSubmission[]> {
  const response = await apiClient.get('/Mentor/submissions');
  return z.array(mentorSubmissionSchema).parse(response.data);
}

export async function getCategoryMentorsByCategoryApi(categoryId: string): Promise<CategoryMentor[]> {
  if (!categoryId) return [];
  try {
    const response = await apiClient.get(`/Category/${categoryId}/mentors`);
    return z.array(categoryMentorSchema).parse(response.data);
  } catch (error: unknown) {
    const status = typeof error === 'object' && error !== null && 'response' in error
      ? (error as { response?: { status?: number } }).response?.status
      : undefined;

    if (status !== 404) throw error;

    const assignments = await getCategoryMentorsApi();
    return assignments.filter(
      (assignment) => assignment.CategoryId.toLowerCase() === categoryId.toLowerCase()
    );
  }
}

export async function createCategoryMentorApi(data: AddCategoryMentorRequest): Promise<CategoryMentor> {
  const validated = addCategoryMentorRequestSchema.parse(data);
  const response = await apiClient.post('/CategoryMentor', {
    categoryId: validated.CategoryId,
    userId: validated.UserId,
  });
  return categoryMentorSchema.parse(response.data);
}

export async function approveCategoryMentorApi(categoryMentorId: string): Promise<CategoryMentor> {
  if (!categoryMentorId) throw new Error('categoryMentorId is required');
  const response = await apiClient.put(`/CategoryMentor/${categoryMentorId}/approve`);
  return categoryMentorSchema.parse(response.data);
}

export async function rejectCategoryMentorApi(categoryMentorId: string): Promise<CategoryMentor> {
  if (!categoryMentorId) throw new Error('categoryMentorId is required');
  const response = await apiClient.put(`/CategoryMentor/${categoryMentorId}/reject`);
  return categoryMentorSchema.parse(response.data);
}
