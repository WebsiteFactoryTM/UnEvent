import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { mockService, mockReviews, mockSimilarServices } from "@/mocks/serviciu"
import { ScrollToTop } from "@/components/ScrollToTop"
import ServiceBreadcrumbs from "@/components/listing/service/ServiceBreadcrumbs"
import ServiceMedia from "@/components/listing/service/ServiceMedia"
import ServiceHero from "@/components/listing/service/ServiceHero"
import ServiceDescription from "@/components/listing/service/ServiceDescription"
import ServiceVideos from "@/components/listing/service/ServiceVideos"
import ServiceOfferTags from "@/components/listing/service/ServiceOfferTags"
import ServiceAddressMap from "@/components/listing/service/ServiceAddressMap"
import ServiceProviderCard from "@/components/listing/service/ServiceProviderCard"
import ServiceReviews from "@/components/listing/service/ServiceReviews"
import ServiceRecommendations from "@/components/listing/service/ServiceRecommendations"

interface ServicePageProps {
  params: Promise<{ slug: string }>
}

// Mock function to simulate API call
async function getService(slug: string) {
  // UI-only: return mock data for any slug
  return mockService
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params
  const service = await getService(slug)

  if (!service) {
    return {
      title: "Serviciu negăsit | UN:EVENT",
    }
  }

  const cityName = typeof service.city === "object" && service.city ? service.city.name : "România"
  const serviceCategory =
    service.type && service.type.length > 0 ? (typeof service.type[0] === "object" ? service.type[0].title : "") : ""

  return {
    title: `${service.title} – servicii ${cityName} | UN:EVENT`,
    description: service.description?.slice(0, 160) || `${serviceCategory} în ${cityName}`,
    openGraph: {
      title: service.title,
      description: service.description?.slice(0, 160) || "",
      images:
        service.featuredImage && typeof service.featuredImage === "object"
          ? [{ url: service.featuredImage.url || "" }]
          : [],
      type: "website",
    },
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params
  const service = await getService(slug)

  if (!service) {
    notFound()
  }

  const cityName = typeof service.city === "object" && service.city ? service.city.name : "România"

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    provider: {
      "@type": "LocalBusiness",
      name: typeof service.owner === "object" ? service.owner.name : "",
      telephone: service.contact?.phone,
      email: service.contact?.email,
      address: {
        "@type": "PostalAddress",
        addressLocality: cityName,
        addressCountry: "RO",
      },
    },
    ...(service.rating &&
      service.reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: service.rating,
          reviewCount: service.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
    ...(service.pricing?.amount && {
      offers: {
        "@type": "Offer",
        price: service.pricing.amount,
        priceCurrency: service.pricing.currency || "RON",
      },
    }),
  }

  return (
    <>
      <ScrollToTop />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <ServiceBreadcrumbs service={service} />

          {/* Gallery - First, no title */}
          <ServiceMedia service={service} />

          {/* Hero with contact details */}
          <ServiceHero service={service} />

          {/* Description */}
          <ServiceDescription service={service} />

          {/* Videos */}
          {service.youtubeLinks && service.youtubeLinks.length > 0 && <ServiceVideos service={service} />}

          {/* Services Offered */}
          {service.features && service.features.length > 0 && <ServiceOfferTags service={service} />}

          {/* Location & Address */}
          <ServiceAddressMap service={service} />

          {/* Provider Card */}
          <ServiceProviderCard service={service} />

          {/* Reviews */}
          <ServiceReviews service={service} reviews={mockReviews} />

          {/* Recommendations */}
          <ServiceRecommendations service={service} similarServices={mockSimilarServices} />
        </div>
      </div>
    </>
  )
}
