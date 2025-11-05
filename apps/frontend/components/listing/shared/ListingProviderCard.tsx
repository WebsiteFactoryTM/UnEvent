import Image from "next/image";
import Link from "next/link";
import {
  FaStar,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import type { Profile, Media } from "@/types/payload-types";
import type { ListingType, Listing } from "@/types/listings";
import { getRolesLabel } from "@/lib/getRolesLabel";

export function ListingProviderCard({
  type,
  listing,
}: {
  type: ListingType;
  listing: Listing;
}) {
  const owner =
    typeof listing.owner === "object" ? (listing.owner as Profile) : null;

  if (!owner) return null;

  const avatar =
    owner.avatar && typeof owner.avatar === "object"
      ? (owner.avatar as Media)
      : null;
  const isVerified = owner.verified?.status === "approved";

  const rolesLabel = getRolesLabel(
    owner?.userType?.filter((role) => role !== "client") || ["client"],
  );

  console.log(owner);

  return (
    <div className="glass-card p-4 md:p-6 space-y-6">
      <h2 className="text-2xl font-bold">{rolesLabel.join(", ")}</h2>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Avatar */}
        {avatar && (
          <div className="shrink-0">
            <div className="relative w-24 h-24 rounded-full overflow-hidden">
              <Image
                src={avatar.url || ""}
                alt={avatar.alt}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          </div>
        )}

        {/* Provider Info */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold">{owner.displayName}</h3>
              {isVerified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                  Verificat
                </span>
              )}
            </div>

            {owner.rating && owner.rating.count ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FaStar className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold text-foreground">
                  {owner.rating.average?.toFixed(1)}
                </span>
                <span>{owner.rating.count} recenzii</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Nu are recenzii</span>
            )}
          </div>

          {owner.bio && (
            <p className="text-muted-foreground text-sm">{owner.bio}</p>
          )}

          {/* Contact & Social */}
          <div className="space-y-3">
            {owner.phone && (
              <a
                href={`tel:${owner.phone}`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="font-medium">Telefon:</span> {owner.phone}
              </a>
            )}
            {owner.website && (
              <a
                href={owner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="font-medium">Website:</span> {owner.website}
              </a>
            )}

            {/* Social Media */}
            {owner.socialMedia && (
              <div className="flex gap-3">
                {owner.socialMedia.facebook && (
                  <a
                    href={owner.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Facebook"
                  >
                    <FaFacebook className="w-5 h-5" />
                  </a>
                )}
                {owner.socialMedia.instagram && (
                  <a
                    href={owner.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="w-5 h-5" />
                  </a>
                )}
                {owner.socialMedia.youtube && (
                  <a
                    href={owner.socialMedia.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="YouTube"
                  >
                    <FaYoutube className="w-5 h-5" />
                  </a>
                )}
                {owner.socialMedia.linkedin && (
                  <a
                    href={owner.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* View Profile Button */}
          <Link href={`/profil/${owner.slug}`}>
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-transparent"
            >
              Vezi profilul complet
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
