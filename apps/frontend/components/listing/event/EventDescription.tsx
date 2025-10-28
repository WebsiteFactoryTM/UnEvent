interface EventDescriptionProps {
  description?: string | null
}

export default function EventDescription({ description }: EventDescriptionProps) {
  if (!description) return null

  return (
    <div className="glass-card p-6 space-y-4">
      <h2 className="text-2xl font-bold">Descriere</h2>
      <div className="prose prose-invert max-w-none">
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{description}</p>
      </div>
    </div>
  )
}
