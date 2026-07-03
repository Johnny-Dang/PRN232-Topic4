import { z } from 'zod';
import { apiClient } from './apiClient';
import {
  addCategoryMentorRequestSchema,
  categoryMentorSchema,
  type AddCategoryMentorRequest,
  type CategoryMentor,
} from '../types/mentor';

export async function getCategoryMentorsApi(): Promise<CategoryMentor[]> {
  const response = await apiClient.get('/CategoryMentor');
  return z.array(categoryMentorSchema).parse(response.data);
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
