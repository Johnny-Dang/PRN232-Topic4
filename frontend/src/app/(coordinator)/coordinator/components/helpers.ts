import type { ApiErrorShape, CoordinatorCategory, CoordinatorMentorAssignment } from './types';

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return fallback;
  }

  const response = (error as ApiErrorShape).response;
  return response?.data?.message || fallback;
};

export const getAssignmentStatusClass = (status: CoordinatorMentorAssignment['Status']): string => {
  if (status === 'Approved') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (status === 'Rejected') return 'bg-rose-50 text-rose-700 border-rose-100';
  return 'bg-amber-50 text-amber-700 border-amber-100';
};

export const getCategoryName = (categories: CoordinatorCategory[], categoryId: string): string => {
  return categories.find((category) => category.CategoryId === categoryId)?.CategoryName || categoryId.substring(0, 8);
};

export const formatDate = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Chưa có ngày' : date.toLocaleDateString('vi-VN');
};

export const toDateInputValue = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};
