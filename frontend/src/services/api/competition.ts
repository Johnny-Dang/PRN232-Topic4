import { z } from 'zod';
import { apiClient } from './apiClient';
import { createEventRequestSchema, eventSchema, roundSchema, categorySchema, CreateEventRequest } from '../types/competition';

export async function getEventsApi() {
  const response = await apiClient.get('/Event/all');
  return z.array(eventSchema).parse(response.data);
}

export async function getEventByIdApi(eventId: string) {
  if (!eventId) throw new Error('eventId is required');
  const response = await apiClient.get(`/Event/${eventId}`);
  return eventSchema.parse(response.data);
}

export async function createEventApi(data: CreateEventRequest) {
  const validated = createEventRequestSchema.parse(data);
  const response = await apiClient.post('/Event', validated);
  return eventSchema.parse(response.data);
}

export async function getPublishedEventsApi() {
  const response = await apiClient.get('/Event/published');
  return z.array(eventSchema).parse(response.data);
}

export async function publishEventApi(eventId: string) {
  if (!eventId) throw new Error('eventId is required');
  const response = await apiClient.post(`/Event/${eventId}/publish`);
  return eventSchema.parse(response.data);
}

export async function unpublishEventApi(eventId: string) {
  if (!eventId) throw new Error('eventId is required');
  const response = await apiClient.post(`/Event/${eventId}/unpublish`);
  return eventSchema.parse(response.data);
}

export async function featureEventApi(eventId: string) {
  if (!eventId) throw new Error('eventId is required');
  const response = await apiClient.post(`/Event/${eventId}/feature`);
  return eventSchema.parse(response.data);
}

export async function unfeatureEventApi(eventId: string) {
  if (!eventId) throw new Error('eventId is required');
  const response = await apiClient.post(`/Event/${eventId}/unfeature`);
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

export async function deleteEventApi(eventId: string) {
  if (!eventId) throw new Error('eventId is required');
  const response = await apiClient.delete(`/Event/${eventId}`);
  return response.data;
}
