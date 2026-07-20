import { z } from 'zod';
import { apiClient } from './apiClient';
import {
  addRoundRequestSchema,
  eventSchema,
  roundSchema,
  categorySchema,
  categoryRequestSchema,
  type AddRoundRequest,
  type CategoryRequest,
} from '../types/competition';

export async function getEventsApi() {
  const response = await apiClient.get('/Event/all');
  return z.array(eventSchema).parse(response.data);
}

export async function getEventByIdApi(eventId: string) {
  if (!eventId) throw new Error('eventId is required');
  const response = await apiClient.get(`/Event/${eventId}`);
  return eventSchema.parse(response.data);
}

export async function createEventApi(formData: FormData) {
  const response = await apiClient.post('/Event', formData);
  return eventSchema.parse(response.data);
}

export async function addRoundForEventApi(eventId: string, data: AddRoundRequest) {
  if (!eventId) throw new Error('eventId is required');
  const validated = addRoundRequestSchema.parse(data);
  const response = await apiClient.post(`/Event/${eventId}/rounds`, validated);
  return eventSchema.parse(response.data);
}

export async function updateRoundApi(roundId: string, data: AddRoundRequest) {
  if (!roundId) throw new Error('roundId is required');
  const validated = addRoundRequestSchema.parse(data);
  const response = await apiClient.put(`/Round/${roundId}`, validated);
  return roundSchema.parse(response.data);
}

export async function deleteRoundApi(roundId: string) {
  if (!roundId) throw new Error('roundId is required');
  await apiClient.delete(`/Round/${roundId}`);
}

type EventBannerUploadSignature = {
  ApiKey?: string;
  apiKey?: string;
  Timestamp?: number;
  timestamp?: number;
  Signature?: string;
  signature?: string;
  Folder?: string;
  folder?: string;
  PublicId?: string;
  publicId?: string;
  UploadUrl?: string;
  uploadUrl?: string;
};

export async function uploadEventBannerApi(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Ảnh banner không được vượt quá 5 MB.');
  }

  const signatureResponse = await apiClient.post<EventBannerUploadSignature>('/Event/banner/sign-upload', {
    FileName: file.name,
    ContentType: file.type,
    FileSize: file.size,
  });
  const signature = signatureResponse.data;
  const uploadUrl = signature.UploadUrl ?? signature.uploadUrl;
  const apiKey = signature.ApiKey ?? signature.apiKey;
  const timestamp = signature.Timestamp ?? signature.timestamp;
  const signedValue = signature.Signature ?? signature.signature;
  const folder = signature.Folder ?? signature.folder;
  const publicId = signature.PublicId ?? signature.publicId;

  if (!uploadUrl || !apiKey || !timestamp || !signedValue || !folder || !publicId) {
    throw new Error('Không nhận được thông tin upload ảnh từ server.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signedValue);
  formData.append('folder', folder);
  formData.append('public_id', publicId);

  const uploadResponse = await fetch(uploadUrl, { method: 'POST', body: formData });
  const payload = await uploadResponse.json() as { secure_url?: string; error?: { message?: string } };
  if (!uploadResponse.ok || !payload.secure_url) {
    throw new Error(payload.error?.message || 'Không thể upload ảnh lên Cloudinary.');
  }

  return payload.secure_url;
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

export async function createCategoryApi(data: CategoryRequest) {
  const response = await apiClient.post('/Category', categoryRequestSchema.parse(data));
  return categorySchema.parse(response.data);
}

export async function updateCategoryApi(categoryId: string, data: CategoryRequest) {
  if (!categoryId) throw new Error('categoryId is required');
  const response = await apiClient.put(`/Category/${categoryId}`, categoryRequestSchema.parse(data));
  return categorySchema.parse(response.data);
}

export async function deleteCategoryApi(categoryId: string) {
  if (!categoryId) throw new Error('categoryId is required');
  await apiClient.delete(`/Category/${categoryId}`);
}

export async function deleteEventApi(eventId: string) {
  if (!eventId) throw new Error('eventId is required');
  const response = await apiClient.delete(`/Event/${eventId}`);
  return response.data;
}
