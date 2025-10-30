import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { listingTypes, cities, getCityLabel, getListingTypeLabel } from "@/config/archives"
import { ArchiveFilter } from "@/components/archives/ArchiveFilter"
import { AddListingButton } from "@/components/archives/AddListingButton"

export const revalidate = 3600 // ISR: revalidate every hour

export async function generateStaticParams() {
  return listingTypes.flatMap((listingType) => cities.map((c) => ({ listingType, city: c.slug })))
}

export async function generateMetadata({
  params,
}: {
  params: { listingType: string; city: string }
}): Promise<Metadata> {
  const listingLabel = getListingTypeLabel(params.listingType)
  const cityLabel = getCityLabel(params.city)

  return {
    title: `Top ${listingLabel} ${cityLabel} | UN:EVENT`,
    description: `Descoperă cele mai bune ${listingLabel.toLowerCase()} din ${cityLabel}.`,
  }
}

export default function CityArchivePage({
  params,
}: {
  params: { listingType: string; city: string }
}) {
  if (!listingTypes.includes(params.listingType as any)) {
    notFound()
  }

  const listingLabel = getListingTypeLabel(params.listingType)
  const cityLabel = getCityLabel(params.city)

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li>
                <a href="/" className="hover:text-foreground">
                  Acasă
                </a>
              </li>
              <li>/</li>
              <li>
                <a href={`/${params.listingType}`} className="hover:text-foreground">
                  {listingLabel}
                </a>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium">{cityLabel}</li>
            </ol>
          </nav>

          {/* Header with add button */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-4 flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-balance">
                Top {listingLabel} {cityLabel}
              </h1>
              <p className="text-lg text-muted-foreground text-pretty">
                Arhivă oraș (UI placeholder). Conectăm ulterior filtre și listări.
              </p>
            </div>
            <AddListingButton listingType={params.listingType as any} />
          </div>

          <ArchiveFilter listingType={params.listingType as any} />
        </div>
      </div>
    </div>
  )
}
