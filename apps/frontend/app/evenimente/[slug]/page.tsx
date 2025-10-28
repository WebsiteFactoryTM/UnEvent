import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { mockEvent, mockReviews, mockSimilarEvents } from "@/mocks/eveniment"
import EventBreadcrumbs from "@/components/listing/event/EventBreadcrumbs"
import EventMedia from "@/components/listing/event/EventMedia"
import EventHero from "@/components/listing/event/EventHero"
import EventDescription from "@/components/listing/event/EventDescription"
import EventVideos from "@/components/listing/event/EventVideos"
import EventLocationMap from "@/components/listing/event/EventLocationMap"
import { EventOrganizerCard } from "@/components/listing/event/EventOrganizerCard"
import EventReviews from "@/components/listing/event/EventReviews"
import EventRecommendations from "@/components/listing/event/EventRecommendations"

interface PageProps {
  params: Promise<{ slug: string }>
}

// Mock function to simulate fetching event data
async function getEvent(slug: string) {
  // UI-only: return mock data for any slug
  return mockEvent
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    return {
      title: "Eveniment negăsit | UN:EVENT",
    }
  }

  const cityName = typeof event.city === "object" && event.city ? event.city.name : "România"
  const description = event.description ? event.description.slice(0, 160) : `${event.title} - Eveniment în ${cityName}`

  return {
    title: `${event.title} – ${cityName} | UN:EVENT`,
    description,
    openGraph: {
      title: event.title,
      description,
      images: [
        {
          url: event.featuredImage?.url || "/placeholder.svg",
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
  }
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params
  const event = await getEvent(slug)

  if (!event) {
    notFound()
  }

  const cityName = typeof event.city === "object" && event.city ? event.city.name : "România"

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus:
      event.eventStatus === "upcoming" ? "https://schema.org/EventScheduled" : "https://schema.org/EventCancelled",
    location: {
      "@type": "Place",
      name: event.venue && typeof event.venue === "object" ? event.venue.title : cityName,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.address,
        addressLocality: cityName,
        addressCountry: "RO",
      },
    },
    offers: {
      "@type": "Offer",
      price: event.pricing.amount || 0,
      priceCurrency: event.pricing.currency || "RON",
      availability: event.capacity?.remaining ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
    },
    ...(event.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: event.rating,
        reviewCount: event.reviewCount || 0,
      },
    }),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 space-y-8">
          <EventBreadcrumbs event={event} />

          <EventMedia event={event} />

          <EventHero event={event} />

          <EventDescription description={event.description} />

          {event.youtubeLinks && event.youtubeLinks.length > 0 && <EventVideos youtubeLinks={event.youtubeLinks} />}

          <EventLocationMap event={event} />

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <EventReviews rating={event.rating} reviewCount={event.reviewCount} reviews={mockReviews} />
            </div>

            <div className="space-y-6">
              <EventOrganizerCard event={event} />
            </div>
          </div>

          <EventRecommendations cityName={cityName} similarEvents={mockSimilarEvents} />
        </div>
      </div>
    </>
  )
}
