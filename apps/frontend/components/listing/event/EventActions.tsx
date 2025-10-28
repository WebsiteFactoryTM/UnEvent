"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FaHeart, FaShareNodes, FaFlag, FaTicket } from "react-icons/fa6"
import type { Event } from "@/payload-types"

interface EventActionsProps {
  event: Event
}

export default function EventActions({ event }: EventActionsProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isParticipating, setIsParticipating] = useState(false)

  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        url: window.location.href,
      })
    }
  }

  const handleReport = () => {
    console.log("[v0] Report event:", event.id)
  }

  const handleParticipate = () => {
    setIsParticipating(!isParticipating)
    console.log("[v0] Participate in event:", event.id)
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={handleFavorite}
        className={`gap-2 ${isFavorited ? "bg-red-500/10 border-red-500/50" : ""}`}
      >
        <FaHeart className={`h-4 w-4 ${isFavorited ? "fill-red-500" : ""}`} />
        <span className="hidden sm:inline">Salvează</span>
      </Button>

      <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 bg-transparent">
        <FaShareNodes className="h-4 w-4" />
        <span className="hidden sm:inline">Distribuie</span>
      </Button>

      <Button variant="outline" size="sm" onClick={handleReport} className="gap-2 bg-transparent">
        <FaFlag className="h-4 w-4" />
        <span className="hidden sm:inline">Raportează</span>
      </Button>

      <Button
        size="sm"
        onClick={handleParticipate}
        className="col-span-3 sm:col-span-1 sm:ml-auto gap-2 bg-primary hover:bg-primary/90"
        disabled={event.capacity?.remaining === 0}
      >
        <FaTicket className="h-4 w-4" />
        {isParticipating ? "Participi la eveniment" : "Participă la eveniment"}
      </Button>
    </div>
  )
}
