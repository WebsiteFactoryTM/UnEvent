import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FaStar,
  FaLocationDot,
  FaGlobe,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa6";
import type { City, Event } from "@/types/payload-types";

interface EventOrganizerCardProps {
  event: Event;
}

export function EventOrganizerCard({ event }: EventOrganizerCardProps) {
  const owner = typeof event?.owner === "object" ? event?.owner : null;
  if (!owner) return null;

  const avatar = typeof owner?.avatar === "object" ? owner?.avatar : null;

  return (
    <div className="glass-card p-4 sm:p-6 space-y-4">
      <h2 className="text-lg font-bold">Organizator</h2>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0">
          <Image
            src={avatar?.url || "/placeholder.svg?height=64&width=64"}
            alt={owner?.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">
                {owner?.displayName || owner?.name}
              </h3>
              {owner?.verified?.status === "approved" && (
                <Badge variant="secondary" className="text-xs">
                  Verificat
                </Badge>
              )}
            </div>
            {owner?.city && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <FaLocationDot className="h-3 w-3" />
                <span>{owner?.city}</span>
              </div>
            )}
          </div>

          {owner?.rating && (
            <div className="flex items-center gap-1 text-sm">
              <FaStar className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{owner?.rating?.average}</span>
              {owner?.rating?.count && (
                <span className="text-muted-foreground">
                  · {owner?.rating?.count} recenzii
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {owner?.bio && (
        <p className="text-sm text-muted-foreground line-clamp-3">
          {owner?.bio}
        </p>
      )}

      {/* Links */}
      <div className="space-y-2">
        {owner?.website && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 bg-transparent"
            asChild
          >
            <a href={owner?.website} target="_blank" rel="noopener noreferrer">
              <FaGlobe className="h-4 w-4" />
              Website
            </a>
          </Button>
        )}

        {owner?.socialMedia &&
          Object.values(owner?.socialMedia).some((link) => link) && (
            <div className="flex gap-2">
              {owner?.socialMedia?.facebook && (
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={owner?.socialMedia?.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <FaFacebook className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {owner?.socialMedia?.instagram && (
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={owner?.socialMedia?.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          )}
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2 border-t border-border">
        <Button className="w-full">Trimite mesaj</Button>
        <Button variant="outline" className="w-full bg-transparent" asChild>
          <Link href={`/profil/${owner?.slug}`}>Vezi toate listările</Link>
        </Button>
        <Button variant="ghost" size="sm" className="w-full" asChild>
          <Link href={`/profil/${owner?.slug}`}>Vezi cont</Link>
        </Button>
      </div>
    </div>
  );
}
