"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { IconType } from "react-icons"
import { cn } from "@/lib/utils"

interface NavLinkProps {
  href: string
  icon: IconType
  children: React.ReactNode
}

export function NavLink({ href, icon: Icon, children }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        "hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
        isActive ? "text-white bg-white/10" : "text-white/70",
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  )
}
