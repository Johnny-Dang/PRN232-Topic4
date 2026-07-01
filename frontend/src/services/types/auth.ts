import { z } from 'zod';

export const userSchema = z.object({
  UserId: z.string().uuid(),
  Email: z.string().email(),
  FullName: z.string(),
  Phone: z.string(),
  Role: z.enum(['Leader', 'Member', 'Mentor', 'Judge', 'Coordinator']),
  AccountStatus: z.string(),
  CreatedAt: z.string(),
});

export const authResponseSchema = z.object({
  AccessToken: z.string(),
  RefreshToken: z.string(),
  AccessTokenExpiresAt: z.string(),
  RefreshTokenExpiresAt: z.string(),
  User: userSchema,
});

export const loginRequestSchema = z.object({
  Email: z.string().email('Email không đúng định dạng'),
  Password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự'),
});

export const registerRequestSchema = z.object({
  Email: z.string().email('Email không đúng định dạng'),
  Password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự'),
  FullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  Phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
});

export type User = z.infer<typeof userSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
