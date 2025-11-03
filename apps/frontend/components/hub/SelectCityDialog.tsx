"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

type ListingType = "locatii" | "servicii" | "evenimente";

interface SelectCityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingType: ListingType;
  cities: { slug: string; label: string }[];
  onConfirm: (citySlug: string) => void;
}

export function SelectCityDialog({
  open,
  onOpenChange,
  listingType,
  cities,
  onConfirm,
}: SelectCityDialogProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string>("");
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return cities.filter(
      (c) => c.label.toLowerCase().includes(q) || c.slug.includes(q),
    );
  }, [query, cities]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Alege orașul</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Command shouldFilter={false}>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Caută orașul..."
              aria-label="Caută orașul"
            />
            <CommandList>
              <CommandEmpty>Nu s-au găsit orașe</CommandEmpty>
              <CommandGroup>
                {filtered.map((c) => (
                  <CommandItem
                    key={c.slug}
                    value={c.slug}
                    onSelect={(slug) => setSelected(slug)}
                    aria-selected={selected === c.slug}
                  >
                    {c.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Anulează
            </Button>
            <Button
              onClick={() => {
                if (!selected) return;
                try {
                  window.localStorage.setItem("lastCity", selected);
                } catch {}
                onConfirm(selected);
                onOpenChange(false);
              }}
              disabled={!selected}
            >
              Confirmă
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
