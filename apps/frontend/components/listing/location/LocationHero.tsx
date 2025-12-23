import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FaStar,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaLocationDot,
} from "react-icons/fa6";
import type { LocationListing } from "@/types/listings";
import { ListingActions } from "../shared/ListingActions";

import SocialMedia from "../shared/SocialMedia";
import PriceDisplay from "../shared/PriceDisplay";
import { ExpandableTagsList } from "../shared/ExpandableTagsList";
import { UnclaimedBadge } from "../shared/UnclaimedBadge";
import { ClaimListingCTA } from "../shared/ClaimListingCTA";
import { TierBadge } from "@/components/common/TierBadge";

interface LocationHeroProps {
  location: LocationListing;
}

export function LocationHero({ location }: LocationHeroProps) {
  const cityName =
    typeof location?.city === "object" ? location?.city?.name : "România";

  const locationTypes =
    Array.isArray(location?.type) && location?.type?.length > 0
      ? location?.type
          .map((t) => (typeof t === "object" ? t.title : ""))
          .filter(Boolean)
      : ["Locație"];

  const contact = location?.contact;
  const socialLinks = location?.socialLinks;
  const address = location?.address;

  const suitableFor =
    location.suitableFor && location.suitableFor.length > 0
      ? location.suitableFor
          .map((t) => (typeof t === "object" ? t.title : ""))
          .filter(Boolean)
      : [];

  return (
    <div className="glass-card p-4 sm:p-6 space-y-6">
      {/* Title and badges */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance">
            {location.title}
          </h1>
          <div className="flex gap-2 shrink-0">
            {location.claimStatus === "unclaimed" && <UnclaimedBadge />}
            {location.verifiedStatus === "approved" ? (
              <TierBadge tier="verified" />
            ) : null}
            {location.tier !== "standard" && location.tier ? (
              <TierBadge tier={location.tier} />
            ) : null}
          </div>
        </div>

        {/* Claim CTA for unclaimed listings */}
        {location.claimStatus === "unclaimed" && (
          <div className="pt-2">
            <ClaimListingCTA
              listingId={location.id}
              listingType="locatii"
              listingSlug={location.slug || undefined}
            />
          </div>
        )}

        {/* Rating and meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {location.rating && location.reviewCount ? (
            <div className="flex items-center gap-1">
              <FaStar className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{location.rating}</span>
              <span className="text-muted-foreground">
                · {location.reviewCount} recenzii
              </span>
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
          {location.capacity?.indoor ? (
            <span className="text-muted-foreground">
              Capacitate: {location.capacity.indoor} persoane
            </span>
          ) : null}
          {location.pricing ? (
            <PriceDisplay listingType="locatii" pricing={location.pricing} />
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <ExpandableTagsList
          items={locationTypes}
          limit={5}
          label="Tip locație:"
        />
        {suitableFor.length > 0 && (
          <ExpandableTagsList
            limit={5}
            items={suitableFor}
            label="Destinat pentru:"
            className="col-span-1"
          />
        )}
      </div>
      {/* Actions */}
      <ListingActions
        title={location.title}
        description={location.description ?? ""}
        id={location.id}
        isFavoritedByViewer={location.isFavoritedByViewer ?? undefined}
        listingType="locatii"
        phone={contact?.phone ?? undefined}
        slug={location.slug || ""}
        ownerId={
          typeof location.owner === "object"
            ? location.owner?.id
            : location.owner
        }
      />

      {/* Contact details */}
      {(contact?.phone ||
        contact?.email ||
        contact?.website ||
        socialLinks) && (
        <div className="pt-4 border-t border-border space-y-4">
          <h3 className="text-lg font-semibold">Contact</h3>

          <div className="flex flex-row flex-wrap gap-3">
            {contact?.phone && (
              <Button
                variant="outline"
                className="justify-start gap-3 bg-transparent"
                asChild
              >
                <a href={`tel:${contact.phone}`}>
                  <FaPhone className="h-4 w-4" />
                  {contact.phone}
                </a>
              </Button>
            )}

            {contact?.email && (
              <Button
                variant="outline"
                className="justify-start gap-3 bg-transparent"
                asChild
              >
                <a href={`mailto:${contact.email}`}>
                  <FaEnvelope className="h-4 w-4" />
                  {contact.email}
                </a>
              </Button>
            )}

            {contact?.website && (
              <Button
                variant="outline"
                className="justify-start gap-3 bg-transparent"
                asChild
              >
                <a
                  href={contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGlobe className="h-4 w-4" />
                  Website
                </a>
              </Button>
            )}
          </div>

          {/* Social media */}
          {socialLinks &&
            Object.values(socialLinks).some((link) => link && link !== "") && (
              <SocialMedia socialLinks={socialLinks} />
            )}
        </div>
      )}
    </div>
  );
}
