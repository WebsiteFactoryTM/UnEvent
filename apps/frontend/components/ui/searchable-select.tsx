"use client";

import * as React from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa6";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  const [inputFocused, setInputFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Detect if we're on a mobile device
  const isMobile = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      (window.matchMedia && window.matchMedia("(max-width: 768px)").matches)
    );
  }, []);

  const handleSearchChange = (value: string) => {
    onSearchChange?.(normalizeText(value)); // Normalize before storing
  };
  const handleInputFocus = () => {
    setInputFocused(true);
  };
  const handleInputBlur = () => {
    // Don't reset on blur if popover is still open - user might be selecting
    // This allows keyboard to stay open while navigating
  };
  // Reset input focus state when popover closes
  React.useEffect(() => {
    if (!open) {
      setInputFocused(false);
    }
  }, [open]);

  const selectedOption = options.find((option) => option.value === value);
  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              error && "border-red-500 focus-visible:ring-red-500",
              className,
            )}
          >
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <FaChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full p-0"
          align="start"
          onOpenAutoFocus={(e) => {
            // Prevent auto-focus on mobile to avoid keyboard popup
            if (isMobile) {
              e.preventDefault();
            }
          }}
        >
          <Command
            filter={(value, search) => {
              const normalizedValue = normalizeText(value);
              const normalizedSearch = normalizeText(search);

              if (normalizedValue.includes(normalizedSearch)) {
                return 1; // Match
              }
              return 0; // No match
            }}
          >
            <CommandInput
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={handleSearchChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              inputMode={isMobile && !inputFocused ? "none" : "text"}
              autoFocus={!isMobile}
            />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              {(() => {
                const getGroup = (opt: SearchableSelectOption) =>
                  (groupBy ? groupBy(opt) : opt.group) || "";
                const hasGroups =
                  groupEnabled && options.some((o) => getGroup(o));
                if (!hasGroups) {
                  return (
                    <CommandGroup>
                      {options.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={filterByLabel ? option.label : option.value}
                          onSelect={() => {
                            onValueChange?.(
                              option.value === value ? "" : option.value,
                            );
                            setOpen(false);
                          }}
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
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  );
                }
                const groupsMap = new Map<string, SearchableSelectOption[]>();
                for (const opt of options) {
                  const key = getGroup(opt) || "Altele";
                  if (!groupsMap.has(key)) groupsMap.set(key, []);
                  groupsMap.get(key)!.push(opt);
                }
                const groups = Array.from(groupsMap.entries()).sort((a, b) =>
                  a[0].localeCompare(b[0]),
                );
                return groups.map(([groupLabel, opts]) => (
                  <CommandGroup key={groupLabel} heading={groupLabel}>
                    {opts
                      .slice()
                      .sort((a, b) => a.label.localeCompare(b.label))
                      .map((option) => (
                        <CommandItem
                          key={option.value}
                          value={filterByLabel ? option.label : option.value}
                          onSelect={() => {
                            onValueChange?.(
                              option.value === value ? "" : option.value,
                            );
                            setOpen(false);
                          }}
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
                        </CommandItem>
                      ))}
                  </CommandGroup>
                ));
              })()}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
