"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchResultCard } from "./SearchResultCard";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchListings } from "@/lib/react-query/search.queries";
import type { SearchKind } from "@/lib/search/types";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const KIND_LABELS: Record<SearchKind, string> = {
  all: "Toate",
  locations: "Locații",
  services: "Servicii",
  events: "Evenimente",
};

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<SearchKind>("all");

  const debouncedQuery = useDebounce(query, 250);

  // Use React Query for search with automatic caching and deduplication
  const { data, isLoading, error } = useSearchListings(
    {
      q: debouncedQuery.trim(),
      kind,
      limit: 5, // Show top 5 in modal
    },
    {
      enabled: open && debouncedQuery.trim().length >= 2,
    },
  );

  const results = data?.docs || [];
  const errorMessage = error ? String(error) : null;

  // Reset query on close
  useEffect(() => {
    if (!open) {
      setQuery("");
      setKind("all");
    }
  }, [open]);

  // Handle "View more" navigation
  const handleViewMore = () => {
    if (query.trim().length >= 2) {
      const params = new URLSearchParams({
        q: query.trim(),
        kind,
      });
      router.push(`/search?${params.toString()}`);
      onOpenChange(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim().length >= 2) {
      handleViewMore();
    }
  };

  const hasResults = results.length > 0;
  const showViewMore = hasResults && query.trim().length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Caută locații, servicii și evenimente
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 sm:gap-4 flex-1 min-h-0">
          {/* Search input */}
          <div className="relative">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Caută..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9"
              autoFocus
            />
          </div>

          {/* Kind selector */}
          <Tabs value={kind} onValueChange={(v) => setKind(v as SearchKind)}>
            <TabsList className="w-full grid grid-cols-4">
              {(["all", "locations", "services", "events"] as SearchKind[]).map(
                (k) => (
                  <TabsTrigger key={k} value={k} className="text-xs sm:text-sm">
                    {KIND_LABELS[k]}
                  </TabsTrigger>
                ),
              )}
            </TabsList>
          </Tabs>

          {/* Results area */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {query.trim().length < 2 && (
              <div className="text-center text-muted-foreground py-8 text-sm">
                Introdu minim 2 caractere pentru a căuta
              </div>
            )}

            {isLoading && query.trim().length >= 2 && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <Skeleton className="w-20 h-20 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errorMessage && !isLoading && (
              <div className="text-center text-destructive py-8 text-sm">
                {errorMessage}
              </div>
            )}

            {!isLoading &&
              !errorMessage &&
              query.trim().length >= 2 &&
              !hasResults && (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  Nu s-au găsit rezultate pentru &quot;{query}&quot;
                </div>
              )}

            {!isLoading && !errorMessage && hasResults && (
              <div className="space-y-1.5 sm:space-y-2">
                {results.map((result) => (
                  <SearchResultCard
                    key={`${result.collection}-${result.id}`}
                    result={result}
                    onClick={() => onOpenChange(false)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* View more button */}
          {showViewMore && (
            <Button
              onClick={handleViewMore}
              className="w-full"
              variant="outline"
            >
              Vezi toate rezultatele ({results.length}+)
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
