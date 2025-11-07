"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
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
import { City, ListingType as ListingTypePayload } from "@/types/payload-types";
type ListingType = "locatii" | "servicii" | "evenimente";

interface ArchiveFilterProps {
  listingType: ListingType;
  defaultIsOpen?: boolean;
}

export function ArchiveFilter({
  listingType,
  defaultIsOpen = false,
}: ArchiveFilterProps) {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { filters, setFilter, applyFilters, errors, setErrors } = useFilters({
    listingType,
  });
  const { data } = useQuery({
    queryKey: ["taxonomies"],
    queryFn: () => fetchTaxonomies(),
    staleTime: cacheTTL.oneDay,
  });

  const { cities, eventTypes, locationTypes, serviceTypes } = data || {};

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-type">Ce eveniment organizezi?</Label>
                  <SearchableSelect
                    id="event-type"
                    options={
                      eventTypes
                        ?.map((type: ListingTypePayload) => ({
                          value: type.slug || "",
                          label: type.title || "",
                        }))
                        .sort(
                          (
                            a: { label: string; value: string },
                            b: { label: string; value: string },
                          ) => a.label.localeCompare(b.label),
                        ) || []
                    }
                    value={(filters.suitableFor as string) || ""}
                    onValueChange={(v) => {
                      setFilter("suitableFor", v);
                    }}
                    placeholder="Selectează tipul"
                    searchPlaceholder="Caută tip eveniment..."
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Unde (Oraș)</Label>
                  <SearchableSelect
                    id="city"
                    options={
                      cities
                        ?.map((city: City) => ({
                          value: city.slug || "",
                          label: city.name || "",
                        }))
                        .sort(
                          (
                            a: { label: string; value: string },
                            b: { label: string; value: string },
                          ) => a.label.localeCompare(b.label),
                        ) || []
                    }
                    value={String(filters.city || "")}
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
                  <Label htmlFor="location-type">Tip locație</Label>
                  <SearchableSelect
                    id="location-type"
                    options={
                      locationTypes
                        ?.map((type: ListingTypePayload) => ({
                          value: type.slug || "",
                          label: type.title || "",
                        }))
                        .sort(
                          (
                            a: { label: string; value: string },
                            b: { label: string; value: string },
                          ) => a.label.localeCompare(b.label),
                        ) || []
                    }
                    value={String(filters.type || "")}
                    onValueChange={(v) => setFilter("type", v)}
                    placeholder="Selectează tipul"
                    searchPlaceholder="Caută tip locație..."
                    className="w-full"
                  />
                </div>
              </div>

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
                  <SearchableSelect
                    id="service-type"
                    options={
                      serviceTypes
                        ?.map((type: ListingTypePayload) => ({
                          value: type.slug || "",
                          label: type.title || "",
                        }))
                        .sort(
                          (
                            a: { label: string; value: string },
                            b: { label: string; value: string },
                          ) => a.label.localeCompare(b.label),
                        ) || []
                    }
                    value={(filters.type as string) || ""}
                    onValueChange={(v) => setFilter("type", v)}
                    placeholder="Selectează serviciul"
                    searchPlaceholder="Caută serviciu..."
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-city">Unde?</Label>
                  <SearchableSelect
                    id="service-city"
                    options={
                      cities
                        ?.map((city: City) => ({
                          value: city.slug || "",
                          label: city.name || "",
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
                  <SearchableSelect
                    id="service-event"
                    options={
                      eventTypes
                        ?.map((type: ListingTypePayload) => ({
                          value: type.slug || "",
                          label: type.title || "",
                        }))
                        .sort(
                          (
                            a: { label: string; value: string },
                            b: { label: string; value: string },
                          ) => a.label.localeCompare(b.label),
                        ) || []
                    }
                    value={String(filters.suitableFor || "")}
                    onValueChange={(v) => setFilter("suitableFor", v)}
                    placeholder="Selectează tipul"
                    searchPlaceholder="Caută tip eveniment..."
                    className="w-full"
                  />
                </div>
              </div>

              <Button
                className="w-full glow-on-hover"
                onClick={() => {
                  applyFilters();
                  setIsOpen(false);
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
                  <SearchableSelect
                    id="event-category"
                    options={
                      eventTypes
                        ?.map((type: ListingTypePayload) => ({
                          value: type.slug || "",
                          label: type.title || "",
                        }))
                        .sort(
                          (
                            a: { label: string; value: string },
                            b: { label: string; value: string },
                          ) => a.label.localeCompare(b.label),
                        ) || []
                    }
                    value={(filters.type as string) || ""}
                    onValueChange={(v) => setFilter("type", v)}
                    placeholder="Selectează tipul"
                    searchPlaceholder="Caută tip eveniment..."
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-city">Unde?</Label>
                  <SearchableSelect
                    id="event-city"
                    options={
                      cities
                        ?.map((city: City) => ({
                          value: city.slug || "",
                          label: city.name || "",
                        }))
                        .sort(
                          (
                            a: { label: string; value: string },
                            b: { label: string; value: string },
                          ) => a.label.localeCompare(b.label),
                        ) || []
                    }
                    value={String(filters.city || "")}
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
                  <Label htmlFor="event-when">Când?</Label>
                  <Select
                    value={String(filters.eventWhen || "")}
                    onValueChange={(v) => {
                      console.log("Selected eventWhen:", v);
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
                  setIsOpen(false);
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
