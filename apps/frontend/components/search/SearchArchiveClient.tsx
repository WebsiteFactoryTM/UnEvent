"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { useSearchListings } from "@/lib/react-query/search.queries";
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
  const [query, setQuery] = useState(initialQuery);
  const [kind, setKind] = useState<SearchKind>(
    (initialKind as SearchKind) || "all",
  );
  const [page, setPage] = useState(initialPage);
  const [allResults, setAllResults] = useState<SearchResult[]>([]);

  const debouncedQuery = useDebounce(query, 300);

  // Use React Query for search with automatic caching
  const {
    data,
    isLoading,
    error,
    isFetching,
  } = useSearchListings(
    {
      q: debouncedQuery.trim(),
      kind,
      limit: 20,
      page,
    },
    {
      enabled: debouncedQuery.trim().length >= 2,
    },
  );

  const errorMessage = error ? String(error) : null;

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

  // Accumulate results for pagination (load more)
  useEffect(() => {
    if (data) {
      if (page === 1) {
        // New search - replace results
        setAllResults(data.docs || []);
      } else {
        // Load more - append results
        setAllResults((prev) => [...prev, ...(data.docs || [])]);
      }
    }
  }, [data, page]);

  // Reset accumulated results when query or kind changes
  useEffect(() => {
    setAllResults([]);
    setPage(1);
  }, [debouncedQuery, kind]);

  // Handle kind change - reset to page 1
  const handleKindChange = (newKind: string) => {
    setKind(newKind as SearchKind);
    setPage(1);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!isFetching && data?.hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  // Handle Enter key in search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim().length >= 2) {
      setPage(1);
      setAllResults([]);
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
      {data && data.totalDocs > 0 && (
        <div className="text-sm text-muted-foreground">
          {data.totalDocs} {data.totalDocs === 1 ? "rezultat găsit" : "rezultate găsite"}
        </div>
      )}

      {/* Loading state */}
      {isLoading && allResults.length === 0 && (
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
      {errorMessage && !isLoading && (
        <div className="text-center text-destructive py-8">{errorMessage}</div>
      )}

      {/* Empty state */}
      {!isLoading &&
        !errorMessage &&
        query.trim().length >= 2 &&
        allResults.length === 0 && (
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
      {!isLoading && allResults.length > 0 && (
        <div className="space-y-1.5 sm:space-y-2">
          {allResults.map((result) => (
            <SearchResultCard
              key={`${result.collection}-${result.id}-${page}`}
              result={result}
            />
          ))}
        </div>
      )}

      {/* Load more button */}
      {!isFetching && data?.hasNextPage && allResults.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button onClick={handleLoadMore} variant="outline" size="lg">
            Încarcă mai multe
          </Button>
        </div>
      )}

      {/* Loading more indicator */}
      {isFetching && allResults.length > 0 && (
        <div className="flex justify-center pt-4">
          <FaSpinner className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
