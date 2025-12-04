import { FaStar, FaLocationDot } from "react-icons/fa6";
import type { ServiceListing } from "@/types/listings";
import type { Profile } from "@/types/payload-types";
import { ListingActions } from "../shared/ListingActions";
import SocialMedia from "../shared/SocialMedia";
import PriceDisplay from "../shared/PriceDisplay";

interface ServiceHeroProps {
  service: ServiceListing;
}

export default function ServiceHero({ service }: ServiceHeroProps) {
  const address = service?.address;
  const provider =
    typeof service.owner === "object" ? (service.owner as Profile) : null;
  const cityName =
    typeof service.city === "object" && service.city ? service.city.name : "";
  const isVerified = provider?.verifiedStatus === "approved";

  const serviceCategories =
    service.type && service.type.length > 0
      ? service.type
          .map((t) => (typeof t === "object" ? t.title : ""))
          .filter(Boolean)
          .join(", ")
      : "";

  const suitableFor =
    service.suitableFor && service.suitableFor.length > 0
      ? service.suitableFor
          .map((t) => (typeof t === "object" ? t.title : ""))
          .filter(Boolean)
          .join(", ")
      : "";

  return (
    <div className="glass-card p-6 md:p-8 space-y-6">
      {/* Provider Info & Details */}
      <div className="space-y-4">
        {/* Provider Name & Badges */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">{service.title}</h1>
            <div className="flex flex-wrap gap-2">
              {isVerified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                  Verificat
                </span>
              )}
              {service.tier === "recommended" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Recomandat
                </span>
              )}
              {service.tier === "sponsored" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  Sponsorizat
                </span>
              )}
            </div>
          </div>

          {/* Rating & Location */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {service.rating && service.reviewCount ? (
              <div className="flex items-center gap-1">
                <FaStar className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold text-foreground">
                  {service.rating.toFixed(1)}
                </span>
                <span>· {service.reviewCount} recenzii</span>
              </div>
            ) : null}
            {address || cityName ? (
              <div className="flex items-center gap-1">
                <FaLocationDot className="w-4 h-4" />

                <a href="#listing-map" className="text-muted-foreground">
                  <span className="text-muted-foreground">
                    {address?.trim() ? address : cityName || "România"}
                  </span>
                </a>
              </div>
            ) : null}
          </div>
        </div>

        {/* Essential Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {suitableFor && (
            <div>
              <span className="text-muted-foreground">Destinat pentru: </span>
              <span className="font-medium">{suitableFor}</span>
            </div>
          )}
          {serviceCategories && (
            <div>
              <span className="text-muted-foreground">Categorie: </span>
              <span className="font-medium">{serviceCategories}</span>
            </div>
          )}
          {service.pricing ? (
            <PriceDisplay listingType="servicii" pricing={service.pricing} />
          ) : null}
        </div>

        {/* Actions */}
        <ListingActions
          title={service.title}
          description={service.description ?? ""}
          id={service.id}
          isFavoritedByViewer={service.isFavoritedByViewer ?? false}
          listingType="servicii"
          phone={service.contact?.phone ?? undefined}
        />

        {/* Contact Info */}
        {(service.contact?.phone ||
          service.contact?.email ||
          service.contact?.website) && (
          <div className="pt-4 border-t border-border">
            <h3 className="text-lg font-semibold mb-3">Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {service.contact.phone && (
                <a
                  href={`tel:${service.contact.phone}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="font-medium">Telefon:</span>
                  <span>{service.contact.phone}</span>
                </a>
              )}
              {service.contact.email && (
                <a
                  href={`mailto:${service.contact.email}`}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="font-medium">Email:</span>
                  <span>{service.contact.email}</span>
                </a>
              )}
              {service.contact.website && (
                <a
                  href={service.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors sm:col-span-2"
                >
                  <span className="font-medium">Website:</span>
                  <span className="truncate">{service.contact.website}</span>
                </a>
              )}
            </div>
          </div>
        )}
        {service.socialLinks &&
          Object.values(service.socialLinks).some(
            (link) => link && link !== "",
          ) && <SocialMedia socialLinks={service.socialLinks} />}
      </div>
    </div>
  );
}
