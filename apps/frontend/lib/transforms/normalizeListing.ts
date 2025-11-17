import type { Listing } from "@/types/listings";

export function normalizeListing<
  T extends Record<string, any> | null | undefined,
>(doc: T): T | Listing | null | undefined {
  if (!doc || typeof doc !== "object") return doc;
  if ("moderationStatus" in doc && !("status" in doc)) {
    return { ...doc, status: (doc as any).moderationStatus } as Listing; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
  if ("moderationStatus" in doc) {
    return {
      ...(doc as any),
      status: (doc as any).moderationStatus,
    } as Listing; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
  return doc as any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function normalizeListings<T extends Array<Record<string, any>>>(
  docs: T,
): Listing[] {
  return (docs as any[]).map((d) => normalizeListing(d) as Listing);
}
