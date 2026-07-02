'use client';

import { useMutation } from '@tanstack/react-query';
import { loginApi, registerApi } from '../api/auth';

export function useLoginMutation() {
  return useMutation({
    mutationFn: loginApi,
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: registerApi,
  });
}
