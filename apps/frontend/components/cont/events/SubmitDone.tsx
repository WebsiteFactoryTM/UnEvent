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
      title: "Eveniment trimis",
      description: "Vei fi notificat când evenimentul va fi aprobat.",
    })
    onClose()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-6 py-12 text-center">
      <div className="mb-6 rounded-full bg-green-100 dark:bg-green-900/20 p-6">
        <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold mb-3">
        Datele au fost transmise cu succes
      </h2>

      <p className="text-muted-foreground max-w-md mb-2">
        Listarea a fost transmisă către aprobare — vei primi un email cu confirmarea aprobării listării.
      </p>

      <p className="text-sm text-muted-foreground max-w-md mb-8">
        De obicei, procesul de verificare durează 24-48 de ore. Te vom notifica imediat ce evenimentul tău va fi disponibil pe platformă.
      </p>

      <Button onClick={handleClose} size="lg" className="min-w-[200px]">
        Închide
      </Button>

      <div className="mt-8 p-4 border rounded-lg bg-muted/20 max-w-md">
        <p className="text-xs text-muted-foreground">
          Între timp, poți continua să îți completezi profilul sau să adaugi alte evenimente.
        </p>
      </div>
    </div>
  )
}





