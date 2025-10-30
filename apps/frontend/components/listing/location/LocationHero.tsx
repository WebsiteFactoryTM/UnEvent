import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FaStar,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa6";
import type { Location } from "@/types/payload-types";
import { ListingActions } from "../shared/ListingActions";

interface LocationHeroProps {
  location: Location;
}

export function LocationHero({ location }: LocationHeroProps) {
  const cityName =
    typeof location?.city === "object" ? location?.city?.name : "România";
  const locationType =
    Array.isArray(location.type) && location.type.length > 0
      ? typeof location.type[0] === "object"
        ? location.type[0].title
        : "Locație"
      : "Locație";

  const contact = location.contact;
  const socialLinks = location.socialLinks;

  return (
    <div className="glass-card p-4 sm:p-6 space-y-6">
      {/* Title and badges */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance">
            {location.title}
          </h1>
          <div className="flex gap-2 shrink-0">
            {location.status === "approved" && (
              <Badge className="bg-green-500/90 backdrop-blur-sm">
                Verificat
              </Badge>
            )}
            {location.tier === "recommended" && (
              <Badge className="bg-blue-500/90 backdrop-blur-sm">
                Recomandat
              </Badge>
            )}
          </div>
        </div>

        {/* Rating and meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {location.rating && location.reviewCount && (
            <div className="flex items-center gap-1">
              <FaStar className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{location.rating}</span>
              <span className="text-muted-foreground">
                · {location.reviewCount} recenzii
              </span>
            </div>
          )}
          <span className="text-muted-foreground">{cityName}</span>
          {location.capacity?.indoor && (
            <span className="text-muted-foreground">
              Capacitate: {location.capacity.indoor} persoane
            </span>
          )}
          <span className="text-muted-foreground">{locationType}</span>
          {location.pricing?.amount && (
            <span className="font-semibold text-foreground">
              de la {location.pricing.amount} {location.pricing.currency}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <ListingActions
        title={location.title}
        description={location.description ?? ""}
        id={location.id}
        isFavoritedByViewer={location.isFavoritedByViewer ?? false}
        listingType="locatii"
      />

      {/* Contact details */}
      {(contact?.phone ||
        contact?.email ||
        contact?.website ||
        socialLinks) && (
        <div className="pt-4 border-t border-border space-y-4">
          <h3 className="text-lg font-semibold">Contact</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          {socialLinks && Object.values(socialLinks).some((link) => link) && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Social Media</h4>
              <div className="flex gap-2">
                {socialLinks.facebook && (
                  <Button variant="outline" size="icon" asChild>
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                    >
                      <FaFacebook className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {socialLinks.instagram && (
                  <Button variant="outline" size="icon" asChild>
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                    >
                      <FaInstagram className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
