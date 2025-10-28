import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { listingTypes, getListingTypeLabel } from "@/config/archives"
import { archiveLocations } from "@/mocks/archives/locations"
import { archiveServices } from "@/mocks/archives/services"
import { archiveEvents } from "@/mocks/archives/events"
import { ListingCard } from "@/components/archives/ListingCard"
import { ArchiveFilter } from "@/components/archives/ArchiveFilter"
import { AddListingButton } from "@/components/archives/AddListingButton"
import { ScrollToTop } from "@/components/ScrollToTop"

export const revalidate = 3600 // ISR: revalidate every hour

export async function generateStaticParams() {
  return listingTypes.map((listingType) => ({
    listingType,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: { listingType: string }
}): Promise<Metadata> {
  const label = getListingTypeLabel(params.listingType)

  return {
    title: `Top 15 ${label} în România | UnEvent`,
    description: `Descoperă cele mai bune ${label.toLowerCase()} din România. Verificate, recenzii reale și oferte exclusive.`,
  }
}

export default function ListingTypePage({ params }: { params: { listingType: string } }) {
  if (!listingTypes.includes(params.listingType as any)) {
    notFound()
  }

  // Get top 15 listings based on type
  let listings: any[] = []
  if (params.listingType === "locatii") {
    listings = archiveLocations.slice(0, 15)
  } else if (params.listingType === "servicii") {
    listings = archiveServices.slice(0, 15)
  } else if (params.listingType === "evenimente") {
    listings = archiveEvents.slice(0, 15)
  }

  const label = getListingTypeLabel(params.listingType)

  return (
    <>
      <ScrollToTop />

      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header with add button */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-4 flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-balance">Top 15 {label} în România</h1>
                <p className="text-lg text-muted-foreground text-pretty">
                  Descoperă cele mai bune {label.toLowerCase()} din România, verificate și recenzate de comunitatea
                  noastră.
                </p>
              </div>
              <AddListingButton listingType={params.listingType as any} />
            </div>

            {/* Filter Component */}
            <ArchiveFilter listingType={params.listingType as any} />

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  name={listing.name || listing.title}
                  slug={listing.slug}
                  description={listing.description}
                  image={listing.image}
                  city={listing.city}
                  type={listing.type}
                  verified={listing.verified}
                  rating={listing.rating}
                  views={listing.views}
                  listingType={params.listingType as any}
                  capacity={listing.capacity}
                  priceRange={listing.priceRange}
                  date={listing.date}
                  participants={listing.participants}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
