"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SelectCityDialog } from "./SelectCityDialog";

type ListingType = "locatii" | "servicii" | "evenimente";

export interface OccasionChipsProps {
  listingType: ListingType;
  options: { slug: string; label: string }[];
  defaultCity?: string;
  cities: { slug: string; label: string }[];
}

export function OccasionChips({
  listingType,
  options,
  defaultCity,
  cities,
}: OccasionChipsProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingType, setPendingType] = useState<string | null>(null);
  const lastCity = useMemo(() => {
    if (defaultCity) return defaultCity;
    try {
      return window.localStorage.getItem("lastCity") || undefined;
    } catch {
      return undefined;
    }
  }, [defaultCity]);

  const go = (city: string, typeSlug: string) => {
    router.push(`/${listingType}/oras/${city}/${typeSlug}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Button
          key={opt.slug}
          variant="outline"
          className="rounded-full"
          aria-label={`Vezi ${opt.label}`}
          onClick={() => {
            const city = lastCity;
            if (city) return go(city, opt.slug);
            setPendingType(opt.slug);
            setDialogOpen(true);
          }}
        >
          {opt.label}
        </Button>
      ))}

      <SelectCityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        listingType={listingType}
        cities={cities}
        onConfirm={(citySlug) => {
          if (pendingType) go(citySlug, pendingType);
          setPendingType(null);
        }}
      />
    </div>
  );
}
