"use client"

import { useState } from "react"
import { FaEye, FaPencil, FaTrash, FaPlus, FaLocationDot, FaCalendarDays, FaChartLine, FaUsers } from "react-icons/fa6"
import { SectionCard } from "@/components/cont/SectionCard"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { mockMyEvents, type MyEvent } from "@/mocks/cont/my-events"
import { AddEventModal } from "@/components/cont/events/AddEventModal"
import type { City } from "@/types/payload-types"

// Helper to get city name from City object or ID
function getCityName(city: number | City | null | undefined): string {
  if (!city) return "N/A"
  if (typeof city === "object") return city.name
  return "N/A"
}

// Helper to format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Helper to format date with time
function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Helper to get approval status badge color
function getStatusColor(status: string | null | undefined): string {
  switch (status) {
    case "approved":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    case "pending":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "rejected":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    case "sponsored":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

// Helper to get approval status label
function getStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case "approved":
      return "Aprobat"
    case "pending":
      return "În așteptare"
    case "rejected":
      return "Respins"
    case "sponsored":
      return "Sponsorizat"
    default:
      return "Necunoscut"
  }
}

function getEventStatus(startDate: string, endDate: string): "upcoming" | "active" | "completed" {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (now < start) return "upcoming"
  if (now >= start && now <= end) return "active"
  return "completed"
}

function getEventStatusColor(status: "upcoming" | "active" | "completed"): string {
  switch (status) {
    case "upcoming":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "active":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    case "completed":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }
}

function getEventStatusLabel(status: "upcoming" | "active" | "completed"): string {
  switch (status) {
    case "upcoming":
      return "În curând"
    case "active":
      return "Activ"
    case "completed":
      return "Finalizat"
  }
}

