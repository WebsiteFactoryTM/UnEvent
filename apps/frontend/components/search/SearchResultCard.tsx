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
        "flex items-center gap-4 w-full p-3 rounded-lg",
        "bg-card border border-border",
        "hover:bg-accent hover:border-accent-foreground/20",
        "transition-colors duration-200",
        "min-h-[80px] max-h-[100px]",
      )}
    >
      {/* Image thumbnail */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
        {imageUrl && imageUrl !== "/placeholder.svg" ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            <FaLocationDot className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {/* Title */}
        <h3 className="font-semibold text-sm line-clamp-1 text-foreground">
          {result.title}
        </h3>

        {/* Metadata row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {result.cityName && (
            <div className="flex items-center gap-1">
              <FaLocationDot className="h-3 w-3" />
              <span className="line-clamp-1">{result.cityName}</span>
            </div>
          )}
        </div>

        {/* Type badges - max 5, wrapped */}
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

          return (
            <div className="flex gap-1.5 flex-wrap">
              {types.slice(0, 3).map((typeLabel, index) => (
                <Badge
                  key={`${typeLabel}-${index}`}
                  variant="secondary"
                  className="text-xs px-1.5 py-0.5"
                >
                  {typeLabel}
                </Badge>
              ))}
              {types.length > 3 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  +{types.length - 3}
                </Badge>
              )}
            </div>
          );
        })()}
      </div>
    </Link>
  );
}
