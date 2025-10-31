"use client";

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

interface ListingCardProps {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  city: string;
  type: string;
  verified: boolean;
  rating?: {
    average: number;
    count: number;
  };
  views: number;
  listingType: "locatii" | "servicii" | "evenimente";
  capacity?: Location["capacity"];
  priceRange?: string;
  date?: string;
  participants?: number;
}

export function ListingCard({
  id,
  name,
  slug,
  description,
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
}: ListingCardProps) {
  const { indoor } = capacity || {};
  return (
    <Card className="glass-card overflow-hidden h-full flex flex-col">
      <CardHeader className="p-0 relative">
        <div className="relative h-48 w-full">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover"
          />
          {verified && (
            <Badge className="absolute top-2 left-2 bg-green-500/90 backdrop-blur-sm">
              Verificat
            </Badge>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          >
            <FaHeart className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 space-y-3">
        <h3 className="font-semibold text-lg line-clamp-2">{name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {description}
        </p>

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

          <div className="flex items-center gap-1">
            <FaEye className="h-4 w-4" />
            <span>{views.toLocaleString("ro-RO")}</span>
          </div>

          <Badge variant="outline">{type}</Badge>
        </div>

        {priceRange && (
          <p className="text-sm font-semibold text-foreground">{priceRange}</p>
        )}

        {rating && (
          <div className="flex items-center gap-1 text-sm">
            <FaStar className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold">{rating.average}</span>
            <span className="text-muted-foreground">
              · {rating.count} recenzii
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full glow-on-hover">
          <Link href={`/${listingType}/${slug}`}>Vezi detalii</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
