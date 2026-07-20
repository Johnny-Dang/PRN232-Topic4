import { z } from 'zod';
import { apiClient } from './apiClient';
import {
  coordinatorHealthOverviewSchema,
  mentorBookingSchema,
  mentoringFeedbackSchema,
  mentorScheduleSchema,
  type CoordinatorHealthOverview,
  type CreateBookingPayload,
  type CreateFeedbackPayload,
  type CreateSchedulePayload,
  type MentorBooking,
  type MentoringFeedback,
  type MentorSchedule,
  type UpdateBookingStatusPayload,
} from '../types/mentorship';

export async function createMentorScheduleApi(data: CreateSchedulePayload): Promise<MentorSchedule> {
  const response = await apiClient.post('/Mentorship/schedules', data);
  return mentorScheduleSchema.parse(response.data);
}

export async function getMyMentorSchedulesApi(): Promise<MentorSchedule[]> {
  const response = await apiClient.get('/Mentorship/schedules/my-schedules');
  return z.array(mentorScheduleSchema).parse(response.data);
}

export async function deleteMentorScheduleApi(scheduleId: string): Promise<void> {
  await apiClient.delete(`/Mentorship/schedules/${scheduleId}`);
}

export async function getAvailableSchedulesForCategoryApi(categoryId: string): Promise<MentorSchedule[]> {
  if (!categoryId) return [];
  const response = await apiClient.get('/Mentorship/schedules/available', {
    params: { categoryId },
  });
  return z.array(mentorScheduleSchema).parse(response.data);
}

export async function bookMentoringApi(data: CreateBookingPayload): Promise<MentorBooking> {
  const response = await apiClient.post('/Mentorship/bookings', data);
  return mentorBookingSchema.parse(response.data);
}

export async function getMyBookingsApi(): Promise<MentorBooking[]> {
  const response = await apiClient.get('/Mentorship/bookings/my-bookings');
  return z.array(mentorBookingSchema).parse(response.data);
}

export async function updateBookingStatusApi(
  bookingId: string,
  data: UpdateBookingStatusPayload
): Promise<MentorBooking> {
  const response = await apiClient.put(`/Mentorship/bookings/${bookingId}/status`, data);
  return mentorBookingSchema.parse(response.data);
}

export async function createMentoringFeedbackApi(data: CreateFeedbackPayload): Promise<MentoringFeedback> {
  const response = await apiClient.post('/Mentorship/feedbacks', data);
  return mentoringFeedbackSchema.parse(response.data);
}

export async function getTeamFeedbacksApi(teamId: string): Promise<MentoringFeedback[]> {
  if (!teamId) return [];
  const response = await apiClient.get(`/Mentorship/feedbacks/team/${teamId}`);
  return z.array(mentoringFeedbackSchema).parse(response.data);
}

export async function getCoordinatorHealthOverviewApi(eventId?: string): Promise<CoordinatorHealthOverview> {
  const response = await apiClient.get('/Mentorship/coordinator/dashboard', {
    params: eventId ? { eventId } : undefined,
  });
  return coordinatorHealthOverviewSchema.parse(response.data);
}
