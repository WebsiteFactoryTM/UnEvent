"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, X } from "lucide-react";
// TODO: Restore mock imports when mock files are created
// import { serviceCategories, groupedServiceCategories } from "@/mocks/services/categories"
import type { ServiceFormData } from "@/forms/service/schema";

// Temporary empty fallbacks until mock files are restored
const serviceCategories: Array<{
  value: string;
  label: string;
  category: string;
}> = [];
const groupedServiceCategories: Record<string, typeof serviceCategories> = {};

export function ServicesTab() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ServiceFormData>();

  const selectedCategories = watch("type") || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (categoryValue: string) => {
    const current = selectedCategories;
    if (current.includes(categoryValue)) {
      setValue(
        "type",
        current.filter((c) => c !== categoryValue),
        { shouldValidate: true },
      );
    } else {
      setValue("type", [...current, categoryValue], { shouldValidate: true });
    }
  };

  const handleRemove = (categoryValue: string) => {
    setValue(
      "type",
      selectedCategories.filter((c) => c !== categoryValue),
      { shouldValidate: true },
    );
  };

  const filteredCategories = serviceCategories.filter((cat) =>
    cat.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getCategoryLabel = (value: string) => {
    return serviceCategories.find((c) => c.value === value)?.label || value;
  };

  const getCategoryGroup = (value: string) => {
    return serviceCategories.find((c) => c.value === value)?.category || "";
  };

  // Group filtered categories by their category
  const groupedFiltered = filteredCategories.reduce(
    (acc, cat) => {
      if (!acc[cat.category]) {
        acc[cat.category] = [];
      }
      acc[cat.category].push(cat);
      return acc;
    },
    {} as Record<string, typeof serviceCategories>,
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          Selectează categoriile de servicii
        </h3>
        <p className="text-sm text-muted-foreground">
          Alege toate categoriile care descriu serviciile tale. Poți selecta mai
          multe opțiuni.
        </p>
      </div>

      <div className="space-y-3">
        <Label className="required">Categorii servicii</Label>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-full justify-between h-auto min-h-10 px-3 py-2"
            >
              <span className="text-left">
                {selectedCategories.length === 0
                  ? "Selectează categorii de servicii..."
                  : `${selectedCategories.length} ${selectedCategories.length === 1 ? "categorie selectată" : "categorii selectate"}`}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[--radix-popover-trigger-width] p-0"
            align="start"
          >
            <div className="p-3 border-b">
              <Input
                placeholder="Caută servicii..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
            </div>

            <ScrollArea className="h-[400px]">
              <div className="p-2">
                {Object.keys(groupedFiltered).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Nu s-au găsit categorii de servicii
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedFiltered).map(([category, cats]) => (
                      <div key={category}>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase px-2 py-1.5">
                          {category}
                        </h4>
                        <div className="space-y-1">
                          {cats.map((cat) => (
                            <div
                              key={cat.value}
                              className="flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                              onClick={() => handleToggle(cat.value)}
                            >
                              <Checkbox
                                checked={selectedCategories.includes(cat.value)}
                                onCheckedChange={() => handleToggle(cat.value)}
                              />
                              <label className="flex-1 text-sm cursor-pointer">
                                {cat.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-3 border-t bg-muted/30">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setValue("type", [], { shouldValidate: true });
                  setIsOpen(false);
                }}
                className="w-full"
              >
                Șterge selecțiile
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}

        {/* Selected categories grouped by category */}
        {selectedCategories.length > 0 && (
          <div className="space-y-3 pt-2">
            {Object.entries(
              selectedCategories.reduce(
                (acc, catValue) => {
                  const group = getCategoryGroup(catValue);
                  if (!acc[group]) {
                    acc[group] = [];
                  }
                  acc[group].push(catValue);
                  return acc;
                },
                {} as Record<string, string[]>,
              ),
            ).map(([group, values]) => (
              <div key={group} className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">
                  {group}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {values.map((catValue) => (
                    <Badge
                      key={catValue}
                      variant="secondary"
                      className="pl-3 pr-2 py-1.5 gap-2"
                    >
                      <span>{getCategoryLabel(catValue)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemove(catValue)}
                        className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                        aria-label={`Elimină ${getCategoryLabel(catValue)}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      <div className="p-4 border rounded-lg bg-muted/20">
        <p className="text-sm text-muted-foreground">
          <strong>Sfat:</strong> Selectează toate categoriile relevante pentru
          serviciile tale. Acest lucru te ajută să fii găsit mai ușor de către
          potențialii clienți care caută servicii specifice.
        </p>
      </div>
    </div>
  );
}
