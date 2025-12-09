"use client";

import * as React from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa6";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import * as PopoverRadix from "@radix-ui/react-popover";

import { useMemo } from "react";

// Add this utility function
function normalizeText(text: string): string {
  const normalized = text
    .toLowerCase()
    .normalize("NFD") // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Optional: remove other special chars
    .trim();

  return normalized;
}

export interface SearchableSelectOption {
  value: string;
  label: string;
  group?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  groupBy?: (option: SearchableSelectOption) => string;
  groupEnabled?: boolean; // opt-in grouping to avoid breaking existing lists
  filterByLabel?: boolean; // opt-in to filter by label instead of value
  emptyText?: string;
  className?: string;
  id?: string;
  error?: string;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Selectează...",
  searchPlaceholder = "Caută...",
  searchValue,
  onSearchChange,
  groupBy,
  groupEnabled = false,
  filterByLabel = false,
  emptyText = "Nu s-au găsit rezultate.",
  className,
  id,
  error,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(normalizeText(value)); // Normalize before storing
  };

  const handleSelect = (optionValue: string) => {
    // Toggle: deselect if already selected
    onValueChange?.(optionValue === value ? "" : optionValue);
    setOpen(false);
    setSearchQuery("");
  };

  const selectedOption = options.find((option) => option.value === value);
  const selectedLabel = selectedOption?.label || "";

  // Memoized filtered options for performance
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const normalized = normalizeText(searchQuery);
    return options.filter((opt) =>
      normalizeText(opt.label).includes(normalized),
    );
  }, [options, searchQuery]);

  // const triggerRef = React.useRef<HTMLInputElement>(null);
  // const isClosing = React.useRef(false);

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (open) {
      // isClosing.current = true;
      setOpen(false);
      // setTimeout(() => {
      //   isClosing.current = false;
      // }, 150);
    } else {
      setOpen(true);
    }
  };

  // Reset search when popover closes
  React.useEffect(() => {
    if (!open) {
      handleSearchChange("");
    }
  }, [open]);

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative w-full">
            {/* <PopoverTrigger asChild> */}
            <input
              ref={inputRef}
              type="text"
              value={searchValue || searchQuery || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                // if (!isClosing.current) {
                //   setOpen(true);
                // }
                setOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && filteredOptions.length > 0) {
                  e.preventDefault();
                  handleSelect(filteredOptions[0].value);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setOpen(false);
                }
              }}
              placeholder={selectedLabel || placeholder}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background",
                "placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                error && "border-red-500 focus-visible:ring-red-500",
                className,
              )}
              aria-expanded={open}
              aria-haspopup="listbox"
              role="combobox"
            />

            {/* </PopoverTrigger> */}
            <button
              type="button"
              onClick={handleChevronClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 cursor-pointer"
              aria-label={open ? "Close dropdown" : "Open dropdown"}
            >
              <FaChevronDown
                className={cn(
                  "h-4 w-4 opacity-50 transition-transform hover:opacity-70",
                  open && "rotate-180",
                )}
              />
            </button>
          </div>
        </PopoverAnchor>
        <PopoverRadix.Portal>
          <PopoverContent
            className={cn(
              "z-50 bg-card border border-border rounded-md shadow-lg",
              "w-[var(--radix-popover-trigger-width)]",
            )}
            sideOffset={4}
            align="start"
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
            onInteractOutside={(e) => {
              // Don't close if clicking the trigger input
              // if (e.target === inputRef?.current) {
              e.preventDefault();
              setOpen(false);
              // }
            }}
          >
            <div className="flex flex-col max-h-[300px] overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {emptyText}
                </div>
              ) : (
                (() => {
                  const getGroup = (opt: SearchableSelectOption) =>
                    (groupBy ? groupBy(opt) : opt.group) || "";
                  const hasGroups =
                    groupEnabled && options.some((o) => getGroup(o));
                  if (!hasGroups) {
                    return (
                      <div className="p-1">
                        {filteredOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className={cn(
                              "flex w-full items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer select-none",
                              "hover:bg-accent hover:text-accent-foreground",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            )}
                          >
                            <FaCheck
                              className={cn(
                                "mr-2 h-4 w-4",
                                value === option.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {option.label}
                          </button>
                        ))}
                      </div>
                    );
                  }
                  const groupsMap = new Map<string, SearchableSelectOption[]>();
                  for (const opt of filteredOptions) {
                    const key = getGroup(opt) || "Altele";
                    if (!groupsMap.has(key)) groupsMap.set(key, []);
                    groupsMap.get(key)!.push(opt);
                  }
                  const groups = Array.from(groupsMap.entries()).sort((a, b) =>
                    a[0].localeCompare(b[0]),
                  );
                  return (
                    <div className="p-1">
                      {groups.map(([groupLabel, opts]) => (
                        <div key={groupLabel} className="mb-2">
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            {groupLabel}
                          </div>
                          {opts
                            .slice()
                            .sort((a, b) => a.label.localeCompare(b.label))
                            .map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={cn(
                                  "flex w-full items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer select-none ml-2",
                                  "hover:bg-accent hover:text-accent-foreground",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                )}
                              >
                                <FaCheck
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    value === option.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {option.label}
                              </button>
                            ))}
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>
          </PopoverContent>
        </PopoverRadix.Portal>
      </Popover>
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
