import { ListingCard } from "@/components/archives/ListingCard";
import type { Service, Media, Profile, City } from "@/types/payload-types";

interface ServiceRecommendationsProps {
  service: Service;
  similarServices: Service[];
}

export default function ServiceRecommendations({
  service,
  similarServices,
}: ServiceRecommendationsProps) {
  const cityName =
    typeof service.city === "object" && service.city
      ? service.city.name
      : "România";

  if (similarServices.length === 0) return null;

  return (
    <div className="glass-card p-6 md:p-8 space-y-6">
      <h2 className="text-2xl font-bold">Servicii similare în {cityName}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarServices.map((similarService) => {
          const featuredImage =
            similarService.featuredImage &&
            typeof similarService.featuredImage === "object"
              ? (similarService.featuredImage as Media)
              : null;

          const owner =
            similarService.owner && typeof similarService.owner === "object"
              ? (similarService.owner as Profile)
              : null;

          const city =
            similarService.city && typeof similarService.city === "object"
              ? (similarService.city as City)
              : null;

          const serviceType =
            Array.isArray(similarService.type) && similarService.type.length > 0
              ? typeof similarService.type[0] === "object"
                ? similarService.type[0].title
                : "Serviciu"
              : "Serviciu";

          const verified = owner?.verified?.status === "verified";

          const priceRange = similarService.pricing?.amount
            ? `de la ${similarService.pricing.amount} ${similarService.pricing.currency || "RON"} / ${similarService.pricing.period || "eveniment"}`
            : undefined;

          return (
            <ListingCard
              key={similarService.id}
              id={typeof similarService.id === "number" ? similarService.id : 0}
              name={similarService.title}
              slug={similarService.slug}
              description={similarService.description || ""}
              image={featuredImage?.url || "/placeholder.svg"}
              city={city?.name || "România"}
              type={serviceType}
              verified={verified}
              rating={
                similarService.rating && similarService.reviewCount
                  ? {
                      average: similarService.rating,
                      count: similarService.reviewCount,
                    }
                  : undefined
              }
              views={similarService.views || 0}
              listingType="servicii"
              priceRange={priceRange}
            />
          );
        })}
      </div>
    </div>
  );
}
