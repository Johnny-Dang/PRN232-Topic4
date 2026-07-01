import { z } from 'zod';
import { apiClient } from './apiClient';
import { categoryMentorSchema } from '../types/mentor';

export async function getCategoryMentorsApi() {
  const response = await apiClient.get('/CategoryMentor'); // Placeholder matching CategoryMentorController endpoints if needed
  return z.array(categoryMentorSchema).parse(response.data);
}
