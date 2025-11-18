"use client";
import { ListingType } from "@/types/listings";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
  startTransition,
} from "react";

function getFiltersFromSearchParams(searchParams: URLSearchParams) {
  const entries = Object.fromEntries(searchParams.entries());
  const parsed: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(entries)) {
    if (key === "city") continue; // handled in path
    const num = Number(value);
    parsed[key] = isNaN(num) ? value : num;
  }

  return parsed;
}

export function useFilters(
  defaults?: { listingType: ListingType } & Record<string, string | number>,
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [errors, setErrors] = useState<Record<string, string>>({});
  // Extract current entity + city from path
  const pathParts = pathname.split("/").filter(Boolean);
  const entity = pathParts[0] || defaults?.listingType; // e.g. "servicii"
  const currentCity = pathParts[2]; // e.g. "timisoara"

  // Derive initial filters from query params
  const initialFilters = useMemo(() => {
    const params = getFiltersFromSearchParams(searchParams);
    return { ...defaults, ...params };
  }, [searchParams, defaults]);

  // Track previous city to detect changes
  const prevCityRef = useRef<string | undefined>(currentCity);

  // Local state for pending filter changes
  const [pendingFilters, setPendingFilters] = useState<
    Record<string, string | number | undefined>
  >({
    ...initialFilters,
    city: currentCity,
  });

  // Use ref to always get the latest pendingFilters value (avoids closure stale state)
  const pendingFiltersRef = useRef(pendingFilters);
  useEffect(() => {
    pendingFiltersRef.current = pendingFilters;
  }, [pendingFilters]);

  // Detect city changes via URL (path) and clear geo filters
  useEffect(() => {
    if (prevCityRef.current && prevCityRef.current !== currentCity) {
      // City changed via URL - clear geo filters as they're no longer accurate
      setPendingFilters((prev) => ({
        ...prev,
        lat: undefined,
        lng: undefined,
        mapCenterLat: undefined,
        mapCenterLng: undefined,
        mapZoom: undefined,
        radius: undefined,
      }));
    }
    prevCityRef.current = currentCity;
  }, [currentCity]);

  // Current filters (combination of URL params and pending changes)
  const filters = useMemo(() => {
    return { ...initialFilters, ...pendingFilters };
  }, [initialFilters, pendingFilters]);

  const setFilter = useCallback((key: string, value?: string | number) => {
    // Update local state immediately

    setPendingFilters((prev) => ({
      ...prev,
      [key]:
        value === undefined || value === "" || value === null
          ? undefined
          : value,
    }));
  }, []);

  const setFilters = useCallback(
    (filters: Record<string, string | number | undefined>) => {
      // Update multiple filters at once
      setPendingFilters((prev) => {
        const updated = { ...prev };
        Object.entries(filters).forEach(([key, value]) => {
          updated[key] =
            value === undefined || value === "" || value === null
              ? undefined
              : value;
        });
        return updated;
      });
    },
    [],
  );

  const applyFilters = useCallback(
    (overrideFilters?: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams);

      // Use override filters if provided, otherwise use latest pendingFilters from ref
      // This ensures we always get the most recent state, even if called immediately after setFilter
      const filtersToApply = overrideFilters || pendingFiltersRef.current;

      // Handle city filter (path-based)
      const cityValue = filtersToApply.city;

      // Apply other filters to query params
      Object.entries(filtersToApply).forEach(([key, value]) => {
        if (key === "city") return; // Already handled above

        if (value === undefined || value === "" || value === null) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      let newPath = `/${entity}/oras/${currentCity}`;
      if (cityValue && typeof cityValue === "string") {
        newPath = `/${entity}/oras/${cityValue}`;
      }

      if (!cityValue && !params.get("city") && !overrideFilters) {
        setErrors({ city: "Orașul este obligatoriu" });
        return;
      }

      const query = params.toString();

      const newUrl = `${newPath}${query ? `?${query}` : ""}`;

      // Use replace instead of push to avoid showing loading state on filter changes
      // Use startTransition to mark navigation as non-urgent
      startTransition(() => {
        router.replace(newUrl, {
          scroll: false,
        });
      });

      // Clear pending filters after applying
      // setPendingFilters({});
    },
    [router, pathname, searchParams, entity, currentCity],
  );

  const resetFilters = useCallback(() => {
    setPendingFilters({});
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [router, pathname]);

  const hasPendingChanges = useMemo(() => {
    return Object.keys(pendingFilters).length > 0;
  }, [pendingFilters]);

  return {
    filters,
    setFilter,
    setFilters,
    applyFilters,
    resetFilters,
    hasPendingChanges,
    entity,
    currentCity,
    errors,
    setErrors,
  };
}
