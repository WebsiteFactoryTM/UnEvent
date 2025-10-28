import type { Service } from "@/payload-types"

interface ServiceDescriptionProps {
  service: Service
}

export default function ServiceDescription({ service }: ServiceDescriptionProps) {
  if (!service.description) return null

  return (
    <div className="glass-card p-6 md:p-8 space-y-4">
      <h2 className="text-2xl font-bold">Descriere</h2>
      <div className="prose prose-invert max-w-none">
        {service.description.split("\n\n").map((paragraph, index) => (
          <p key={index} className="text-muted-foreground leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  )
}
