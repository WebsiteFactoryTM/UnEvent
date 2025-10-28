import type { Location } from "@/payload-types"

interface LocationDescriptionProps {
  location: Location
}

export function LocationDescription({ location }: LocationDescriptionProps) {
  if (!location.description) return null

  return (
    <div className="glass-card p-4 sm:p-6 space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold">Descriere</h2>
      <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground whitespace-pre-line">
        {location.description}
      </div>
    </div>
  )
}
