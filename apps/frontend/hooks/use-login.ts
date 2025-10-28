"use client"

import { useMutation } from "@tanstack/react-query"
import { login, type LoginPayload, type AuthResponse } from "@/lib/api/auth"

export function useLogin() {
  return useMutation<AuthResponse, Error, LoginPayload>({
    mutationFn: login,
  })
}
