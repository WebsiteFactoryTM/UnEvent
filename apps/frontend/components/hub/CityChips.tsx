"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";

type ListingType = "locatii" | "servicii" | "evenimente";

export interface CityChipsProps {
  listingType: ListingType;
  options: { slug: string; label: string }[];
  defaultCity?: string;
}

export function CityChips({
  listingType,
  options,
  defaultCity,
}: CityChipsProps) {
  const router = useRouter();
  const lastCity = useMemo(() => {
    if (defaultCity) return defaultCity;
    try {
      return window.localStorage.getItem("lastCity") || undefined;
    } catch {
      return undefined;
    }
  }, [defaultCity]);

  const go = (city: string) => {
    router.push(`/${listingType}/oras/${city}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Button
          key={opt.slug}
          variant="outline"
          className="rounded-full"
          aria-label={`Vezi orașul ${opt.label}`}
          onClick={() => {
            const city = lastCity;
            if (city) return go(city);
          }}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
