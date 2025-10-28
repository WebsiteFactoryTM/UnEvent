"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SubmitDoneProps {
  onClose: () => void
}

export function SubmitDone({ onClose }: SubmitDoneProps) {
  const { toast } = useToast()

  const handleClose = () => {
    toast({
      title: "Listare trimisă",
      description: "Locația ta a fost trimisă spre verificare. Vei primi un email cu confirmarea.",
    })
    onClose()
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center space-y-6">
      <div className="relative">
        {/* Animated checkmark */}
        <div className="relative">
          <CheckCircle2 className="h-24 w-24 text-green-500 animate-in zoom-in-95 duration-500" />
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
        </div>
      </div>

      <div className="space-y-3 max-w-md">
        <h3 className="text-2xl font-bold">Datele au fost transmise cu succes</h3>
        <p className="text-muted-foreground">
          Listarea a fost transmisă către aprobare — vei primi un email cu confirmarea aprobării
          listării.
        </p>
      </div>

      <div className="p-4 bg-muted/30 rounded-lg max-w-md text-left">
        <p className="text-sm font-medium mb-2">Ce se întâmplă în continuare?</p>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Echipa noastră va verifica datele în maxim 24-48 ore</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>Vei primi un email cu confirmarea sau solicitări de clarificări</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">•</span>
            <span>După aprobare, locația va fi vizibilă pe platformă</span>
          </li>
        </ul>
      </div>

      <Button onClick={handleClose} size="lg" className="min-w-[200px]">
        Închide
      </Button>
    </div>
  )
}

