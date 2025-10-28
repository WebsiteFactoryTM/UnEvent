"use client"

import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SectionCardProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function SectionCard({ title, description, action, children, className }: SectionCardProps) {
  return (
    <Card
      className={cn(
        "backdrop-blur-xl bg-background/80 border-border/50",
        "shadow-[0_8px_32px_rgba(0,0,0,0.1),0_0_20px_rgba(255,255,255,0.05)]",
        "transition-all duration-300",
        className,
      )}
    >
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
        {children}
      </div>
    </Card>
  )
}
