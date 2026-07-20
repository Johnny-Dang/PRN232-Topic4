import type { ApiErrorShape, CoordinatorCategory, CoordinatorMentorAssignment } from './types';

interface ValidationErrorResponse {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
}

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error !== 'object' || error === null) {
    return fallback;
  }

  const typedError = error as ValidationErrorResponse;
  const response = typedError.response?.data;

  // Handle validation errors with "errors" field
  if (response?.errors) {
    const errorMessages = Object.entries(response.errors)
      .map(([field, messages]) => {
        const fieldLabel = field === 'Prize' ? 'Giải thưởng' :
                          field === 'Description' ? 'Mô tả' :
                          field === 'EventName' ? 'Tên sự kiện' :
                          field === 'StartDate' ? 'Ngày bắt đầu' :
                          field === 'EndDate' ? 'Ngày kết thúc' : field;
        // Translate common backend validation messages
        const translatedMessages = (messages as string[]).map(msg => {
          if (msg.includes('is required')) return `${fieldLabel} là bắt buộc`;
          if (msg.includes('must be')) return msg.replace(msg, `${fieldLabel} không hợp lệ`);
          return `${fieldLabel}: ${msg}`;
        });
        return translatedMessages.join('\n');
      })
      .join('\n');
    return errorMessages || fallback;
  }

  // Handle simple message
  if (response?.message) {
    return response.message;
  }

  return fallback;
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
