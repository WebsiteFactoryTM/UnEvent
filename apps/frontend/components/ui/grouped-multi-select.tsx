"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export interface GroupedMultiSelectItem {
  id: number;
  title: string;
  category?: string | null;
}

interface GroupedMultiSelectProps {
  label: string;
  description?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  items: GroupedMultiSelectItem[];
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  required?: boolean;
}

export function GroupedMultiSelect({
  label,
  description,
  placeholder = "Selectează...",
  searchPlaceholder = "Caută...",
  items,
  selectedIds,
  onSelectionChange,
  isLoading = false,
  emptyMessage = "Nu s-au găsit rezultate.",
  errorMessage,
  required = false,
}: GroupedMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const filteredItems = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);
    return items.filter((item) =>
      normalizeText(item.title).includes(normalizedSearch),
    );
  }, [items, searchTerm]);

  const groupedItems = useMemo(() => {
    return filteredItems.reduce(
      (acc: Record<string, GroupedMultiSelectItem[]>, item) => {
        const category = item.category || "Altele";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      },
      {},
    );
  }, [filteredItems]);

  const handleToggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((currentId) => currentId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleRemove = (id: number) => {
    onSelectionChange(selectedIds.filter((currentId) => currentId !== id));
  };

  const handleCategoryToggle = (category: string) => {
    const categoryItems = groupedItems[category] || [];
    const categoryIds = categoryItems.map((item) => item.id);

    // Check if all items in this category are currently selected
    const allSelected = categoryIds.every((id) => selectedIds.includes(id));

    let newSelectedIds: number[];

    if (allSelected) {
      // Deselect all items in this category
      newSelectedIds = selectedIds.filter((id) => !categoryIds.includes(id));
    } else {
      // Select all items in this category (merge unique)
      newSelectedIds = Array.from(new Set([...selectedIds, ...categoryIds]));
    }

    onSelectionChange(newSelectedIds);
  };

  const getLabel = (id: number) => {
    return items.find((item) => item.id === id)?.title || String(id);
  };

  return (
    <div className="space-y-3">
      <Label className={cn(required && "required")}>{label}</Label>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 px-3 py-2"
          >
            <span className="text-left">
              {selectedIds.length === 0
                ? placeholder
                : `${selectedIds.length} ${
                    selectedIds.length === 1
                      ? "element selectat"
                      : "elemente selectate"
                  }`}
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
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
            />
          </div>

          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Se încarcă...
                </p>
              ) : Object.keys(groupedItems).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {emptyMessage}
                </p>
              ) : (
                Object.keys(groupedItems).map((category) => {
                  const categoryItems = groupedItems[category];
                  const categoryIds = categoryItems.map((item) => item.id);
                  const allCategorySelected =
                    categoryIds.length > 0 &&
                    categoryIds.every((id) => selectedIds.includes(id));
                  const someCategorySelected = categoryIds.some((id) =>
                    selectedIds.includes(id),
                  );

                  return (
                    <div key={category} className="mb-4 last:mb-0">
                      <div
                        className="flex items-center justify-between px-2 mb-2 cursor-pointer hover:bg-muted/50 rounded-sm py-1 group"
                        onClick={() => handleCategoryToggle(category)}
                      >
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                          {category}
                        </p>
                        <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity uppercase font-medium">
                          {allCategorySelected
                            ? "Deselectează tot"
                            : "Selectează tot"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {categoryItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                            onClick={() => handleToggle(item.id)}
                          >
                            <Checkbox
                              checked={selectedIds.includes(item.id)}
                              onCheckedChange={() => handleToggle(item.id)}
                            />
                            <label className="flex-1 text-sm cursor-pointer">
                              {item.title}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          <div className="p-3 border-t bg-muted/30">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onSelectionChange([]);
                setOpen(false);
              }}
              className="w-full"
            >
              Șterge selecțiile
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {errorMessage && (
        <p className="text-sm text-destructive">{errorMessage}</p>
      )}

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((id) => (
            <Badge
              key={id}
              variant="secondary"
              className="pl-3 pr-2 py-1.5 gap-2"
            >
              <span>{getLabel(id)}</span>
              <button
                type="button"
                onClick={() => handleRemove(id)}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                aria-label={`Elimină ${getLabel(id)}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
