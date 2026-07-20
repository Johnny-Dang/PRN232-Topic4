"use client";

import axios from "axios";

declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  };
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://localhost:7086/api";

console.log("API URL =", process.env.NEXT_PUBLIC_API_URL);
console.log("BASE_URL =", BASE_URL);

const readAccessToken = (session: unknown): string => {
  if (typeof session !== "object" || session === null) return "";

  const record = session as Record<string, unknown>;
  const directToken = record.AccessToken || record.accessToken || record.token;
  if (typeof directToken === "string") return directToken;

  const auth = record.Auth || record.auth;
  if (typeof auth === "object" && auth !== null) {
    const authRecord = auth as Record<string, unknown>;
    const nestedToken =
      authRecord.AccessToken || authRecord.accessToken || authRecord.token;
    if (typeof nestedToken === "string") return nestedToken;
  }

  return "";
};

export const apiClient = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor to attach Bearer token automatically
apiClient.interceptors.request.use(
  (config) => {
    // Skip adding token for auth endpoints that don't require authentication
    if (config.url) {
      const authPublicEndpoints = [
        "/Auth/login",
        "/Auth/register",
        "/Auth/refresh",
      ];
      const isPublicAuthEndpoint = authPublicEndpoints.some((ep) =>
        config.url?.endsWith(ep),
      );
      if (isPublicAuthEndpoint) {
        return config;
      }
    }

    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("seal_user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const token = readAccessToken(parsed);
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          console.error("Lỗi phân tích cú pháp token từ localStorage:", e);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to simplify extracting payload
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn(
        "Yêu cầu không hợp lệ hoặc hết hạn token (401 Unauthorized)",
      );
    }
    return Promise.reject(error);
  },
);
