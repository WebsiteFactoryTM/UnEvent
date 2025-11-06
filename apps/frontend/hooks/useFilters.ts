"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

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

export function useFilters(defaults?: Record<string, string | number>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [errors, setErrors] = useState<Record<string, string>>({});
  // Extract current entity + city from path
  const pathParts = pathname.split("/").filter(Boolean);
  const entity = pathParts[0]; // e.g. "servicii"
  const currentCity = pathParts[2]; // e.g. "timisoara"
  // Derive initial filters from query params
  const initialFilters = useMemo(() => {
    const params = getFiltersFromSearchParams(searchParams);
    return { ...defaults, ...params };
  }, [searchParams, defaults]);

  // Local state for pending filter changes
  const [pendingFilters, setPendingFilters] = useState<
    Record<string, string | number | undefined>
  >({
    ...initialFilters,
    city: currentCity,
  });

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

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams);

    // Handle city filter (path-based)
    const cityValue = pendingFilters.city;

    // Apply other filters to query params
    Object.entries(pendingFilters).forEach(([key, value]) => {
      if (key === "city") return; // Already handled above

      if (value === undefined || value === "" || value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    let newPath = `/${entity}/oras/`;
    if (cityValue && typeof cityValue === "string") {
      newPath = `/${entity}/oras/${cityValue}`;
    }

    console.log(cityValue, params.get("city"));

    if (!cityValue && !params.get("city")) {
      setErrors({ city: "Orașul este obligatoriu" });
      return;
    }

    const query = params.toString();

    router.push(`${newPath}${query ? `?${query}` : ""}`, {
      scroll: false,
    });

    // Clear pending filters after applying
    // setPendingFilters({});
  }, [router, pathname, searchParams, entity, pendingFilters]);

  const resetFilters = useCallback(() => {
    setPendingFilters({});
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  const hasPendingChanges = useMemo(() => {
    return Object.keys(pendingFilters).length > 0;
  }, [pendingFilters]);

  return {
    filters,
    setFilter,
    applyFilters,
    resetFilters,
    hasPendingChanges,
    entity,
    currentCity,
    errors,
    setErrors,
  };
}
