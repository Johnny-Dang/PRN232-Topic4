import { z } from 'zod';
import { apiClient } from './apiClient';
import { advancementRuleSchema, eliminationSchema, notificationSchema } from '../types/coordinator';

export async function getAdvancementRulesApi() {
  const response = await apiClient.get('/AdvancementRule');
  return z.array(advancementRuleSchema).parse(response.data);
}

export async function getEliminationsApi() {
  const response = await apiClient.get('/Elimination');
  return z.array(eliminationSchema).parse(response.data);
}

export async function getNotificationsApi() {
  const response = await apiClient.get('/Notification');
  return z.array(notificationSchema).parse(response.data);
}

export async function markNotificationAsReadApi(notificationId: string | number) {
  const response = await apiClient.put(`/Notification/${notificationId}/read`);
  return response.data;
}

export async function markAllNotificationsAsReadApi() {
  const response = await apiClient.put('/Notification/read-all');
  return response.data;
}
