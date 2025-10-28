import { FaImage } from "react-icons/fa6"

export default function EventImageInfo() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <FaImage className="h-6 w-6 text-muted-foreground" />
        <h3 className="text-xl font-bold">Cerințe tehnice imagini</h3>
      </div>

      <div className="space-y-3 text-sm text-muted-foreground">
        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <p className="font-medium text-foreground mb-2">Formate acceptate:</p>
          <p>JPG, PNG, WebP</p>
        </div>

        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <p className="font-medium text-foreground mb-2">Dimensiuni recomandate:</p>
          <p>Minim 1200x630px pentru imagine principală</p>
          <p>Minim 800x600px pentru galerie</p>
        </div>

        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <p className="font-medium text-foreground mb-2">Mărime fișier:</p>
          <p>Maxim 5MB per imagine</p>
          <p>Compresie recomandată: 80-90%</p>
        </div>
      </div>
    </div>
  )
}
