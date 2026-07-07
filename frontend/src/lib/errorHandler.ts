type ToastType = 'success' | 'error' | 'warning' | 'info';

const errorMappings: Record<string, { message: string; type: ToastType }> = {
  'Only active judges can score submissions': {
    message: 'Tài khoản của bạn chưa được kích hoạt. Vui lòng liên hệ quản trị viên.',
    type: 'error',
  },
  'Only users with Judge role can score submissions': {
    message: 'Bạn không có quyền chấm điểm. Vui lòng đăng nhập với tài khoản giám khảo.',
    type: 'error',
  },
  'Scoring period for this round has ended': {
    message: 'Thời gian chấm điểm cho vòng thi này đã kết thúc.',
    type: 'warning',
  },
  'Scoring has not started for this round': {
    message: 'Chưa đến thời gian chấm điểm cho vòng thi này.',
    type: 'warning',
  },
  'Judge is not assigned to this submission round': {
    message: 'Bạn chưa được phân công chấm điểm vòng thi này.',
    type: 'error',
  },
  'Submission team must have a category': {
    message: 'Đội thi chưa được phân vào hạng mục thi.',
    type: 'error',
  },
  'Round with id': {
    message: 'Vòng thi không tồn tại.',
    type: 'error',
  },
  'Team with id': {
    message: 'Đội thi không tồn tại.',
    type: 'error',
  },
  'Judge with id': {
    message: 'Tài khoản giám khảo không tồn tại.',
    type: 'error',
  },
  'not found': {
    message: 'Không tìm thấy dữ liệu.',
    type: 'error',
  },
};

export function parseApiError(error: unknown): { message: string; type: ToastType } {
  if (typeof error === 'string') {
    for (const [key, value] of Object.entries(errorMappings)) {
      if (error.includes(key)) {
        return value;
      }
    }
    return { message: error, type: 'error' };
  }

  if (error instanceof Error) {
    const message = error.message;
    for (const [key, value] of Object.entries(errorMappings)) {
      if (message.includes(key)) {
        return value;
      }
    }
    return { message, type: 'error' };
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message: unknown }).message);
    for (const [key, value] of Object.entries(errorMappings)) {
      if (message.includes(key)) {
        return value;
      }
    }
    return { message, type: 'error' };
  }

  return { message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.', type: 'error' };
}

export function getSuccessMessage(action: 'submit' | 'update' | 'delete', teamName?: string): string {
  const team = teamName ? ` cho đội ${teamName}` : '';
  switch (action) {
    case 'submit':
      return `Đã nộp điểm thành công${team}.`;
    case 'update':
      return `Đã cập nhật điểm thành công${team}.`;
    case 'delete':
      return `Đã xóa điểm thành công${team}.`;
  }
}
