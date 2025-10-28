"use client"

import { cn } from "@/lib/utils"

interface HamburgerIconProps {
  isOpen?: boolean
  className?: string
}

export function HamburgerIcon({ isOpen = false, className }: HamburgerIconProps) {
  return (
    <div className={cn("w-5 h-5 flex flex-col justify-center gap-1.5", className)}>
      {/* Top line */}
      <span
        className={cn(
          "block h-0.5 w-full bg-current rounded-full transition-all duration-300 ease-out",
          isOpen && "rotate-45 translate-y-2",
        )}
      />
      {/* Bottom line */}
      <span
        className={cn(
          "block h-0.5 w-full bg-current rounded-full transition-all duration-300 ease-out",
          isOpen && "-rotate-45 -translate-y-1",
        )}
      />
    </div>
  )
}
