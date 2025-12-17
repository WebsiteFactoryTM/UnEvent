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
  const currentCategory = pathParts[3]; // e.g. "nunti"

  // Derive initial filters from query params
  const initialFilters = useMemo(() => {
    const params = getFiltersFromSearchParams(searchParams);
    // If currentCategory is present in path, map it to typeCategory
    const categoryFilters = currentCategory
      ? { typeCategory: currentCategory }
      : {};
    return { ...defaults, city: currentCity, ...categoryFilters, ...params };
  }, [searchParams, defaults, currentCity, currentCategory]);

  // Track previous city to detect changes
  const prevCityRef = useRef<string | undefined>(currentCity);

  // Local state for pending filter changes
  const [pendingFilters, setPendingFilters] = useState<
    Record<string, string | number | undefined>
  >({
    ...initialFilters,
    city: currentCity,
    typeCategory: currentCategory,
  });

  // Use ref to always get the latest pendingFilters value (avoids closure stale state)
  const pendingFiltersRef = useRef(pendingFilters);
  useEffect(() => {
    pendingFiltersRef.current = pendingFilters;
  }, [pendingFilters]);

  // Detect city changes via URL (path) and clear geo filters
  useEffect(() => {
    // Only clear geo filters if the city changed AND we don't have new geo params in the URL
    // This prevents clearing geo filters when the user navigates to a new city WITH geo coordinates (e.g. from a link)
    if (prevCityRef.current && prevCityRef.current !== currentCity) {
      const params = new URLSearchParams(searchParams);
      const hasGeoParams =
        params.has("lat") || params.has("lng") || params.has("radius");

      if (!hasGeoParams) {
        // City changed via URL without new coordinates - clear old geo filters
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
    }
    prevCityRef.current = currentCity;
  }, [currentCity, searchParams]);

  // Current filters (combination of URL params and pending changes)
  const filters = useMemo(() => {
    return { ...initialFilters, ...pendingFilters } as Record<
      string,
      string | number | undefined
    >;
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

      console.log("[useFilters] Applying filters:", {
        filtersToApply,
        overrideFilters,
        pending: pendingFiltersRef.current,
        currentCity,
        currentCategory,
      });

      // Handle city filter (path-based)
      const cityValue = filtersToApply.city;

      // Handle category filter - use explicitly passed value, or current URL value if not present in update
      const categoryValue =
        filtersToApply.typeCategory !== undefined
          ? filtersToApply.typeCategory
          : currentCategory;

      console.log("[useFilters] Extracted path values:", {
        cityValue,
        categoryValue,
        source: filtersToApply.typeCategory !== undefined ? "filters" : "url",
      });

      // Apply other filters to query params
      Object.entries(filtersToApply).forEach(([key, value]) => {
        if (key === "city") return; // Already handled above
        if (key === "typeCategory") return; // Handled in path

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

      // Handle category in path
      if (categoryValue && typeof categoryValue === "string") {
        newPath = `${newPath}/${categoryValue}`;
      } else if (currentCategory && !filtersToApply.typeCategory) {
        // Fallback: if category wasn't explicitly cleared (set to null/empty) in filtersToApply,
        // but it IS in the current URL, preserve it.
        // This handles cases where filtersToApply might be a partial update (like map bounds) that doesn't include the category.
        newPath = `${newPath}/${currentCategory}`;
      }

      // If a specific type is selected, we might need to handle category redirects
      // Ideally, the UI should ensure only valid types for the current category are selectable.
      // But if a type is selected that implies a different category, we could potentially detect it here
      // if we had access to the full taxonomy tree. For now, we assume the UI handles this or the user
      // explicitly navigated.

      console.log("[useFilters] Constructed new path:", newPath);

      if (!cityValue && !params.get("city") && !overrideFilters) {
        setErrors({ city: "Orașul este obligatoriu" });
        return;
      }

      const query = params.toString();

      const newUrl = `${newPath}${query ? `?${query}` : ""}`;

      // Determine navigation method based on what changed
      // If path segments changed (city or category), use push (add to history)
      // If only query params changed (filters), use replace (update current history entry)
      const pathChanged = newPath !== pathname;
      const navigationMethod =
        pathChanged || overrideFilters?.forcePush
          ? router.push
          : router.replace;

      // Use startTransition to mark navigation as non-urgent
      startTransition(() => {
        navigationMethod(newUrl, {
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
