import { z } from 'zod';

const idSchema = z.string().min(1);

const roleSchema = z.enum([
  'Leader',
  'Member',
  'Mentor',
  'Judge',
  'Coordinator',
  'EventCoordinator',
  'TeamLeader',
  'TeamMember',
]);

const normalizedUserSchema = z.object({
  UserId: idSchema,
  Email: z.string().email(),
  FullName: z.string(),
  Phone: z.string(),
  ShortId: z.string(),
  Role: roleSchema,
  AccountStatus: z.string(),
  CreatedAt: z.string(),
});

export const userSchema = z
  .object({
    UserId: idSchema.optional(),
    userId: idSchema.optional(),
    UserID: idSchema.optional(),
    Email: z.string().email().optional(),
    email: z.string().email().optional(),
    FullName: z.string().optional(),
    fullName: z.string().optional(),
    Phone: z.string().optional(),
    phone: z.string().optional(),
    ShortId: z.string().optional(),
    shortId: z.string().optional(),
    Role: roleSchema.optional(),
    role: roleSchema.optional(),
    AccountStatus: z.string().optional(),
    accountStatus: z.string().optional(),
    CreatedAt: z.string().optional(),
    createdAt: z.string().optional(),
  })
  .passthrough()
  .transform((user) => ({
    UserId: user.UserId ?? user.userId ?? user.UserID ?? '',
    Email: user.Email ?? user.email ?? '',
    FullName: user.FullName ?? user.fullName ?? '',
    Phone: user.Phone ?? user.phone ?? '',
    ShortId: user.ShortId ?? user.shortId ?? '',
    Role: user.Role ?? user.role ?? '',
    AccountStatus: user.AccountStatus ?? user.accountStatus ?? '',
    CreatedAt: user.CreatedAt ?? user.createdAt ?? '',
  }))
  .pipe(normalizedUserSchema);

const normalizedAuthResponseSchema = z.object({
  AccessToken: z.string(),
  RefreshToken: z.string(),
  AccessTokenExpiresAt: z.string(),
  RefreshTokenExpiresAt: z.string(),
  User: userSchema,
});

export const authResponseSchema = z
  .object({
    AccessToken: z.string().optional(),
    accessToken: z.string().optional(),
    RefreshToken: z.string().optional(),
    refreshToken: z.string().optional(),
    AccessTokenExpiresAt: z.string().optional(),
    accessTokenExpiresAt: z.string().optional(),
    RefreshTokenExpiresAt: z.string().optional(),
    refreshTokenExpiresAt: z.string().optional(),
    User: z.unknown().optional(),
    user: z.unknown().optional(),
  })
  .passthrough()
  .transform((auth) => ({
    AccessToken: auth.AccessToken ?? auth.accessToken ?? '',
    RefreshToken: auth.RefreshToken ?? auth.refreshToken ?? '',
    AccessTokenExpiresAt: auth.AccessTokenExpiresAt ?? auth.accessTokenExpiresAt ?? '',
    RefreshTokenExpiresAt: auth.RefreshTokenExpiresAt ?? auth.refreshTokenExpiresAt ?? '',
    User: auth.User ?? auth.user,
  }))
  .pipe(normalizedAuthResponseSchema);

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
