"use client";

import { useRouter } from "next/navigation";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useEffect, useState } from "react";

type ListingType = "locatii" | "servicii" | "evenimente";

export interface CityTypeaheadProps {
  listingType: ListingType;
  cities: { slug: string; label: string }[];
}

export function CityTypeahead({ listingType, cities }: CityTypeaheadProps) {
  const router = useRouter();
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    const last = window.localStorage.getItem("lastCity");
    if (last && cities.some((c) => c.slug === last)) setValue(last);
  }, [cities]);

  const options = cities.map((c) => ({ value: c.slug, label: c.label }));

  return (
    <div className="w-full">
      <label htmlFor="city-typeahead" className="sr-only">
        Alege orașul
      </label>
      <SearchableSelect
        id="city-typeahead"
        options={options}
        value={value}
        onValueChange={(slug) => {
          setValue(slug);
          if (!slug) return;
          try {
            window.localStorage.setItem("lastCity", slug);
          } catch {}
          router.push(`/${listingType}/oras/${slug}`);
        }}
        placeholder="Caută orașul..."
        searchPlaceholder="Tastează pentru a căuta..."
        emptyText="Nu s-au găsit orașe"
        className="h-12 text-base"
      />
    </div>
  );
}
