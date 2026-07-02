'use client';

import axios from 'axios';

declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  };
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5279/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token automatically
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('seal_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const token = parsed.AccessToken || parsed.token;
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          console.error('Lỗi phân tích cú pháp token từ localStorage:', e);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to simplify extracting payload
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Yêu cầu không hợp lệ hoặc hết hạn token (401 Unauthorized)');
    }
    return Promise.reject(error);
  }
);
