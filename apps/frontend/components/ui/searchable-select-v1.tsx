"use client";

import * as React from "react";
import { useMemo } from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa6";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  /** Controlled search value (for async/API usage) */
  searchValue?: string;
  /** Called whenever user types – perfect place to call your API */
  onSearchChange?: (value: string) => void;
  /** Optional custom group function */
  groupBy?: (option: SearchableSelectOption) => string;
  /** Enable grouping (uses group or groupBy) */
  groupEnabled?: boolean;
  /** If true, filter by label instead of value */
  filterByLabel?: boolean;
  emptyText?: string;
  className?: string;
  id?: string;
  error?: string;
  /** How to render options – "list" (default) or "chip" style */
  variant?: "list" | "chip";
}

/** Normalize text for diacritics-insensitive search */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function SearchableSelectV1({
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
  variant = "list",
}: SearchableSelectProps) {
  // Detect if we're on a mobile device
  const isMobile = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      (window.matchMedia && window.matchMedia("(max-width: 768px)").matches)
    );
  }, []);

  const [open, setOpen] = React.useState(false);
  const [internalSearch, setInternalSearch] = React.useState("");
  const [inputFocused, setInputFocused] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listboxId = React.useId();

  const selectedOption = options.find((o) => o.value === value);
  const selectedLabel = selectedOption?.label ?? "";

  const effectiveSearch = searchValue ?? internalSearch;

  const handleSearchChange = (next: string) => {
    setInternalSearch(next);
    onSearchChange?.(next); // raw string so you can call APIs directly
  };

  const handleInputFocus = () => {
    setInputFocused(true);
  };

  const handleInputBlur = () => {
    // Don't reset on blur if popover is still open - user might be selecting
  };

  const handleSelect = (optionValue: string) => {
    const nextValue = optionValue === value ? "" : optionValue; // toggle deselect
    onValueChange?.(nextValue);
    setOpen(false);
    setActiveIndex(-1);
    // Important: we do NOT clear `internalSearch` here. The `useEffect` that
    // listens to `open` will clear it after the popover actually closes, so the
    // list does not visually "jump" to the full set of options right before
    // closing.
  };

  const filteredOptions = useMemo(() => {
    if (!effectiveSearch) return options;

    const normalizedQuery = normalizeText(effectiveSearch);
    return options.filter((opt) => {
      const target = filterByLabel ? opt.label : opt.value || opt.label;
      return normalizeText(target).includes(normalizedQuery);
    });
  }, [options, effectiveSearch, filterByLabel]);

  // Reset activeIndex and input focus when options or open state changes
  React.useEffect(() => {
    if (!open) {
      setActiveIndex(-1);
      setInternalSearch("");
      setInputFocused(false);
    } else {
      setActiveIndex(filteredOptions.length ? 0 : -1);
    }
  }, [open, filteredOptions.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setOpen(true);
      if (filteredOptions.length) setActiveIndex(0);
      return;
    }

    if (!filteredOptions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev + 1;
        return next >= filteredOptions.length ? 0 : next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? filteredOptions.length - 1 : next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      const option =
        activeIndex >= 0 ? filteredOptions[activeIndex] : filteredOptions[0];
      if (option) handleSelect(option.value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const renderOptionButton = (
    option: SearchableSelectOption,
    isActive: boolean,
  ) => (
    <button
      key={option.value}
      type="button"
      role="option"
      aria-selected={value === option.value}
      onClick={() => handleSelect(option.value)}
      className={cn(
        variant === "chip"
          ? cn(
              "inline-flex items-center justify-center rounded-full px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm font-medium transition-colors cursor-pointer select-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              value === option.value
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            )
          : cn(
              "flex items-center px-2 py-1.5 text-sm cursor-pointer select-none rounded-sm w-full",
              "hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent text-accent-foreground",
            ),
      )}
    >
      {variant === "chip" ? (
        option.label
      ) : (
        <>
          <FaCheck
            className={cn(
              "mr-2 h-4 w-4",
              value === option.value ? "opacity-100" : "opacity-0",
            )}
          />
          {option.label}
        </>
      )}
    </button>
  );

  const groupedContent = () => {
    const getGroup = (opt: SearchableSelectOption) =>
      (groupBy ? groupBy(opt) : opt.group) || "";

    const hasGroups = groupEnabled && options.some((o) => getGroup(o));

    if (!hasGroups) {
      return (
        <div
          className={cn("p-1", variant === "chip" && "flex flex-wrap gap-2")}
          role="listbox"
          id={listboxId}
        >
          {filteredOptions.map((option, index) =>
            renderOptionButton(option, index === activeIndex),
          )}
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
      <div className="p-1" role="listbox" id={listboxId}>
        {groups.map(([groupLabel, opts]) => (
          <div key={groupLabel} className="mb-2">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              {groupLabel}
            </div>
            {opts
              .slice()
              .sort((a, b) => a.label.localeCompare(b.label))
              .map((option) => {
                const index = filteredOptions.findIndex(
                  (o) => o.value === option.value,
                );
                return (
                  <div key={option.value} className="ml-2">
                    {renderOptionButton(option, index === activeIndex)}
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="relative w-full">
            <input
              id={id}
              ref={inputRef}
              type="text"
              value={open ? effectiveSearch : selectedLabel}
              onFocus={() => {
                setOpen(true);
                handleInputFocus();
              }}
              onBlur={handleInputBlur}
              onChange={(e) => {
                if (!open) setOpen(true);
                handleSearchChange(e.target.value);
              }}
              inputMode={isMobile && !inputFocused ? "none" : "text"}
              onKeyDown={handleKeyDown}
              placeholder={selectedLabel || placeholder}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background",
                "placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                error && "border-red-500 focus-visible:ring-red-500",
                className,
              )}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-activedescendant={
                activeIndex >= 0 && filteredOptions[activeIndex]
                  ? `${listboxId}-option-${activeIndex}`
                  : undefined
              }
            />

            {/* Chevron – toggles without flicker */}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen((prev) => !prev);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 cursor-pointer"
              aria-label={open ? "Închide lista" : "Deschide lista"}
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

        <PopoverContent
          className={cn(
            "z-50 bg-card border border-border rounded-md shadow-lg",
            "w-[var(--radix-popover-trigger-width)] p-0",
          )}
          sideOffset={4}
          align="start"
          onOpenAutoFocus={(e) => {
            // Prevent auto-focus on mobile to avoid keyboard popup
            if (isMobile) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            // Don't close if clicking back into the input
            if (
              inputRef.current &&
              e.target instanceof Node &&
              inputRef.current.contains(e.target)
            ) {
              e.preventDefault();
              return;
            }
            setOpen(false);
          }}
        >
          <div className="flex flex-col max-h-[300px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              groupedContent()
            )}
          </div>
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
