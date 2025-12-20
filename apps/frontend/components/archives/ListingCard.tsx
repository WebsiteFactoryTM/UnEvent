import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FaLocationDot,
  FaHeart,
  FaStar,
  FaEye,
  FaUsers,
  FaCalendar,
} from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import type { Location } from "@/types/payload-types";
import { useFavorites } from "@/hooks/useFavorites";
import { useToast } from "@/hooks/use-toast";
import FavoriteButton from "../common/FavoriteButton";
import { MdVerified } from "react-icons/md";
import type { ListingCardData } from "@/lib/normalizers/hub";
// import { useImpression } from "../metrics/useImpression";
import { getListingTypeSlug } from "@/lib/getListingType";
import ListingCardImpressionsLayer from "./ListingCardImpressionsLayer";
import { UnclaimedBadge } from "../listing/shared/UnclaimedBadge";
import { TierBadge } from "../common/TierBadge";
import { RichTextRenderer } from "@/components/editor/RichTextRenderer";
import { getListingPlainDescription } from "@/lib/richText";

export function ListingCard({
  id,
  title,
  slug,

  image,
  city,
  type,
  verified,
  rating,
  views,
  listingType,
  capacity,
  priceRange,
  date,
  participants,
  initialIsFavorited,
  tier,
  claimStatus,
  description,
  description_rich,
}: ListingCardData) {
  const { indoor } = capacity || {};
  const kind = getListingTypeSlug(listingType);

  const richDescription = getListingPlainDescription(
    { description_rich, description },
    130,
  );

  return (
    <Link href={`/${listingType}/${slug}`}>
      <Card className="glass-card overflow-hidden h-full flex flex-col">
        <CardHeader className="p-0 relative">
          <div className="relative h-48 w-full">
            <Image
              src={image.url || "/placeholder.svg"}
              alt={image.alt}
              fill
              className="object-cover"
            />
            {verified && (
              <MdVerified className="absolute top-2 left-2 text-neutral-200 h-8 w-8" />
            )}
            {claimStatus === "unclaimed" && (
              <div className="absolute top-2 right-2">
                <UnclaimedBadge />
              </div>
            )}
            <FavoriteButton
              listingType={listingType}
              listingId={id}
              initialIsFavorited={initialIsFavorited}
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
            <div className="flex gap-2 shrink-0">
              {claimStatus === "unclaimed" && <UnclaimedBadge />}
              {tier && tier !== "standard" ? <TierBadge tier={tier} /> : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FaLocationDot className="h-4 w-4" />
              <span>{city}</span>
            </div>

            {indoor && (
              <div className="flex items-center gap-1">
                <FaUsers className="h-4 w-4" />
                <span>{indoor} persoane</span>
              </div>
            )}

            {participants && (
              <div className="flex items-center gap-1">
                <FaUsers className="h-4 w-4" />
                <span>{participants} participanți</span>
              </div>
            )}

            {date && (
              <div className="flex items-center gap-1">
                <FaCalendar className="h-4 w-4" />
                <span>{new Date(date).toLocaleDateString("ro-RO")}</span>
              </div>
            )}
          </div>
          <div className="flex gap-1 flex-wrap">
            {type
              .split(",")
              .slice(0, 3)
              .map((t) => (
                <Badge variant="secondary" key={t}>
                  {t}
                </Badge>
              ))}
          </div>

          {priceRange && (
            <p className="text-sm font-semibold text-foreground">
              {priceRange}
            </p>
          )}
          {richDescription && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {richDescription}
            </p>
          )}
          {rating && rating.average && rating.count ? (
            <div className="flex items-center gap-1 text-sm">
              <FaStar className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{rating?.average}</span>
              <span className="text-muted-foreground">
                · {rating?.count} recenzii
              </span>
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button className="w-full glow-on-hover" aria-label="Vezi detalii">
            Vezi detalii
          </Button>
        </CardFooter>
      </Card>
      {tier === "sponsored" && (
        <ListingCardImpressionsLayer listingId={id} kind={kind} />
      )}
    </Link>
  );
}
