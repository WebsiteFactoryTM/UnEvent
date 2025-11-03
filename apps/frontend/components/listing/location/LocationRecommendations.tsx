import { ListingCard } from "@/components/archives/ListingCard";
import type { Location } from "@/types/payload-types";

interface LocationRecommendationsProps {
  currentLocation: Location;
  similarLocations: Location[];
}

export function LocationRecommendations({
  currentLocation,
  similarLocations,
}: LocationRecommendationsProps) {
  const cityName =
    typeof currentLocation.city === "object"
      ? currentLocation.city.name
      : "România";

  if (similarLocations.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="glass-card p-4 sm:p-6 space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold">
          Listări similare în {cityName}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {similarLocations.map((location) => {
            const featuredImage =
              typeof location.featuredImage === "object"
                ? location.featuredImage
                : null;
            const city =
              typeof location.city === "object" ? location.city : null;
            const locationType =
              Array.isArray(location.type) && location.type.length > 0
                ? typeof location.type[0] === "object"
                  ? location.type[0].title
                  : "Locație"
                : "Locație";

            return (
              <ListingCard
                key={location.id}
                id={location.id}
                name={location.title}
                slug={location.slug || ""}
                description={location.description || ""}
                image={{
                  url: featuredImage?.url || "/placeholder.svg",
                  alt: location.title,
                }}
                city={city?.name || "România"}
                type={locationType}
                verified={location.status === "approved"}
                rating={
                  location.rating && location.reviewCount
                    ? { average: location.rating, count: location.reviewCount }
                    : undefined
                }
                views={location.views || 0}
                listingType="locatii"
                capacity={location.capacity?.indoor}
                priceRange={
                  location.pricing?.amount
                    ? `de la ${location.pricing.amount} ${location.pricing.currency}`
                    : undefined
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
