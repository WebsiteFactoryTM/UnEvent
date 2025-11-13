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
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={onSearchChange}
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
