import type React from "react"

interface FooterColumnProps {
  title: string
  children: React.ReactNode
}

export function FooterColumn({ title, children }: FooterColumnProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-white">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