export default function EvenimentelemePage() {
  const { toast } = useToast()
  const [events] = useState<MyEvent[]>(mockMyEvents)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleView = (event: MyEvent) => {
    toast({
      title: "Vezi eveniment",
      description: `Vizualizare: ${event.title}`,
    })
  }

  const handleEdit = (event: MyEvent) => {
    toast({
      title: "Editează eveniment",
      description: `Editare: ${event.title}`,
    })
  }

  const handleDelete = (event: MyEvent) => {
    toast({
      title: "Șterge eveniment",
      description: `Ștergere: ${event.title}`,
      variant: "destructive",
    })
  }

  const handleAddEvent = () => {
    setIsAddModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Evenimentele mele</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gestionează evenimentele tale listate pe platformă
          </p>
        </div>
        <Button onClick={handleAddEvent} className="gap-2 w-full sm:w-auto">
          <FaPlus className="h-4 w-4" />
          Adaugă eveniment
        </Button>
      </div>

      {/* Events List */}
      <SectionCard title="Lista evenimentelor" description="Toate evenimentele tale">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 text-sm font-semibold text-foreground whitespace-nowrap">Titlu</th>
                  <th className="text-left py-3 px-3 text-sm font-semibold text-foreground whitespace-nowrap">Oraș</th>
                  <th className="hidden xl:table-cell text-left py-3 px-3 text-sm font-semibold text-foreground whitespace-nowrap">
                    Data creării
                  </th>
                  <th className="text-left py-3 px-3 text-sm font-semibold text-foreground whitespace-nowrap">
                    Început
                  </th>
                  <th className="text-left py-3 px-3 text-sm font-semibold text-foreground whitespace-nowrap">
                    Sfârșit
                  </th>
                  <th className="hidden lg:table-cell text-left py-3 px-3 text-sm font-semibold text-foreground whitespace-nowrap">
                    Participanți
                  </th>
                  <th className="text-left py-3 px-3 text-sm font-semibold text-foreground whitespace-nowrap">
                    Vizualizări
                  </th>
                  <th className="text-left py-3 px-3 text-sm font-semibold text-foreground whitespace-nowrap">
                    Status
                  </th>
                  <th className="text-right py-3 px-3 text-sm font-semibold text-foreground whitespace-nowrap">
                    Acțiuni
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const eventStatus = getEventStatus(event.startDate, event.endDate)
                  return (
                    <tr key={event.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-3">
                        <div className="font-medium text-foreground max-w-[200px] truncate">{event.title}</div>
                        <div className="text-xs text-muted-foreground max-w-[200px] truncate mt-0.5">
                          {event.description}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="text-sm text-foreground whitespace-nowrap">{getCityName(event.city)}</div>
                      </td>
                      <td className="hidden xl:table-cell py-4 px-3">
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(event.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="text-sm text-foreground whitespace-nowrap">{formatDate(event.startDate)}</div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="text-sm text-foreground whitespace-nowrap">{formatDate(event.endDate)}</div>
                      </td>
                      <td className="hidden lg:table-cell py-4 px-3">
                        <div className="text-sm text-foreground font-medium whitespace-nowrap">
                          {event.participants?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="text-sm text-foreground font-medium whitespace-nowrap">
                          {event.views?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex flex-col gap-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(
                              event.status,
                            )}`}
                          >
                            {getStatusLabel(event.status)}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${getEventStatusColor(
                              eventStatus,
                            )}`}
                          >
                            {getEventStatusLabel(eventStatus)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleView(event)} className="h-8 w-8 p-0">
                            <FaEye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(event)} className="h-8 w-8 p-0">
                            <FaPencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(event)}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <FaTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {events.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nu ai încă evenimente adăugate.</p>
                <Button onClick={handleAddEvent} className="mt-4 gap-2">
                  <FaPlus className="h-4 w-4" />
                  Adaugă primul eveniment
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {events.map((event) => {
            const eventStatus = getEventStatus(event.startDate, event.endDate)
            return (
              <div
                key={event.id}
                className="p-4 rounded-lg bg-muted/30 border border-border/50 backdrop-blur-sm space-y-3"
              >
                {/* Title and Status Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg mb-2">{event.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          event.status,
                        )}`}
                      >
                        {getStatusLabel(event.status)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEventStatusColor(
                          eventStatus,
                        )}`}
                      >
                        {getEventStatusLabel(eventStatus)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

                {/* Event Dates */}
                <div className="grid grid-cols-1 gap-2 pt-2 border-t border-border/30">
                  <div className="flex items-center gap-2 text-sm">
                    <FaCalendarDays className="h-4 w-4 text-green-400" />
                    <span className="text-muted-foreground">Început:</span>
                    <span className="text-foreground font-medium">{formatDateTime(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FaCalendarDays className="h-4 w-4 text-red-400" />
                    <span className="text-muted-foreground">Sfârșit:</span>
                    <span className="text-foreground font-medium">{formatDateTime(event.endDate)}</span>
                  </div>
                </div>

                {/* Meta Information */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/30">
                  <div className="flex items-center gap-2 text-sm">
                    <FaLocationDot className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{getCityName(event.city)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FaUsers className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">{event.participants?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FaChartLine className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">{event.views?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FaCalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{formatDate(event.createdAt)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(event)}
                    className="flex-1 gap-2 text-xs"
                  >
                    <FaEye className="h-3 w-3" />
                    Vezi
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(event)}
                    className="flex-1 gap-2 text-xs"
                  >
                    <FaPencil className="h-3 w-3" />
                    Editează
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(event)}
                    className="gap-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30"
                  >
                    <FaTrash className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )
          })}

          {events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nu ai încă evenimente adăugate.</p>
              <Button onClick={handleAddEvent} className="mt-4 gap-2 w-full">
                <FaPlus className="h-4 w-4" />
                Adaugă primul eveniment
              </Button>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Rejection Reason Alert (if any rejected) */}
      {events.some((e) => e.status === "rejected") && (
        <SectionCard title="Evenimente respinse" description="Evenimente care necesită atenție">
          <div className="space-y-4">
            {events
              .filter((e) => e.status === "rejected")
              .map((event) => (
                <div key={event.id} className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-red-400">Motiv respingere:</span>{" "}
                        {event.rejectionReason || "Nu a fost specificat un motiv."}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(event)}
                      className="gap-2 w-full sm:w-auto"
                    >
                      <FaPencil className="h-3 w-3" />
                      Corectează
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </SectionCard>
      )}

      {/* Add Event Modal */}
      <AddEventModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  )
}
