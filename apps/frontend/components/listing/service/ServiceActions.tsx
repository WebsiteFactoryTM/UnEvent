"use client"

import { useState } from "react"
import { FaHeart, FaShareNodes, FaFlag, FaEnvelope } from "react-icons/fa6"
import { Button } from "@/components/ui/button"
import type { Service } from "@/payload-types"

interface ServiceActionsProps {
  service: Service
}

export default function ServiceActions({ service }: ServiceActionsProps) {
  const [isFavorited, setIsFavorited] = useState(false)

  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
    // TODO: Implement favorite functionality
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: service.title,
          text: service.description?.slice(0, 100),
          url: window.location.href,
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copiat în clipboard!")
    }
  }

  const handleReport = () => {
    // TODO: Implement report functionality
    alert("Funcționalitate de raportare în dezvoltare")
  }

  const handleMessage = () => {
    // TODO: Implement messaging functionality
    alert("Funcționalitate de mesagerie în dezvoltare")
  }

  return (
    <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-3">
      <Button
        variant={isFavorited ? "default" : "outline"}
        size="sm"
        onClick={handleFavorite}
        className="gap-2"
        aria-label={isFavorited ? "Elimină din favorite" : "Adaugă la favorite"}
      >
        <FaHeart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
        <span className="hidden sm:inline">{isFavorited ? "Salvat" : "Salvează"}</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="gap-2 bg-transparent"
        aria-label="Distribuie"
      >
        <FaShareNodes className="h-4 w-4" />
        <span className="hidden sm:inline">Distribuie</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleReport}
        className="gap-2 bg-transparent"
        aria-label="Raportează"
      >
        <FaFlag className="h-4 w-4" />
        <span className="hidden sm:inline">Raportează</span>
      </Button>

      <Button onClick={handleMessage} size="sm" className="gap-2 col-span-3 sm:col-span-1 sm:ml-auto">
        <FaEnvelope className="h-4 w-4" />
        Trimite mesaj
      </Button>
    </div>
  )
}
