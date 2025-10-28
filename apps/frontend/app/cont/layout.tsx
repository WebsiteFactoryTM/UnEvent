import type React from "react"
import { Sidebar } from "@/components/cont/Sidebar"
import { Topbar } from "@/components/cont/Topbar"

export default function ContLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Topbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6 lg:ml-64 overflow-x-auto">{children}</main>
      </div>
    </div>
  )
}
