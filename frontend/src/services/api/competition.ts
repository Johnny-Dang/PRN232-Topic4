import { z } from 'zod';
import { apiClient } from './apiClient';
import { eventSchema, roundSchema, categorySchema } from '../types/competition';

export async function getEventsApi() {
  const response = await apiClient.get('/Event/all');
  return z.array(eventSchema).parse(response.data);
}

export async function getEventByIdApi(eventId: string) {
  if (!eventId) throw new Error('eventId is required');
  const response = await apiClient.get(`/Event/${eventId}`);
  return eventSchema.parse(response.data);
}

export async function getRoundsByEventApi(eventId: string) {
  if (!eventId) throw new Error('eventId is required');
  const response = await apiClient.get(`/Round/events/${eventId}`);
  return z.array(roundSchema).parse(response.data);
}

export async function getCategoriesApi() {
  const response = await apiClient.get('/Category');
  return z.array(categorySchema).parse(response.data);
}
