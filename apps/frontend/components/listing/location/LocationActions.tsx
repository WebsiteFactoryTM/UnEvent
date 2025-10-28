"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FaHeart, FaShareNodes, FaFlag, FaEnvelope } from "react-icons/fa6"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Location } from "@/payload-types"
import { useToast } from "@/hooks/use-toast"

interface LocationActionsProps {
  location: Location
}

export function LocationActions({ location }: LocationActionsProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const { toast } = useToast()

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast({
      title: isFavorite ? "Eliminat din favorite" : "Adăugat la favorite",
      description: isFavorite ? "Listarea a fost eliminată din favorite." : "Listarea a fost adăugată la favorite.",
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: location.title,
          text: location.description || "",
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copiat",
        description: "Link-ul a fost copiat în clipboard.",
      })
    }
  }

  return (
    <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-3">
      <Button onClick={handleFavorite} variant={isFavorite ? "default" : "outline"} size="sm" className="gap-2">
        <FaHeart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        <span className="hidden sm:inline">{isFavorite ? "Salvat" : "Salvează"}</span>
      </Button>

      <Button onClick={handleShare} variant="outline" size="sm" className="gap-2 bg-transparent">
        <FaShareNodes className="h-4 w-4" />
        <span className="hidden sm:inline">Distribuie</span>
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <FaFlag className="h-4 w-4" />
            <span className="hidden sm:inline">Raportează</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raportează listarea</DialogTitle>
            <DialogDescription>
              Dacă ai identificat o problemă cu această listare, te rugăm să ne informezi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="report-reason">Motivul raportării</Label>
              <Textarea id="report-reason" placeholder="Descrie problema..." className="mt-2" />
            </div>
            <Button className="w-full">Trimite raport</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet>
        <SheetTrigger asChild>
          <Button size="sm" className="gap-2 col-span-3 sm:col-span-1 sm:ml-auto">
            <FaEnvelope className="h-4 w-4" />
            Trimite mesaj
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Mesagerie directă</SheetTitle>
            <SheetDescription>Trimite un mesaj direct proprietarului acestei locații.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label htmlFor="message">Mesajul tău</Label>
              <Textarea id="message" placeholder="Scrie mesajul tău aici..." className="mt-2 min-h-[200px]" />
            </div>
            <Button className="w-full">Trimite mesaj</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
