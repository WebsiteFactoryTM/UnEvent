"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { FaLocationDot } from "react-icons/fa6";
import type { SearchResult } from "@/lib/search/types";
import { getListingDetailRoute } from "@/lib/search/routing";
import { cn } from "@/lib/utils";

interface SearchResultCardProps {
  result: SearchResult;
  onClick?: () => void;
}

export function SearchResultCard({ result, onClick }: SearchResultCardProps) {
  const href = result.slug
    ? getListingDetailRoute(result.collection, result.slug)
    : "#";

  const imageUrl = result.image?.url || "/placeholder.svg";
  const imageAlt = result.image?.alt || result.title || "Listing image";

  console.log(`[SearchResultCard] Result ${result.id}:`, {
    title: result.title,
    image: result.image,
    imageUrl,
    hasImage: !!result.image?.url,
  });

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 sm:gap-3 w-full p-2 sm:p-3 rounded-lg",
        "bg-card border border-border",
        "hover:bg-accent hover:border-accent-foreground/20",
        "transition-colors duration-200",
      )}
    >
      {/* Image thumbnail */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
        {imageUrl && imageUrl !== "/placeholder.svg" ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 64px, 80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            <FaLocationDot className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1 sm:gap-1.5">
        {/* Title */}
        <h3 className="font-semibold text-sm line-clamp-2 sm:line-clamp-1 text-foreground">
          {result.title}
        </h3>

        {/* Metadata row */}
        {result.cityName && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FaLocationDot className="h-3 w-3 flex-shrink-0" />
            <span className="line-clamp-1">{result.cityName}</span>
          </div>
        )}

        {/* Type badges - max 3 on mobile, max 5 on desktop */}
        {(() => {
          // Ensure type is always an array
          let types: string[] = [];
          if (result.type) {
            if (Array.isArray(result.type)) {
              types = result.type.filter((t) => t && typeof t === "string");
            } else if (typeof result.type === "string") {
              const typeString: string = result.type; // Explicitly type as string
              // Handle JSON string or comma-separated string
              try {
                const parsed = JSON.parse(typeString);
                if (Array.isArray(parsed)) {
                  types = parsed.filter((t) => t && typeof t === "string");
                } else {
                  types = typeString.includes(",")
                    ? typeString
                        .split(",")
                        .map((t: string) => t.trim())
                        .filter(Boolean)
                    : typeString.trim()
                      ? [typeString.trim()]
                      : [];
                }
              } catch {
                types = typeString.includes(",")
                  ? typeString
                      .split(",")
                      .map((t: string) => t.trim())
                      .filter(Boolean)
                  : typeString.trim()
                    ? [typeString.trim()]
                    : [];
              }
            }
          }

          if (types.length === 0) return null;

          // Show max 2 badges on mobile, 3 on desktop
          const maxBadges = 2;
          const displayTypes = types.slice(0, maxBadges);
          const remaining = types.length - maxBadges;

          return (
            <div className="flex gap-1 sm:gap-1.5 flex-wrap items-center">
              {displayTypes.map((typeLabel, index) => (
                <Badge
                  key={`${typeLabel}-${index}`}
                  variant="secondary"
                  className="text-[10px] sm:text-xs px-1.5 py-0 sm:py-0.5 leading-tight"
                >
                  {typeLabel}
                </Badge>
              ))}
              {remaining > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] sm:text-xs px-1.5 py-0 sm:py-0.5 leading-tight"
                >
                  +{remaining}
                </Badge>
              )}
            </div>
          );
        })()}
      </div>
    </Link>
  );
}
