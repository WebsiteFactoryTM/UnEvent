import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { listingTypes, getListingTypeLabel } from "@/config/archives"
import { prettifySlug } from "@/lib/slug"

export const revalidate = 3600 // ISR: revalidate every hour

export async function generateMetadata({
  params,
}: {
  params: { listingType: string; slug: string }
}): Promise<Metadata> {
  const prettyName = prettifySlug(params.slug)

  return {
    title: `${prettyName} | UN:EVENT`,
    description: `Detalii despre ${prettyName}.`,
  }
}

export default function DetailPage({
  params,
}: {
  params: { listingType: string; slug: string }
}) {
  if (!listingTypes.includes(params.listingType as any)) {
    notFound()
  }

  const listingLabel = getListingTypeLabel(params.listingType)
  const prettyName = prettifySlug(params.slug)

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
              <li className="text-foreground font-medium">{prettyName}</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-balance capitalize">{prettyName}</h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Pagină detaliu (placeholder). Vom lega conținutul real ulterior.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
