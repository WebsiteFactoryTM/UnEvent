"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { searchListings } from "@/lib/search/searchFetch";
import type { SearchKind, SearchResult } from "@/lib/search/types";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaSpinner } from "react-icons/fa6";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";

const KIND_LABELS: Record<SearchKind, string> = {
  all: "Toate",
  locations: "Locații",
  services: "Servicii",
  events: "Evenimente",
};

interface SearchArchiveClientProps {
  initialQuery: string;
  initialKind: string;
  initialPage: number;
}

export function SearchArchiveClient({
  initialQuery,
  initialKind,
  initialPage,
}: SearchArchiveClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [kind, setKind] = useState<SearchKind>(
    (initialKind as SearchKind) || "all",
  );
  const [page, setPage] = useState(initialPage);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalDocs, setTotalDocs] = useState(0);

  const debouncedQuery = useDebounce(query, 300);

  // Update URL when query, kind, or page changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery.trim().length >= 2) {
      params.set("q", debouncedQuery.trim());
    }
    if (kind !== "all") {
      params.set("kind", kind);
    }
    if (page > 1) {
      params.set("page", String(page));
    }

    const newUrl = params.toString()
      ? `/search?${params.toString()}`
      : "/search";
    router.replace(newUrl, { scroll: false });
  }, [debouncedQuery, kind, page, router]);

  // Perform search
  const performSearch = useCallback(
    async (searchQuery: string, searchKind: SearchKind, searchPage: number) => {
      if (!searchQuery.trim() || searchQuery.trim().length < 2) {
        setResults([]);
        setError(null);
        setHasNextPage(false);
        setTotalDocs(0);
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
          limit: 20,
          page: searchPage,
        });

        if (searchPage === 1) {
          setResults(response.docs || []);
        } else {
          // Append for "load more"
          setResults((prev) => [...prev, ...(response.docs || [])]);
        }

        setHasNextPage(response.hasNextPage || false);
        setTotalDocs(response.totalDocs || 0);
      } catch (err) {
        console.error("Search error:", err);
        setError(err instanceof Error ? err.message : "Eroare la căutare");
        setResults([]);
        setHasNextPage(false);
        setTotalDocs(0);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Trigger search when debounced query, kind, or page changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      if (page === 1) {
        // Reset results for new search
        setResults([]);
      }
      performSearch(debouncedQuery, kind, page);
    } else {
      setResults([]);
      setError(null);
      setHasNextPage(false);
      setTotalDocs(0);
      setLoading(false);
    }
  }, [debouncedQuery, kind, page, performSearch]);

  // Handle kind change - reset to page 1
  const handleKindChange = (newKind: string) => {
    setKind(newKind as SearchKind);
    setPage(1);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loading && hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  // Handle Enter key in search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim().length >= 2) {
      setPage(1);
      setResults([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="relative">
        <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Caută locații, servicii sau evenimente..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
            setResults([]);
          }}
          onKeyDown={handleKeyDown}
          className="pl-9"
        />
      </div>

      {/* Kind selector */}
      <Tabs value={kind} onValueChange={handleKindChange}>
        <TabsList className="w-full grid grid-cols-4">
          {(["all", "locations", "services", "events"] as SearchKind[]).map(
            (k) => (
              <TabsTrigger key={k} value={k}>
                {KIND_LABELS[k]}
              </TabsTrigger>
            ),
          )}
        </TabsList>
      </Tabs>

      {/* Results count */}
      {totalDocs > 0 && (
        <div className="text-sm text-muted-foreground">
          {totalDocs} {totalDocs === 1 ? "rezultat găsit" : "rezultate găsite"}
        </div>
      )}

      {/* Loading state */}
      {loading && results.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
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

      {/* Error state */}
      {error && !loading && (
        <div className="text-center text-destructive py-8">{error}</div>
      )}

      {/* Empty state */}
      {!loading &&
        !error &&
        query.trim().length >= 2 &&
        results.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Nu s-au găsit rezultate pentru &quot;{query}&quot;
          </div>
        )}

      {/* Initial state */}
      {query.trim().length < 2 && (
        <div className="text-center text-muted-foreground py-8">
          Introdu minim 2 caractere pentru a căuta
        </div>
      )}

      {/* Results list */}
      {!loading && results.length > 0 && (
        <div className="space-y-1.5 sm:space-y-2">
          {results.map((result) => (
            <SearchResultCard
              key={`${result.collection}-${result.id}-${page}`}
              result={result}
            />
          ))}
        </div>
      )}

      {/* Load more button */}
      {!loading && hasNextPage && results.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button onClick={handleLoadMore} variant="outline" size="lg">
            Încarcă mai multe
          </Button>
        </div>
      )}

      {/* Loading more indicator */}
      {loading && results.length > 0 && (
        <div className="flex justify-center pt-4">
          <FaSpinner className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
