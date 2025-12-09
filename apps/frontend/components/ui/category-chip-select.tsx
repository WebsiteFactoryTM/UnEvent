"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { FaChevronDown } from "react-icons/fa6";
import { cn } from "@/lib/utils";

// Utility function to normalize text for search
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

interface CategoryChipSelectProps {
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

export function CategoryChipSelect({
  options,
  value = "",
  onChange,
  placeholder = "Selectează...",
  id,
  className,
}: CategoryChipSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Find selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption?.label || "";

  // Memoized filtered options for performance
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    const normalized = normalizeText(searchQuery);
    return options.filter((opt) =>
      normalizeText(opt.label).includes(normalized),
    );
  }, [options, searchQuery]);

  // Handle option selection
  const handleSelect = (optionValue: string) => {
    // Toggle: deselect if already selected
    onChange(optionValue === value ? "" : optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Reset search when popover closes
  React.useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Keyboard support
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredOptions.length > 0) {
      e.preventDefault();
      handleSelect(filteredOptions[0].value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Anchor asChild>
        <div className="relative w-full">
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              setIsOpen(true);
            }}
            onClick={(e) => {
              setIsOpen(!isOpen);
            }}
            onKeyDown={handleKeyDown}
            placeholder={selectedLabel || placeholder}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            role="combobox"
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault(); // avoid focus changes
              e.stopPropagation(); // do not bubble to Popover
              setIsOpen((prev) => !prev);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 cursor-pointer"
            aria-label={isOpen ? "Close dropdown" : "Open dropdown"}
          >
            <FaChevronDown
              className={cn(
                "h-4 w-4 opacity-50 transition-transform hover:opacity-70",
                isOpen && "rotate-180",
              )}
            />
          </button>
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          sideOffset={4}
          align="start"
          className={cn(
            "z-50 bg-card border border-border rounded-md shadow-lg",
            "w-[var(--radix-popover-trigger-width)]",
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            // Don't close if clicking the input

            e.preventDefault();
            setIsOpen(false);
          }}
        >
          <div className="flex flex-wrap gap-2 p-4 max-h-[300px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="w-full py-6 text-center text-sm text-muted-foreground">
                Nu s-au găsit rezultate.
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer select-none",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                    )}
                    aria-selected={isSelected}
                    role="option"
                  >
                    {option.label}
                  </button>
                );
              })
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
