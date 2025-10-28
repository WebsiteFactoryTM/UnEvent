"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SubmitButtonProps {
  children: React.ReactNode
  isLoading?: boolean
  disabled?: boolean
  className?: string
}

export function SubmitButton({ children, isLoading, disabled, className }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={disabled || isLoading} className={cn("w-full", className)} aria-busy={isLoading}>
      {isLoading ? (
        <>
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
          Se încarcă...
        </>
      ) : (
        children
      )}
    </Button>
  )
}
