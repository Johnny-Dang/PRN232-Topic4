import { z } from 'zod';
import { apiClient } from './apiClient';
import { authResponseSchema, userSchema, loginRequestSchema, registerRequestSchema, LoginRequest, RegisterRequest } from '../types/auth';

export async function loginApi(data: LoginRequest) {
  const validated = loginRequestSchema.parse(data);
  const response = await apiClient.post('/Auth/login', validated);
  return authResponseSchema.parse(response.data);
}

export async function registerApi(data: RegisterRequest) {
  const validated = registerRequestSchema.parse(data);
  const response = await apiClient.post('/Auth/register', validated);
  return userSchema.parse(response.data);
}

export async function getMentorsApi() {
  const response = await apiClient.get('/Auth/mentors');
  return z.array(userSchema).parse(response.data);
}
