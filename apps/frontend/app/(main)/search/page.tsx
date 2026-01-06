import type { Metadata } from "next";
import { SearchArchiveClient } from "@/components/search/SearchArchiveClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { constructMetadata } from "@/lib/metadata";

// ... existing imports

export const metadata = constructMetadata({
  title: "Căutare",
  noIndex: true,
});

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const kind = typeof params.kind === "string" ? params.kind : "all";
  const page =
    typeof params.page === "string" ? parseInt(params.page, 10) || 1 : 1;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold">Căutare</h1>
          <SearchArchiveClient
            initialQuery={q}
            initialKind={kind}
            initialPage={page}
          />
        </div>
      </div>
    </div>
  );
}
