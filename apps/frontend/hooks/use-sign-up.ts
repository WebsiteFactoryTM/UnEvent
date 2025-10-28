"use client"

import { useMutation } from "@tanstack/react-query"
import { signUp, type SignUpPayload, type AuthResponse } from "@/lib/api/auth"

export function useSignUp() {
  return useMutation<AuthResponse, Error, SignUpPayload>({
    mutationFn: signUp,
  })
}
