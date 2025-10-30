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
import type { Service, Profile, Media } from "@/types/payload-types";

interface ServiceProviderCardProps {
  service: Service;
}

export default function ServiceProviderCard({
  service,
}: ServiceProviderCardProps) {
  const provider =
    typeof service.owner === "object" ? (service.owner as Profile) : null;

  if (!provider) return null;

  const avatar =
    provider.avatar && typeof provider.avatar === "object"
      ? (provider.avatar as Media)
      : null;
  const isVerified = provider.verified?.status === "approved";

  return (
    <div className="glass-card p-4 md:p-6 space-y-6">
      <h2 className="text-2xl font-bold">Furnizor</h2>

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
              <h3 className="text-xl font-semibold">{provider.name}</h3>
              {isVerified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                  Verificat
                </span>
              )}
            </div>

            {provider.rating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FaStar className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold text-foreground">
                  {provider.rating.average?.toFixed(1)}
                </span>
                <span>· {provider.rating.count} recenzii</span>
              </div>
            )}
          </div>

          {provider.bio && (
            <p className="text-muted-foreground text-sm">{provider.bio}</p>
          )}

          {/* Contact & Social */}
          <div className="space-y-3">
            {provider.phone && (
              <a
                href={`tel:${provider.phone}`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="font-medium">Telefon:</span> {provider.phone}
              </a>
            )}
            {provider.website && (
              <a
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="font-medium">Website:</span> {provider.website}
              </a>
            )}

            {/* Social Media */}
            {provider.socialMedia && (
              <div className="flex gap-3">
                {provider.socialMedia.facebook && (
                  <a
                    href={provider.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Facebook"
                  >
                    <FaFacebook className="w-5 h-5" />
                  </a>
                )}
                {provider.socialMedia.instagram && (
                  <a
                    href={provider.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="w-5 h-5" />
                  </a>
                )}
                {provider.socialMedia.youtube && (
                  <a
                    href={provider.socialMedia.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="YouTube"
                  >
                    <FaYoutube className="w-5 h-5" />
                  </a>
                )}
                {provider.socialMedia.linkedin && (
                  <a
                    href={provider.socialMedia.linkedin}
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
          <Link href={`/profil/${provider.slug}`}>
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
