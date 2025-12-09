"use client";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SearchableSelect,
  SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { CategoryChipSelect } from "@/components/ui/category-chip-select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  FaMagnifyingGlass,
  FaChevronDown,
  FaChevronUp,
  FaFilter,
} from "react-icons/fa6";
import { useFilters } from "@/hooks/useFilters";
import { fetchTaxonomies } from "@/lib/api/taxonomies";
import { useQuery } from "@tanstack/react-query";
import { cacheTTL } from "@/lib/constants";
import { ListingType as ListingTypePayload } from "@/types/payload-types";
import { useCities } from "@/lib/react-query/cities.queries";
import { useDebounce } from "@/hooks/useDebounce";
import { SearchableSelectV1 } from "../ui/searchable-select-v1";
type ListingType = "locatii" | "servicii" | "evenimente";

interface ArchiveFilterProps {
  listingType: ListingType;
  defaultIsOpen?: boolean;
  showCategoriesOnly?: boolean;
}

export function ArchiveFilter({
  listingType,
  defaultIsOpen = false,
  showCategoriesOnly = false,
}: ArchiveFilterProps) {
  // Helper function to capitalize first letter only
  const capitalizeFirstLetter = useCallback((str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }, []);

  // Helper function to extract unique categories from type arrays
  const extractUniqueCategories = useCallback(
    (types: ListingTypePayload[]): SearchableSelectOption[] => {
      const categoriesMap = new Map<string, string>();
      types?.forEach((type) => {
        if (type.categorySlug && type.category) {
          categoriesMap.set(type.categorySlug, type.category);
        }
      });
      return Array.from(categoriesMap.entries())
        .map(([slug, name]) => ({
          value: slug,
          label: capitalizeFirstLetter(name),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    },
    [capitalizeFirstLetter],
  );

  const [isOpen, setIsOpen] = useState(defaultIsOpen);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { filters, setFilter, setFilters, applyFilters, errors, setErrors } =
    useFilters({
      listingType,
    });
  const { data } = useQuery({
    queryKey: ["taxonomies"],
    queryFn: () => fetchTaxonomies({ fullList: true }),
    staleTime: cacheTTL.oneDay,
  });

  const { eventTypes, locationTypes, serviceTypes } = data || {};
  const [citySearch, setCitySearch] = useState("");
  const debouncedCitySearch = useDebounce(citySearch, 300);
  const { data: citiesData, isLoading: isCitiesLoading } = useCities({
    search: debouncedCitySearch,
    limit: 20,
    // popularFallback: true,
  });

  // Helper function to handle city changes with geo filter updates
  const handleCityChange = useCallback(
    (citySlug: string) => {
      // Find the selected city in citiesData to get its geo coordinates
      const selectedCity = citiesData?.find((city) => city.slug === citySlug);

      // If city has geo coordinates, update geo filters to center on city
      if (
        selectedCity?.geo &&
        Array.isArray(selectedCity.geo) &&
        selectedCity.geo.length === 2
      ) {
        // Cities store geo as [longitude, latitude] (GeoJSON standard)
        const [lng, lat] = selectedCity.geo;
        // Update city and geo filters together
        setFilters({
          city: citySlug,
          // Clear old geo filters and set new ones based on city center
          lat: lat,
          lng: lng,
          mapCenterLat: lat,
          mapCenterLng: lng,
          mapZoom: 12, // Default zoom for city view
          radius: undefined, // Clear radius - let backend use default or calculate
        });
      } else {
        // City doesn't have geo - just update city and clear geo filters
        setFilters({
          city: citySlug,
          lat: undefined,
          lng: undefined,
          mapCenterLat: undefined,
          mapCenterLng: undefined,
          mapZoom: undefined,
          radius: undefined,
        });
      }
      setErrors({ city: "" });
    },
    [citiesData, setFilters, setErrors],
  );

  const eventWhenOptions = [
    { value: "orice", label: "Orice dată" },
    { value: "astazi", label: "Astăzi" },
    { value: "maine", label: "Mâine" },
    { value: "saptamana", label: "Săptămâna aceasta" },
    { value: "saptamana-viitoare", label: "Săptămâna viitoare" },
    { value: "luna", label: "Luna aceasta" },
    { value: "specific", label: "Dată specifică" },
  ];

  const filterButtonText = {
    locatii: "Filtrează locații",
    servicii: "Filtrează servicii",
    evenimente: "Filtrează evenimente",
  }[listingType];

  return (
    <div className="space-y-4">
      {/* Toggle Button */}
      {!defaultIsOpen && (
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="w-full md:w-auto glass-card border-border/50 hover:bg-muted/50 transition-all"
        >
          <FaFilter className="mr-2 h-4 w-4" />
          {filterButtonText}
          {isOpen ? (
            <FaChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <FaChevronDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      )}

      {/* Collapsible Filter Section */}
      {isOpen && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          {listingType === "locatii" && (
            <div className="glass-card p-6 space-y-4">
              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-type">Ce eveniment organizezi?</Label>

                  <SearchableSelectV1
                    id="event-type"
                    groupEnabled={!showCategoriesOnly}
                    options={
                      showCategoriesOnly
                        ? extractUniqueCategories(eventTypes || [])
                        : eventTypes
                            ?.map((type: ListingTypePayload) => ({
                              value: type.slug || "",
                              label: type.title || "",
                              group: type.category || "",
                            }))
                            .sort((a, b) => a.label.localeCompare(b.label)) ||
                          []
                    }
                    value={
                      showCategoriesOnly
                        ? (filters.suitableForCategory as string) || ""
                        : (filters.suitableFor as string) || ""
                    }
                    onValueChange={(v) =>
                      showCategoriesOnly
                        ? setFilter("suitableForCategory", v)
                        : setFilter("suitableFor", v)
                    }
                    placeholder="Selectează tipul"
                    searchPlaceholder="Caută tip eveniment..."
                    variant={showCategoriesOnly ? "chip" : "list"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Unde (Oraș)</Label>
                  <SearchableSelectV1
                    id="city"
                    searchValue={citySearch}
                    onSearchChange={setCitySearch}
                    filterByLabel
                    groupEnabled
                    options={
                      citiesData
                        ?.map((city) => ({
                          value: city.slug || "",
                          label: city.name || "",
                          group: city.county || "",
                        }))
                        .sort(
                          (
                            a: { label: string; value: string },
                            b: { label: string; value: string },
                          ) => a.label.localeCompare(b.label),
                        ) || []
                    }
                    value={String(filters.city || "")}
                    onValueChange={handleCityChange}
                    placeholder="Selectează orașul"
                    searchPlaceholder="Caută oraș..."
                    className="w-full"
                    error={errors.city}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location-type">Tip locație</Label>

                  <SearchableSelectV1
                    id="location-type"
                    groupEnabled={!showCategoriesOnly}
                    options={
                      showCategoriesOnly
                        ? extractUniqueCategories(locationTypes || [])
                        : locationTypes
                            ?.map((type: ListingTypePayload) => ({
                              value: type.slug || "",
                              label: type.title || "",
                              group: type.category || "",
                            }))
                            .sort(
                              (
                                a: { label: string; value: string },
                                b: { label: string; value: string },
                              ) => a.label.localeCompare(b.label),
                            ) || []
                    }
                    value={
                      showCategoriesOnly
                        ? (filters.typeCategory as string) || ""
                        : (filters.type as string) || ""
                    }
                    onValueChange={(v) =>
                      showCategoriesOnly
                        ? setFilter("typeCategory", v)
                        : setFilter("type", v)
                    }
                    placeholder="Selectează tipul"
                    searchPlaceholder="Caută tip locație..."
                    variant={showCategoriesOnly ? "chip" : "list"}
                  />
                </div>
              </div>
              {!showCategoriesOnly ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full justify-between"
                  >
                    <span>Avansate</span>
                    {showAdvanced ? (
                      <FaChevronUp className="h-4 w-4" />
                    ) : (
                      <FaChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  {showAdvanced && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                      <div className="space-y-4">
                        <Label>Capacitate (persoane)</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[
                              (filters.capacityMin || 0) as number,
                              (filters.capacityMax || 500) as number,
                            ]}
                            onValueChange={(v) => {
                              setFilter("capacityMin", v[0]);
                              setFilter("capacityMax", v[1]);
                            }}
                            max={1000}
                            step={10}
                            className="w-full"
                          />
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={(filters.capacityMin || 0) as number}
                              readOnly
                              className="w-24"
                            />
                            <span className="flex items-center">-</span>
                            <Input
                              type="number"
                              value={(filters.capacityMax || 500) as number}
                              readOnly
                              className="w-24"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>Preț locație (RON)</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[
                              (filters.priceMin || 0) as number,
                              (filters.priceMax || 10000) as number,
                            ]}
                            onValueChange={(v) => {
                              setFilter("priceMin", v[0]);
                              setFilter("priceMax", v[1]);
                            }}
                            max={10000}
                            step={100}
                            className="w-full"
                          />
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={(filters.priceMin || 0) as number}
                              readOnly
                              className="w-24"
                            />
                            <span className="flex items-center">-</span>
                            <Input
                              type="number"
                              value={(filters.priceMax || 10000) as number}
                              readOnly
                              className="w-24"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : null}

              <Button
                className="w-full glow-on-hover"
                onClick={() => {
                  applyFilters();
                }}
              >
                <FaMagnifyingGlass className="mr-2 h-4 w-4" />
                Caută locații
              </Button>
            </div>
          )}

          {listingType === "servicii" && (
            <div className="glass-card p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service-type">Ce serviciu cauți?</Label>

                  <SearchableSelectV1
                    id="service-type"
                    groupEnabled={!showCategoriesOnly}
                    options={
                      showCategoriesOnly
                        ? extractUniqueCategories(serviceTypes || [])
                        : serviceTypes
                            ?.map((type: ListingTypePayload) => ({
                              value: type.slug || "",
                              label: type.title || "",
                              group: type.category || "",
                            }))
                            .sort(
                              (
                                a: { label: string; value: string },
                                b: { label: string; value: string },
                              ) => a.label.localeCompare(b.label),
                            ) || []
                    }
                    value={
                      showCategoriesOnly
                        ? (filters.typeCategory as string) || ""
                        : (filters.type as string) || ""
                    }
                    onValueChange={(v) =>
                      showCategoriesOnly
                        ? setFilter("typeCategory", v)
                        : setFilter("type", v)
                    }
                    placeholder="Selectează serviciul"
                    searchPlaceholder="Caută serviciu..."
                    variant={showCategoriesOnly ? "chip" : "list"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-city">Unde?</Label>
                  <SearchableSelectV1
                    id="service-city"
                    searchValue={citySearch}
                    onSearchChange={setCitySearch}
                    filterByLabel
                    groupEnabled
                    options={
                      citiesData
                        ?.map((city) => ({
                          value: city.slug || "",
                          label: city.name || "",
                          group: city.county || "",
                        }))
                        .sort(
                          (
                            a: { label: string; value: string },
                            b: { label: string; value: string },
                          ) => a.label.localeCompare(b.label),
                        ) || []
                    }
                    value={(filters.city as string) || ""}
                    onValueChange={(v) => {
                      setFilter("city", v);
                      setErrors({ city: "" });
                    }}
                    placeholder="Selectează orașul"
                    searchPlaceholder="Caută oraș..."
                    className="w-full"
                    error={errors.city}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-event">
                    Pentru ce tip de eveniment?
                  </Label>

                  <SearchableSelectV1
                    id="service-event"
                    groupEnabled={!showCategoriesOnly}
                    options={
                      showCategoriesOnly
                        ? extractUniqueCategories(eventTypes || [])
                        : eventTypes
                            ?.map((type: ListingTypePayload) => ({
                              value: type.slug || "",
                              label: type.title || "",
                              group: type.category || "",
                            }))
                            .sort(
                              (
                                a: { label: string; value: string },
                                b: { label: string; value: string },
                              ) => a.label.localeCompare(b.label),
                            ) || []
                    }
                    value={
                      showCategoriesOnly
                        ? (filters.suitableForCategory as string) || ""
                        : (filters.suitableFor as string) || ""
                    }
                    onValueChange={(v) =>
                      showCategoriesOnly
                        ? setFilter("suitableForCategory", v)
                        : setFilter("suitableFor", v)
                    }
                    placeholder="Selectează tipul"
                    searchPlaceholder="Caută tip eveniment..."
                    variant={showCategoriesOnly ? "chip" : "list"}
                  />
                </div>
              </div>

              <Button
                className="w-full glow-on-hover"
                onClick={() => {
                  applyFilters();
                }}
              >
                <FaMagnifyingGlass className="mr-2 h-4 w-4" />
                Caută servicii
              </Button>
            </div>
          )}

          {listingType === "evenimente" && (
            <div className="glass-card p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-category">Ce tip de eveniment?</Label>

                  <SearchableSelectV1
                    id="event-category"
                    groupEnabled={!showCategoriesOnly}
                    options={
                      showCategoriesOnly
                        ? extractUniqueCategories(eventTypes || [])
                        : eventTypes
                            ?.map((type: ListingTypePayload) => ({
                              value: type.slug || "",
                              label: type.title || "",
                              group: type.category || "",
                            }))
                            .sort(
                              (
                                a: { label: string; value: string },
                                b: { label: string; value: string },
                              ) => a.label.localeCompare(b.label),
                            ) || []
                    }
                    value={
                      showCategoriesOnly
                        ? (filters.typeCategory as string) || ""
                        : (filters.type as string) || ""
                    }
                    onValueChange={(v) =>
                      showCategoriesOnly
                        ? setFilter("typeCategory", v)
                        : setFilter("type", v)
                    }
                    placeholder="Selectează tipul"
                    searchPlaceholder="Caută tip eveniment..."
                    variant={showCategoriesOnly ? "chip" : "list"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-city">Unde?</Label>
                  <SearchableSelectV1
                    id="event-city"
                    searchValue={citySearch}
                    onSearchChange={setCitySearch}
                    filterByLabel
                    groupEnabled
                    options={
                      citiesData
                        ?.map((city) => ({
                          value: city.slug || "",
                          label: city.name || "",
                          group: city.county || "",
                        }))
                        .sort(
                          (
                            a: { label: string; value: string },
                            b: { label: string; value: string },
                          ) => a.label.localeCompare(b.label),
                        ) || []
                    }
                    value={String(filters.city || "")}
                    onValueChange={handleCityChange}
                    placeholder="Selectează orașul"
                    searchPlaceholder="Caută oraș..."
                    className="w-full"
                    error={errors.city}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-when">Când?</Label>
                  <Select
                    value={String(filters.eventWhen || "")}
                    onValueChange={(v) => {
                      setFilter("eventWhen", v);
                      // Clear specific date when changing option
                      if (v !== "specific") {
                        setFilter("eventDate", undefined);
                      }
                    }}
                  >
                    <SelectTrigger id="event-when" className="w-full">
                      <SelectValue placeholder="Selectează data" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventWhenOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {String(filters.eventWhen) === "specific" && (
                    <div className="space-y-2">
                      <Label htmlFor="event-date">Data specifică</Label>
                      <input
                        type="date"
                        id="event-date"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={filters.eventDate || ""}
                        onChange={(e) => setFilter("eventDate", e.target.value)}
                        min={new Date().toISOString().split("T")[0]} // Today or later
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button
                className="w-full glow-on-hover"
                onClick={() => {
                  applyFilters();
                }}
              >
                <FaMagnifyingGlass className="mr-2 h-4 w-4" />
                Caută {listingType}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
