import { Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ImageConstraintsNote() {
  return (
    <Alert className="mt-4">
      <Info className="h-4 w-4" />
      <AlertDescription className="text-sm space-y-1 ml-6">
        <p className="font-semibold">Specificații imagini:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>
            <strong>Formate acceptate:</strong> JPG, PNG, WebP
          </li>
          <li>
            <strong>Comprimare automată:</strong> la WebP ≤ 500KB (procesare la salvare)
          </li>
          <li>
            <strong>Dimensiuni maxime:</strong> 1920×1920px
          </li>
          <li>
            <strong>Imagini portret:</strong> randate pe fundal negru pentru uniformitate
          </li>
          <li>
            <strong>ALT text:</strong> generat automat la salvare pentru accesibilitate
          </li>
        </ul>
      </AlertDescription>
    </Alert>
  )
}

