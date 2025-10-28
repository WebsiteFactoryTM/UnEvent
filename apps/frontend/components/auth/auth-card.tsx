"use client"

import type React from "react"
import { AnimatedBubbles } from "@/components/ui/animated-bubbles"
import { cn } from "@/lib/utils"

interface AuthCardProps {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function AuthCard({ title, subtitle, children, footer, className }: AuthCardProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden">
      <AnimatedBubbles />

      <div
        className={cn(
          "relative z-10 w-full max-w-md space-y-6",
          "backdrop-blur-xl bg-card/50 border border-border",
          "rounded-2xl p-8",
          "shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]",
          "dark:shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]",
          "transition-all duration-300",
          "animate-fade-in-up",
          className,
        )}
      >
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {children}

        {footer && <div className="pt-4 border-t border-border text-center">{footer}</div>}
      </div>
    </div>
  )
}
