"use client";

import { useState, useEffect, useCallback } from "react";
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
import { searchListings } from "@/lib/search/searchFetch";
import type { SearchKind, SearchResult } from "@/lib/search/types";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 250);

  // Search function
  const performSearch = useCallback(
    async (searchQuery: string, searchKind: SearchKind) => {
      if (!searchQuery.trim() || searchQuery.trim().length < 2) {
        setResults([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const collections =
          searchKind === "all"
            ? undefined
            : [searchKind as "locations" | "services" | "events"];

        const response = await searchListings({
          q: searchQuery.trim(),
          kind: searchKind,
          collections,
          limit: 5, // Show top 5 in modal
        });

        setResults(response.docs || []);
      } catch (err) {
        console.error("Search error:", err);
        setError(err instanceof Error ? err.message : "Eroare la căutare");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Trigger search when debounced query or kind changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      performSearch(debouncedQuery, kind);
    } else {
      setResults([]);
      setError(null);
      setLoading(false);
    }
  }, [debouncedQuery, kind, performSearch]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery("");
      setKind("all");
      setResults([]);
      setError(null);
      setLoading(false);
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

            {loading && query.trim().length >= 2 && (
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

            {error && !loading && (
              <div className="text-center text-destructive py-8 text-sm">
                {error}
              </div>
            )}

            {!loading && !error && query.trim().length >= 2 && !hasResults && (
              <div className="text-center text-muted-foreground py-8 text-sm">
                Nu s-au găsit rezultate pentru &quot;{query}&quot;
              </div>
            )}

            {!loading && !error && hasResults && (
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
